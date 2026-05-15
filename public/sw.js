// Brújula Digital — Service Worker mínimo
// Solo para que la app sea instalable, sin cache.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
