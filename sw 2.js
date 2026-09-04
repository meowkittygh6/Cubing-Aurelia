/* Aurelia — offline cache.
   Cache-first for the app shell so the home-screen icon opens with no network
   at all. Bump CACHE when you upload a new index.html and the old one is
   dropped on the next launch. */
const CACHE="aurelia-v1";
const SHELL=["./","./index.html","./manifest.webmanifest",
             "./icon-192.png","./icon-512.png","./icon-180.png"];

self.addEventListener("install",function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(SHELL.map(function(u){
      return c.add(u).catch(function(){});   // a missing icon must not fail the install
    }));
  }));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;})
                           .map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
  const req=e.request;
  if(req.method!=="GET")return;
  /* Navigations: serve the cached page immediately, refresh it in the background */
  if(req.mode==="navigate"){
    e.respondWith(
      caches.match("./index.html").then(function(hit){
        const net=fetch(req).then(function(res){
          caches.open(CACHE).then(function(c){c.put("./index.html",res.clone());});
          return res;
        }).catch(function(){return hit;});
        return hit||net;
      })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function(hit){
      return hit||fetch(req).then(function(res){
        if(res&&res.status===200&&res.type==="basic"){
          const copy=res.clone();
          caches.open(CACHE).then(function(c){c.put(req,copy);});
        }
        return res;
      }).catch(function(){return hit;});
    })
  );
});
