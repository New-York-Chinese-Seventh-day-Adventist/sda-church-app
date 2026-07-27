import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');

const loadFetchHarness = () => {
  let fetchHandler;
  const fetched = [];
  const cached = [];
  const self = {
    location: { origin: 'https://jeremy1844.github.io' },
    clients: { claim: async () => undefined },
    skipWaiting: () => undefined,
    addEventListener(type, handler) {
      if (type === 'fetch') fetchHandler = handler;
    },
  };
  const caches = {
    keys: async () => [],
    delete: async () => true,
    match: async () => undefined,
    open: async () => ({
      put: async (request) => {
        cached.push(request.url);
      },
    }),
  };
  const fetch = async (request) => {
    fetched.push(request.url);
    return { clone: () => ({}) };
  };

  vm.runInNewContext(source, { URL, Promise, caches, fetch, self });
  assert.equal(typeof fetchHandler, 'function');

  const dispatch = async (request) => {
    let responsePromise;
    fetchHandler({
      request,
      respondWith(value) {
        responsePromise = Promise.resolve(value);
      },
    });
    assert.ok(responsePromise);
    await responsePromise;
    await Promise.resolve();
    await Promise.resolve();
  };

  return { cached, dispatch, fetched };
};

test('service worker never caches cross-origin sunset requests with coordinates', async () => {
  const harness = loadFetchHarness();
  await harness.dispatch({
    method: 'GET',
    cache: 'no-store',
    url: 'https://api.sunrise-sunset.org/json?lat=40.7&lng=-73.8',
  });

  assert.equal(harness.fetched.length, 1);
  assert.deepEqual(harness.cached, []);
});

test('service worker honors no-store even for same-origin requests', async () => {
  const harness = loadFetchHarness();
  await harness.dispatch({
    method: 'GET',
    cache: 'no-store',
    url: 'https://jeremy1844.github.io/private.json',
  });

  assert.deepEqual(harness.cached, []);
});

test('service worker still caches ordinary same-origin app assets', async () => {
  const harness = loadFetchHarness();
  const url = 'https://jeremy1844.github.io/sda-church-app/index.html';
  await harness.dispatch({ method: 'GET', cache: 'default', url });

  assert.deepEqual(harness.cached, [url]);
});

test('service worker retains offline caching for ordinary cross-origin content', async () => {
  const harness = loadFetchHarness();
  const url = 'https://cdn.example.org/bible/JHN.json';
  await harness.dispatch({ method: 'GET', cache: 'default', url });

  assert.deepEqual(harness.cached, [url]);
});
