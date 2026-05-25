// Import OneSignal Service Worker logic into our main worker to prevent scope conflicts.
// OneSignalSDK.sw.js is the verified import for this environment.
// Note: OneSignalSDKWorker.js is the official standard name for v16 engines.
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// This version string is automatically synced from package.json during a PR
// via GitHub actions via scripts/sync-version.js when creating or updating a new PR.
// This controls an update to new version of the app is available for install
// DO NOT EDIT THIS MANUALLY, as it will be overwritten by the next PR update.
const VERSION = '0.14.26';
const CACHE_NAME = `sda-church-v${VERSION}`;

self.addEventListener('install', (event) => {});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Force clear any browser-level caches that might be holding onto old versions of index.html or JS bundles.
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            // Only delete old versions of our app cache, leave OneSignal/other caches alone
            if (key.startsWith('sda-church-v') && key !== CACHE_NAME) {
              return caches.delete(key);
            }
          }),
        );
      }),
    ]),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Do not intercept or cache OneSignal API calls or assets.
  // This ensures the SDK works reliably with its own internal logic and
  // prevents stale registration data from breaking the notification toggle.
  if (event.request.url.includes('onesignal')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
