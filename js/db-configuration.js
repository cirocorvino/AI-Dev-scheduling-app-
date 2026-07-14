export const DATABASE_CONFIGURATION_KIND = 'learning-planner-db-configuration';
export const DATABASE_CONFIGURATION_VERSION = 1;
export const DATABASE_CONFIGURATION_FILE = 'db-configuration.json';
export const DATABASE_CONFIGURATION_URL = `data/user/${DATABASE_CONFIGURATION_FILE}`;
export const DEFAULT_DATABASE_PATH = 'data/user/organizer-data.json';

function configurationError(message) {
    return new Error(`Configurazione database non valida: ${message}`);
}

export function normalizeDatabasePath(value) {
    const path = String(value || '')
        .trim()
        .replace(/\\/g, '/')
        .replace(/^\.\//, '');

    if (!path) throw configurationError('il percorso del file è obbligatorio');
    if (path.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(path)) {
        throw configurationError('il percorso deve essere relativo alla root del progetto');
    }

    const segments = path.split('/');
    if (segments.some(segment => !segment || segment === '.' || segment === '..')) {
        throw configurationError('il percorso contiene segmenti non consentiti');
    }
    if (segments.some(segment => /[<>:"|?*#\u0000-\u001f]/.test(segment))) {
        throw configurationError('il percorso contiene caratteri non consentiti');
    }

    const fileName = segments.at(-1);
    if (!fileName.toLowerCase().endsWith('.json')) {
        throw configurationError('il file deve avere estensione .json');
    }
    if (fileName.toLowerCase() === DATABASE_CONFIGURATION_FILE) {
        throw configurationError(`${DATABASE_CONFIGURATION_FILE} è riservato alla configurazione`);
    }
    return segments.join('/');
}

export function emptyDatabaseConfiguration() {
    return {
        kind: DATABASE_CONFIGURATION_KIND,
        schemaVersion: DATABASE_CONFIGURATION_VERSION
    };
}

export function createDatabaseConfiguration(databasePath) {
    const configuration = emptyDatabaseConfiguration();
    if (!String(databasePath || '').trim()) return configuration;
    configuration.defaultDatabase = normalizeDatabasePath(databasePath);
    return configuration;
}

export function normalizeDatabaseConfiguration(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw configurationError('il contenuto deve essere un oggetto JSON');
    }
    if (input.kind !== DATABASE_CONFIGURATION_KIND) {
        throw configurationError(`kind deve essere ${DATABASE_CONFIGURATION_KIND}`);
    }
    if (input.schemaVersion !== DATABASE_CONFIGURATION_VERSION) {
        throw configurationError(`schemaVersion deve essere ${DATABASE_CONFIGURATION_VERSION}`);
    }
    if (input.defaultDatabase === undefined || input.defaultDatabase === null || input.defaultDatabase === '') {
        return emptyDatabaseConfiguration();
    }
    if (typeof input.defaultDatabase !== 'string') {
        throw configurationError('defaultDatabase deve essere un percorso testuale');
    }
    return createDatabaseConfiguration(input.defaultDatabase);
}

export function databaseUrlFromConfiguration(configuration) {
    const normalized = normalizeDatabaseConfiguration(configuration);
    if (!normalized.defaultDatabase) return null;
    return normalized.defaultDatabase
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
}

export function databaseFileNameFromPath(databasePath) {
    return normalizeDatabasePath(databasePath).split('/').at(-1);
}
