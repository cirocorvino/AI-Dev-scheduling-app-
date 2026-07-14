import {
    createEmptyDatabase,
    normalizeDatabase,
    replacePlan,
    snapshotDatabase,
    updateDatabase
} from './model.js';
import {
    DATABASE_CONFIGURATION_FILE,
    DATABASE_CONFIGURATION_URL,
    DEFAULT_DATABASE_PATH,
    createDatabaseConfiguration,
    databaseFileNameFromPath,
    databaseUrlFromConfiguration,
    emptyDatabaseConfiguration,
    normalizeDatabaseConfiguration
} from './db-configuration.js';

const USER_DATABASE_URL = DEFAULT_DATABASE_PATH;
const EXAMPLE_DATABASE_URL = 'data/examples/organizer-example.json';
const CONFIGURATION_WARNING_PREFIX = 'Configurazione database:';

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function safeFileName(value, fallback = 'learning-planner.json') {
    const name = String(value || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
    return name ? `${name.replace(/\.json$/i, '')}.json` : fallback;
}

function downloadJson(database, fileName) {
    const blob = new Blob([JSON.stringify(database, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
}

async function readJsonFile(file) {
    const text = await file.text();
    try {
        return JSON.parse(text);
    } catch (error) {
        throw new Error(`JSON non valido in ${file.name}: ${error.message}`);
    }
}

async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
    }

    try {
        return await response.json();
    } catch (error) {
        throw new Error(`JSON non valido in ${url}: ${error.message}`);
    }
}

export class PlannerStore {
    #database = null;
    #dirty = false;
    #fileName = 'learning-planner.json';
    #isDemo = false;
    #databaseConfiguration = emptyDatabaseConfiguration();
    #activeDatabasePath = USER_DATABASE_URL;
    #listeners = new Set();
    #status = { message: 'Inizializzazione…', level: 'info' };
    #warnings = [];

    get database() {
        return this.#database ? clone(this.#database) : null;
    }

    get dirty() {
        return this.#dirty;
    }

    get fileName() {
        return this.#fileName;
    }

    get isDemo() {
        return this.#isDemo;
    }

    get databaseConfiguration() {
        return clone(this.#databaseConfiguration);
    }

    get status() {
        return { ...this.#status, dirty: this.#dirty, warnings: [...this.#warnings] };
    }

    subscribe(listener) {
        this.#listeners.add(listener);
        return () => this.#listeners.delete(listener);
    }

    #emit() {
        const snapshot = {
            database: this.database,
            dirty: this.#dirty,
            fileName: this.#fileName,
            isDemo: this.#isDemo,
            databaseConfiguration: this.databaseConfiguration,
            status: this.status
        };
        this.#listeners.forEach(listener => listener(snapshot));
    }

    #setStatus(message, level = 'info') {
        this.#status = { message, level };
    }

    #apply(input, {
        fileName,
        dirty = false,
        message,
        level,
        isDemo = false,
        extraWarnings = [],
        activeDatabasePath,
        databaseConfiguration
    } = {}) {
        const result = normalizeDatabase(input);
        this.#database = result.database;
        this.#warnings = [...(result.warnings || []), ...extraWarnings];
        this.#fileName = fileName || safeFileName(result.database.metadata.name);
        this.#isDemo = isDemo;
        this.#dirty = dirty || result.migrated;
        if (activeDatabasePath) this.#activeDatabasePath = activeDatabasePath;
        if (databaseConfiguration) this.#databaseConfiguration = databaseConfiguration;
        this.#setStatus(
            message || (result.migrated
                ? 'Database v1 migrato: salva una copia nel formato v2'
                : `Aperto ${this.#fileName}`),
            level || (this.#dirty || this.#warnings.length ? 'warning' : 'success')
        );
        this.#emit();
        return result;
    }

    async initialize() {
        const startupWarnings = [];
        let configurationPayload = null;

        try {
            configurationPayload = await fetchJson(DATABASE_CONFIGURATION_URL);
        } catch (error) {
            this.#databaseConfiguration = emptyDatabaseConfiguration();
            if (error.status !== 404) {
                startupWarnings.push(
                    `${CONFIGURATION_WARNING_PREFIX} ${DATABASE_CONFIGURATION_URL} non utilizzabile (${error.message}); caricato il fallback successivo.`
                );
            }
        }

        if (configurationPayload) {
            try {
                this.#databaseConfiguration = normalizeDatabaseConfiguration(configurationPayload);
            } catch (error) {
                this.#databaseConfiguration = emptyDatabaseConfiguration();
                startupWarnings.push(
                    `${CONFIGURATION_WARNING_PREFIX} ${error.message}; caricato il fallback successivo.`
                );
            }
        }

        const configuredDatabaseUrl = databaseUrlFromConfiguration(this.#databaseConfiguration);
        if (configuredDatabaseUrl) {
            try {
                const payload = await fetchJson(configuredDatabaseUrl);
                this.#apply(payload, {
                    fileName: databaseFileNameFromPath(this.#databaseConfiguration.defaultDatabase),
                    message: `Database predefinito caricato: ${configuredDatabaseUrl}`,
                    extraWarnings: startupWarnings,
                    activeDatabasePath: this.#databaseConfiguration.defaultDatabase
                });
                return;
            } catch (error) {
                startupWarnings.push(
                    `${CONFIGURATION_WARNING_PREFIX} impossibile caricare ${configuredDatabaseUrl} (${error.message}); caricato il fallback successivo.`
                );
            }
        }

        await this.#loadFallbackDatabase(startupWarnings);
    }

    async #loadFallbackDatabase(startupWarnings) {
        let userDatabaseError;

        try {
            const payload = await fetchJson(USER_DATABASE_URL);
            this.#apply(payload, {
                fileName: 'organizer-data.json',
                extraWarnings: startupWarnings,
                activeDatabasePath: USER_DATABASE_URL
            });
            return;
        } catch (error) {
            userDatabaseError = error;
        }

        try {
            const payload = await fetchJson(EXAMPLE_DATABASE_URL);
            this.#apply(payload, {
                fileName: 'learning-planner-example.json',
                message: 'Nessun database utente: esempio generico caricato',
                level: startupWarnings.length === 0 ? 'success' : 'warning',
                isDemo: true,
                extraWarnings: startupWarnings,
                activeDatabasePath: USER_DATABASE_URL
            });
        } catch (exampleError) {
            this.#database = createEmptyDatabase();
            this.#dirty = true;
            this.#fileName = 'learning-planner.json';
            this.#isDemo = false;
            this.#activeDatabasePath = USER_DATABASE_URL;
            this.#warnings = [
                ...startupWarnings,
                `Database fallback non disponibili: ${userDatabaseError.message}; ${exampleError.message}`
            ];
            this.#setStatus(
                `Database utente ed esempio non disponibili: ${exampleError.message}`,
                'warning'
            );
            this.#emit();
        }
    }

    #removeConfigurationWarnings() {
        this.#warnings = this.#warnings.filter(warning => !warning.startsWith(CONFIGURATION_WARNING_PREFIX));
    }

    setDefaultDatabaseConfiguration(databasePath) {
        const configuration = createDatabaseConfiguration(databasePath);
        this.#databaseConfiguration = configuration;
        this.#activeDatabasePath = configuration.defaultDatabase || USER_DATABASE_URL;
        this.#dirty = true;
        this.#removeConfigurationWarnings();
        this.#setStatus(
            configuration.defaultDatabase
                ? `Percorso database aggiornato: premi Salva per scaricare ${DATABASE_CONFIGURATION_FILE}`
                : `Database convenzionale ripristinato: al salvataggio verrà scaricato organizer-data.json`,
            'warning'
        );
        this.#emit();
    }

    createNew() {
        this.#database = createEmptyDatabase();
        this.#dirty = true;
        this.#fileName = 'organizer-data.json';
        this.#isDemo = false;
        this.#databaseConfiguration = emptyDatabaseConfiguration();
        this.#activeDatabasePath = USER_DATABASE_URL;
        this.#warnings = [];
        this.#setStatus('Nuovo database non ancora salvato', 'warning');
        this.#emit();
    }

    openDatabase(fileInput) {
        fileInput.click();
    }

    async loadDatabaseFile(file) {
        const payload = await readJsonFile(file);
        const activeDatabasePath = file.name.toLowerCase() === 'organizer-data.json'
            ? USER_DATABASE_URL
            : `data/user/${file.name}`;
        const databaseConfiguration = activeDatabasePath === USER_DATABASE_URL
            ? emptyDatabaseConfiguration()
            : createDatabaseConfiguration(activeDatabasePath);
        this.#apply(payload, {
            fileName: file.name,
            activeDatabasePath,
            databaseConfiguration
        });
    }

    update(updater, message = 'Modifiche non salvate') {
        this.#database = updateDatabase(this.#database, updater);
        this.#dirty = true;
        this.#warnings = this.#warnings.filter(warning => warning.startsWith(CONFIGURATION_WARNING_PREFIX));
        this.#setStatus(message, 'warning');
        this.#emit();
    }

    async importPlanFile(file) {
        const payload = await readJsonFile(file);
        this.#database = replacePlan(this.#database, payload);
        this.#dirty = true;
        this.#warnings = this.#warnings.filter(warning => warning.startsWith(CONFIGURATION_WARNING_PREFIX));
        this.#setStatus(`Programma importato da ${file.name}: salva il database`, 'warning');
        this.#emit();
    }

    async save() {
        const snapshot = snapshotDatabase(this.#database);
        const targetPath = this.#activeDatabasePath || USER_DATABASE_URL;
        const targetName = databaseFileNameFromPath(targetPath);
        const usesConventionalDatabase = targetPath === USER_DATABASE_URL;

        downloadJson(snapshot, targetName);
        this.#databaseConfiguration = usesConventionalDatabase
            ? emptyDatabaseConfiguration()
            : createDatabaseConfiguration(targetPath);
        if (!usesConventionalDatabase) {
            downloadJson(this.#databaseConfiguration, DATABASE_CONFIGURATION_FILE);
        }

        this.#database = snapshot;
        this.#fileName = targetName;
        this.#dirty = false;
        this.#isDemo = false;
        this.#removeConfigurationWarnings();
        this.#setStatus(
            usesConventionalDatabase
                ? 'Scaricato organizer-data.json: copialo in data/user'
                : `Scaricati ${targetName} e ${DATABASE_CONFIGURATION_FILE}: copiali nei percorsi configurati`,
            'success'
        );
        this.#emit();
    }
}

export const plannerStore = new PlannerStore();
