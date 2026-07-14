import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

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

test('carica prima il database convenzionale dell’utente', async t => {
    const originalFetch = globalThis.fetch;
    const requestedUrls = [];
    let snapshot;
    t.after(() => { globalThis.fetch = originalFetch; });

    globalThis.fetch = async url => {
        requestedUrls.push(url);
        return jsonResponse(example);
    };

    const store = new PlannerStore();
    store.subscribe(value => { snapshot = value; });
    await store.initialize();

    assert.deepEqual(requestedUrls, ['data/user/organizer-data.json']);
    assert.equal(store.fileName, 'organizer-data.json');
    assert.match(store.status.message, /aperto organizer-data\.json/i);
    assert.equal(store.isDemo, false);
    assert.equal(snapshot.isDemo, false);
    assert.equal(store.dirty, false);
});

test('usa l’esempio quando il database utente non è presente', async t => {
    const originalFetch = globalThis.fetch;
    const requestedUrls = [];
    let snapshot;
    t.after(() => { globalThis.fetch = originalFetch; });

    globalThis.fetch = async url => {
        requestedUrls.push(url);
        if (url === 'data/user/organizer-data.json') {
            return { ok: false, status: 404 };
        }
        return jsonResponse(example);
    };

    const store = new PlannerStore();
    store.subscribe(value => { snapshot = value; });
    await store.initialize();

    assert.deepEqual(requestedUrls, [
        'data/user/organizer-data.json',
        'data/examples/organizer-example.json'
    ]);
    assert.equal(store.fileName, 'learning-planner-example.json');
    assert.match(store.status.message, /esempio generico caricato/i);
    assert.equal(store.isDemo, true);
    assert.equal(snapshot.isDemo, true);
    assert.equal(store.dirty, false);

    store.createNew();
    assert.equal(store.isDemo, false);
});
