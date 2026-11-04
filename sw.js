const V="av-v1";
const SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==V).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=="GET")return;
  /* arquivos do próprio site: tenta a internet primeiro, para sempre pegar a versão mais nova */
  if(u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{
      if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}
      return res;
    }).catch(()=>caches.match(r).then(m=>m||caches.match("index.html"))));
    return;
  }
  /* biblioteca do Supabase (versão fixa): guarda para abrir mesmo sem internet */
  if(u.hostname==="cdn.jsdelivr.net"){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{
      const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res;
    })));
  }
});
