"use strict";

const staticCacheName = 'restaurant-static-v2';
const urlsToCache = [
  '/',
  '/restaurant.html',
  '/data/restaurants.json',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/reg_sw.js',
  '/css/styles.css',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css',
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
  '/img/5.jpg',
  '/img/6.jpg',
  '/img/7.jpg',
  '/img/8.jpg',
  '/img/9.jpg',
  '/img/10.jpg',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  let requestUrl = new URL(event.request.url);

  let cacheRequest = new Request(event.request.url, { mode: 'no-cors' });

  // serve images from cache.  If not available, fetch and insert into cache
  if (requestUrl.hostname.indexOf('mapbox.com') > -1) {
    event.respondWith(servePhoto(cacheRequest));
    return;
  }

  // for restaurant.html?id=X, we get restaurant.html from cache and let the JS add the details using query string
  // Note that the cache only shows up after a fetch request.  The install step runs and does all the fetch by itself
  if (requestUrl.pathname.startsWith('/restaurant.html')) {
    cacheRequest = new Request('restaurant.html');
  }

  event.respondWith(
    caches.match(cacheRequest, { ignoreSearch: true }).then(response => {
      if (response) return response;
      return fetch(cacheRequest);
    })
  );
});

// Helper functions
function servePhoto(request) {
  let url = request.url;

  return caches.open(staticCacheName).then(cache => {
    return cache.match(url).then(response => {
      if (response) return response;

      return fetch(request).then(networkResponse => {
        cache.put(url, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}