// This version string is automatically synced from package.json during a PR
// via GitHub actions via scripts/sync-version.js when creating or updating a new PR.
// This controls a pop-up notification to users when a new version of the app is available for install
// DO NOT EDIT THIS MANUALLY, as it will be overwritten by the next PR update.
const VERSION = "0.8.6";

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
