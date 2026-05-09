// This version string is automatically synced from package.json via scripts/sync-version.js
const VERSION = "0.8.0";

self.addEventListener("install", (event) => {});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // This empty fetch handler is the minimum requirement for PWA installation in Chrome.
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
