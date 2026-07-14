import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createDatabaseConfiguration, emptyDatabaseConfiguration } from '../js/db-configuration.js';
import { PlannerStore } from '../js/store.js';

const exampleUrl = new URL('../data/examples/organizer-example.json', import.meta.url);
const example = JSON.parse(await readFile(exampleUrl, 'utf8'));

function jsonResponse(payload) {
    return {
        ok: true,
        status: 200,
        async json() {
            return structuredClone(payload);
        }
    };
}

function notFoundResponse() {
    return { ok: false, status: 404 };
}

function recordDownloads(t) {
    const originalDocument = globalThis.document;
    const originalUrl = globalThis.URL;
    const blobs = new Map();
    const downloads = [];
    let nextBlobId = 0;

    globalThis.URL = {
        createObjectURL(blob) {
            const url = `blob:test-${nextBlobId += 1}`;
            blobs.set(url, blob);
            return url;
        },
        revokeObjectURL() {}
    };
    globalThis.document = {
        createElement(tagName) {
            assert.equal(tagName, 'a');
            return {
                href: '',
                download: '',
                click() {
                    downloads.push({ fileName: this.download, blob: blobs.get(this.href) });
                }
            };
        }
    };
    t.after(() => {
        globalThis.URL = originalUrl;
        if (originalDocument === undefined) delete globalThis.document;
        else globalThis.document = originalDocument;
    });
    return downloads;
}

test('carica con priorità il database indicato dalla configurazione', async t => {
    const originalFetch = globalThis.fetch;
    const requestedUrls = [];
    t.after(() => { globalThis.fetch = originalFetch; });

    globalThis.fetch = async url => {
        requestedUrls.push(url);
        if (url === 'data/user/db-configuration.json') {
            return jsonResponse(createDatabaseConfiguration('data/user/percorso-ufficiale.json'));
        }
        if (url === 'data/user/percorso-ufficiale.json') return jsonResponse(example);
        return notFoundResponse();
    };

    const store = new PlannerStore();
    await store.initialize();

    assert.deepEqual(requestedUrls, [
        'data/user/db-configuration.json',
        'data/user/percorso-ufficiale.json'
    ]);
    assert.equal(store.fileName, 'percorso-ufficiale.json');
    assert.equal(store.databaseConfiguration.defaultDatabase, 'data/user/percorso-ufficiale.json');
    assert.match(store.status.message, /database predefinito caricato/i);
    assert.deepEqual(store.status.warnings, []);
});

test('se la configurazione manca carica organizer-data.json senza avvisi', async t => {
    const originalFetch = globalThis.fetch;
    const requestedUrls = [];
    let snapshot;
    t.after(() => { globalThis.fetch = originalFetch; });

    globalThis.fetch = async url => {
        requestedUrls.push(url);
        if (url === 'data/user/db-configuration.json') return notFoundResponse();
        return jsonResponse(example);
    };

    const store = new PlannerStore();
    store.subscribe(value => { snapshot = value; });
    await store.initialize();

    assert.deepEqual(requestedUrls, [
        'data/user/db-configuration.json',
        'data/user/organizer-data.json'
    ]);
    assert.equal(store.fileName, 'organizer-data.json');
    assert.deepEqual(store.status.warnings, []);
    assert.equal(store.status.level, 'success');
    assert.equal(snapshot.isDemo, false);
});

test('se la configurazione contiene un percorso non valido avvisa e usa i fallback', async t => {
    const originalFetch = globalThis.fetch;
    const requestedUrls = [];
    t.after(() => { globalThis.fetch = originalFetch; });

    globalThis.fetch = async url => {
        requestedUrls.push(url);
        if (url === 'data/user/db-configuration.json') {
            return jsonResponse({
                kind: 'learning-planner-db-configuration',
                schemaVersion: 1,
                defaultDatabase: '../database.json'
            });
        }
        return jsonResponse(example);
    };

    const store = new PlannerStore();
    await store.initialize();

    assert.deepEqual(requestedUrls, [
        'data/user/db-configuration.json',
        'data/user/organizer-data.json'
    ]);
    assert.equal(store.fileName, 'organizer-data.json');
    assert.match(store.status.warnings[0], /percorso contiene segmenti non consentiti/i);
    assert.equal(store.status.level, 'warning');
});

test('se il database configurato manca passa al fallback con un avviso', async t => {
    const originalFetch = globalThis.fetch;
    const requestedUrls = [];
    t.after(() => { globalThis.fetch = originalFetch; });

    globalThis.fetch = async url => {
        requestedUrls.push(url);
        if (url === 'data/user/db-configuration.json') {
            return jsonResponse(createDatabaseConfiguration('data/user/database-assente.json'));
        }
        if (url === 'data/user/database-assente.json') return notFoundResponse();
        return jsonResponse(example);
    };

    const store = new PlannerStore();
    await store.initialize();

    assert.deepEqual(requestedUrls, [
        'data/user/db-configuration.json',
        'data/user/database-assente.json',
        'data/user/organizer-data.json'
    ]);
    assert.equal(store.fileName, 'organizer-data.json');
    assert.match(store.status.warnings[0], /impossibile caricare.*database-assente\.json/i);
});

