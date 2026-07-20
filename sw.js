const CACHE_NAME='london-map-v5';
const ASSETS=[
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './assets/london_map.webp',
  './assets/london_map.png',
  './assets/london_map_dark.png',
  './assets/fontawesome.min.css',
  './assets/fa-regular-400.woff2',
  './assets/fa-solid-900.woff2',
  './assets/marker-icon.png',
  './assets/marker-icon-2x.png',
  './assets/marker-shadow.png'
];
// Listen for skip_waiting message
self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS))
  );
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  // HTML pages: network first, fall back to cache
  if(req.mode==='navigate'||(req.headers.get('accept')||'').includes('text/html')){
    e.respondWith(
      fetch(req).then(res=>{
        const clone=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(req,clone));
        return res;
      }).catch(()=>caches.match(req))
    );
    return;
  }
  // Other assets: cache first
  e.respondWith(
    caches.match(req).then(r=>r||fetch(req).then(res=>{
      const clone=res.clone();
      caches.open(CACHE_NAME).then(c=>c.put(req,clone));
      return res;
    }).catch(()=>null))
  );
});