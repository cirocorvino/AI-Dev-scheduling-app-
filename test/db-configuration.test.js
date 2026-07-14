import assert from 'node:assert/strict';
import test from 'node:test';

import {
    DATABASE_CONFIGURATION_KIND,
    createDatabaseConfiguration,
    databaseUrlFromConfiguration,
    emptyDatabaseConfiguration,
    normalizeDatabaseConfiguration,
    normalizeDatabasePath
} from '../js/db-configuration.js';

test('crea una configurazione senza database predefinito quando il campo è vuoto', () => {
    assert.deepEqual(createDatabaseConfiguration(''), {
        kind: DATABASE_CONFIGURATION_KIND,
        schemaVersion: 1
    });
    assert.equal(databaseUrlFromConfiguration(emptyDatabaseConfiguration()), null);
});

test('normalizza il database predefinito e ne costruisce l’URL relativo', () => {
    const configuration = normalizeDatabaseConfiguration({
        kind: DATABASE_CONFIGURATION_KIND,
        schemaVersion: 1,
        defaultDatabase: './data/user/percorso-personale.json'
    });

    assert.equal(configuration.defaultDatabase, 'data/user/percorso-personale.json');
    assert.equal(databaseUrlFromConfiguration(configuration), 'data/user/percorso-personale.json');
});

test('rifiuta percorsi assoluti, attraversamenti e nomi riservati', () => {
    assert.throws(
        () => createDatabaseConfiguration('../private/database.json'),
        /segmenti non consentiti/i
    );
    assert.throws(
        () => normalizeDatabasePath('C:\\database.json'),
        /relativo alla root/i
    );
    assert.throws(
        () => createDatabaseConfiguration('data/user/db-configuration.json'),
        /riservato/i
    );
});