test('una configurazione vuota usa i fallback senza errore di configurazione', async t => {
    const originalFetch = globalThis.fetch;
    const requestedUrls = [];
    t.after(() => { globalThis.fetch = originalFetch; });

    globalThis.fetch = async url => {
        requestedUrls.push(url);
        if (url === 'data/user/db-configuration.json') {
            return jsonResponse(emptyDatabaseConfiguration());
        }
        if (url === 'data/user/organizer-data.json') return notFoundResponse();
        return jsonResponse(example);
    };

    const store = new PlannerStore();
    await store.initialize();

    assert.deepEqual(requestedUrls, [
        'data/user/db-configuration.json',
        'data/user/organizer-data.json',
        'data/examples/organizer-example.json'
    ]);
    assert.equal(store.isDemo, true);
    assert.equal(store.databaseConfiguration.defaultDatabase, undefined);
    assert.deepEqual(store.status.warnings, []);
});

test('in modalità file usa l\'esempio incorporato senza tentare richieste HTTP', async t => {
    const originalFetch = globalThis.fetch;
    const originalLocation = globalThis.location;
    const originalRuntime = globalThis.LearningPlannerRuntime;
    t.after(() => {
        globalThis.fetch = originalFetch;
        if (originalLocation === undefined) delete globalThis.location;
        else globalThis.location = originalLocation;
        if (originalRuntime === undefined) delete globalThis.LearningPlannerRuntime;
        else globalThis.LearningPlannerRuntime = originalRuntime;
    });

    globalThis.location = { protocol: 'file:' };
    globalThis.LearningPlannerRuntime = { embeddedExampleDatabase: example };
    globalThis.fetch = async () => {
        assert.fail('fetch non deve essere invocato in modalità file');
    };

    const store = new PlannerStore();
    await store.initialize();

    assert.equal(store.isDemo, true);
    assert.equal(store.fileName, 'learning-planner-example.json');
    assert.match(store.status.message, /modalità locale/i);
    assert.deepEqual(store.status.warnings, []);
});

test('un percorso non valido applicato dalle impostazioni attiva un fallback non bloccante', async t => {
    const originalFetch = globalThis.fetch;
    t.after(() => { globalThis.fetch = originalFetch; });

    globalThis.fetch = async url => {
        if (url === 'data/user/db-configuration.json') return notFoundResponse();
        return jsonResponse(example);
    };

    const store = new PlannerStore();
    await store.initialize();
    store.useConventionalDatabaseFallback(
        new Error('Configurazione database non valida: il percorso deve essere relativo alla root del progetto')
    );

    assert.equal(store.dirty, true);
    assert.equal(store.databaseConfiguration.defaultDatabase, undefined);
    assert.equal(store.status.level, 'warning');
    assert.match(store.status.message, /fallback convenzionale attivo/i);
    assert.match(store.status.warnings[0], /percorso deve essere relativo/i);
});

test('Salva scarica database e configurazione soltanto per un percorso personalizzato', async t => {
    const originalFetch = globalThis.fetch;
    const downloads = recordDownloads(t);
    t.after(() => { globalThis.fetch = originalFetch; });

    globalThis.fetch = async url => {
        if (url === 'data/user/db-configuration.json') return notFoundResponse();
        return jsonResponse(example);
    };

    const store = new PlannerStore();
    await store.initialize();
    store.setDefaultDatabaseConfiguration('data/user/database-ufficiale.json');
    await store.save();

    assert.equal(store.fileName, 'database-ufficiale.json');
    assert.equal(store.dirty, false);
    assert.deepEqual(downloads.map(download => download.fileName), [
        'database-ufficiale.json',
        'db-configuration.json'
    ]);
    assert.equal(JSON.parse(await downloads[0].blob.text()).kind, 'learning-planner-database');
    assert.deepEqual(JSON.parse(await downloads[1].blob.text()), {
        kind: 'learning-planner-db-configuration',
        schemaVersion: 1,
        defaultDatabase: 'data/user/database-ufficiale.json'
    });

    downloads.length = 0;
    store.setDefaultDatabaseConfiguration('');
    await store.save();

    assert.deepEqual(downloads.map(download => download.fileName), ['organizer-data.json']);
    assert.equal(store.databaseConfiguration.defaultDatabase, undefined);
    assert.deepEqual(store.databaseConfiguration, emptyDatabaseConfiguration());
});
