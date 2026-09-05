/* Aurelia — offline cache.

   Navigation is NETWORK-FIRST with a short timeout. That ordering matters: a
   cache-first worker will happily serve a stale copy of the app forever, and
   the user has no way of knowing they are running old code. This way a new
   upload is picked up the moment there is a connection, and the cached copy
   is only used when the network is slow or absent — which is exactly the
   offline case it exists for.

   Static assets stay cache-first, since their names change when they change. */
const CACHE="aurelia-v3";
const SHELL=["./","./index.html","./manifest.webmanifest",
             "./icon-192.png","./icon-512.png","./icon-180.png"];
const NET_TIMEOUT=2500;

self.addEventListener("install",function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(SHELL.map(function(u){
      return c.add(u).catch(function(){});
    }));
  }));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;})
                           .map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener("message",function(e){
  if(e.data==="skipWaiting")self.skipWaiting();
  if(e.data==="clear")caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k);});});
});
function fromNetwork(req,ms){
  return new Promise(function(resolve,reject){
    const timer=setTimeout(function(){reject(new Error("timeout"));},ms);
    fetch(req).then(function(res){clearTimeout(timer);resolve(res);},
                    function(err){clearTimeout(timer);reject(err);});
  });
}
self.addEventListener("fetch",function(e){
  const req=e.request;
  if(req.method!=="GET")return;
  if(req.mode==="navigate"){
    e.respondWith(
      fromNetwork(req,NET_TIMEOUT).then(function(res){
        const copy=res.clone();
        caches.open(CACHE).then(function(c){c.put("./index.html",copy);});
        return res;
      }).catch(function(){
        return caches.match("./index.html").then(function(hit){
          return hit||caches.match("./");
        });
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
