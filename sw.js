const CACHE_NAME = 'piano-steinway-v1';

// Fichiers à stocker obligatoirement en cache local
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://tonejs.github.io/audio/salamander/C4.mp3',
  'https://tonejs.github.io/audio/salamander/Ds4.mp3',
  'https://tonejs.github.io/audio/salamander/Fs4.mp3',
  'https://tonejs.github.io/audio/salamander/A4.mp3',
  'https://tonejs.github.io/audio/salamander/C5.mp3'
];

// 1. Installation du Service Worker et mise en cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache des ressources et des MP3...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Interception des requêtes : Servir depuis le cache si hors-ligne
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Renvoie la version en cache (super rapide & hors-ligne)
      }
      return fetch(event.request).then((response) => {
        // Sauvegarde au passage les nouvelles ressources chargées
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});