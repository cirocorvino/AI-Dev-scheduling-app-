import {
    createEmptyDatabase,
    normalizeDatabase,
    replacePlan,
    snapshotDatabase,
    updateDatabase
} from './model.js';

const USER_DATABASE_URL = 'data/user/organizer-data.json';
const EXAMPLE_DATABASE_URL = 'data/examples/organizer-example.json';

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
    #fileHandle = null;
    #fileName = 'learning-planner.json';
    #isDemo = false;
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
            status: this.status
        };
        this.#listeners.forEach(listener => listener(snapshot));
    }

    #setStatus(message, level = 'info') {
        this.#status = { message, level };
    }

    #apply(input, { fileName, fileHandle = null, dirty = false, message, level, isDemo = false } = {}) {
        const result = normalizeDatabase(input);
        this.#database = result.database;
        this.#warnings = result.warnings || [];
        this.#fileHandle = fileHandle;
        this.#fileName = fileName || safeFileName(result.database.metadata.name);
        this.#isDemo = isDemo;
        this.#dirty = dirty || result.migrated;
        this.#setStatus(
            message || (result.migrated
                ? 'Database v1 migrato: salva una copia nel formato v2'
                : `Aperto ${this.#fileName}`),
            level || (this.#dirty ? 'warning' : 'success')
        );
        this.#emit();
        return result;
    }

    async initialize() {
        let userDatabaseError;

        try {
            const payload = await fetchJson(USER_DATABASE_URL);
            this.#apply(payload, {
                fileName: 'organizer-data.json'
            });
            return;
        } catch (error) {
            userDatabaseError = error;
        }

        try {
            const payload = await fetchJson(EXAMPLE_DATABASE_URL);
            const userDatabaseMissing = userDatabaseError?.status === 404;
            this.#apply(payload, {
                fileName: 'learning-planner-example.json',
                message: userDatabaseMissing
                    ? 'Nessun database utente: esempio generico caricato'
                    : `Database utente non disponibile: esempio generico caricato (${userDatabaseError.message})`,
                level: userDatabaseMissing ? 'success' : 'warning',
                isDemo: true
            });
        } catch (exampleError) {
            this.#database = createEmptyDatabase();
            this.#dirty = true;
            this.#fileName = 'learning-planner.json';
            this.#isDemo = false;
            this.#setStatus(
                `Database utente ed esempio non disponibili: ${exampleError.message}`,
                'warning'
            );
            this.#emit();
        }
    }

    createNew() {
        this.#database = createEmptyDatabase();
        this.#dirty = true;
        this.#fileHandle = null;
        this.#fileName = 'learning-planner.json';
        this.#isDemo = false;
        this.#warnings = [];
        this.#setStatus('Nuovo database non ancora salvato', 'warning');
        this.#emit();
    }

    async openDatabase(fileInput) {
        if ('showOpenFilePicker' in window) {
            try {
                const [handle] = await window.showOpenFilePicker({
                    multiple: false,
                    types: [{
                        description: 'Database Learning Path Planner',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
                const file = await handle.getFile();
                const payload = await readJsonFile(file);
                this.#apply(payload, { fileName: file.name, fileHandle: handle });
            } catch (error) {
                if (error.name !== 'AbortError') throw error;
            }
            return;
        }
        fileInput.click();
    }

    async loadDatabaseFile(file) {
        const payload = await readJsonFile(file);
        this.#apply(payload, { fileName: file.name, fileHandle: null });
    }

    update(updater, message = 'Modifiche non salvate') {
        this.#database = updateDatabase(this.#database, updater);
        this.#dirty = true;
        this.#warnings = [];
        this.#setStatus(message, 'warning');
        this.#emit();
    }

    async importPlanFile(file) {
        const payload = await readJsonFile(file);
        this.#database = replacePlan(this.#database, payload);
        this.#dirty = true;
        this.#warnings = [];
        this.#setStatus(`Programma importato da ${file.name}: salva il database`, 'warning');
        this.#emit();
    }

    async save() {
        const snapshot = snapshotDatabase(this.#database);
        const suggestedName = safeFileName(this.#fileName || snapshot.metadata.name);

        try {
            if (this.#fileHandle?.createWritable) {
                const writable = await this.#fileHandle.createWritable();
                await writable.write(JSON.stringify(snapshot, null, 2));
                await writable.close();
                this.#database = snapshot;
                this.#dirty = false;
                this.#setStatus(`Salvato ${this.#fileName}`, 'success');
                this.#emit();
                return;
            }

            if ('showSaveFilePicker' in window) {
                this.#fileHandle = await window.showSaveFilePicker({
                    suggestedName,
                    types: [{
                        description: 'Database Learning Path Planner',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
                const writable = await this.#fileHandle.createWritable();
                await writable.write(JSON.stringify(snapshot, null, 2));
                await writable.close();
                this.#fileName = this.#fileHandle.name || suggestedName;
            } else {
                downloadJson(snapshot, suggestedName);
                this.#fileName = suggestedName;
            }

            this.#database = snapshot;
            this.#dirty = false;
            this.#setStatus(`Salvato ${this.#fileName}`, 'success');
            this.#emit();
        } catch (error) {
            if (error.name !== 'AbortError') throw error;
        }
    }
}

export const plannerStore = new PlannerStore();
