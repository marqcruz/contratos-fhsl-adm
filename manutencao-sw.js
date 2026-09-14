const CACHE='tdngo-manut-v7-20260913-stable';
const SHELL=['./manutencao.html','./manutencao-v3.css','./manutencao-v4.css','./manutencao-v5.css','./manutencao-app.js','./manutencao-ui-v3.js','./manutencao-ui-v4.js','./manutencao-ui-v5.js','./manutencao-recovery.js','./manutencao-chamado.html','./manutencao.webmanifest','./assets/manutencao-icon.svg'];
function enhanceHtml(html){
  if(!html)return html;
  if(!html.includes('manutencao-v4.css'))html=html.replace('</head>','<link rel="stylesheet" href="manutencao-v4.css?v=20260913-2256"></head>');
  if(!html.includes('manutencao-v5.css'))html=html.replace('</head>','<link rel="stylesheet" href="manutencao-v5.css?v=20260913-2315"></head>');
  if(!html.includes('manutencao-ui-v4.js'))html=html.replace('</body>','<script src="manutencao-ui-v4.js?v=20260913-2256"><\/script></body>');
  if(!html.includes('manutencao-ui-v5.js'))html=html.replace('</body>','<script src="manutencao-ui-v5.js?v=20260913-2315"><\/script></body>');
  if(!html.includes('manutencao-recovery.js'))html=html.replace('</body>','<script src="manutencao-recovery.js?v=20260913-2335"><\/script></body>');
  return html;
}
function cleanHtmlResponse(text,status=200,statusText='OK'){
  return new Response(text,{status,statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, no-cache, must-revalidate','Pragma':'no-cache','X-Content-Type-Options':'nosniff'}});
}
async function fetchTimed(req,ms=6500){
  const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);
  try{return await fetch(req,{cache:'no-store',signal:c.signal})}finally{clearTimeout(t)}
}
async function navResponse(req){
  const url=new URL(req.url),isMaint=url.pathname.endsWith('/manutencao.html');
  try{
    const net=await fetchTimed(req,6500);
    if(!net.ok)return net;
    if(isMaint){
      const text=enhanceHtml(await net.text());
      return cleanHtmlResponse(text,net.status,net.statusText);
    }
    return net;
  }catch{
    const cached=await caches.match(req)||await caches.match('./manutencao.html');
    if(!cached)return cleanHtmlResponse('<!doctype html><meta charset="utf-8"><title>TDNGo Manutenção</title><body style="font-family:system-ui;padding:30px"><h2>Sem conexão</h2><p>Não foi possível carregar o módulo agora. Verifique a internet e tente novamente.</p><button onclick="location.reload()">Tentar novamente</button></body>',503,'Offline');
    if(isMaint)return cleanHtmlResponse(enhanceHtml(await cached.text()));
    return cached;
  }
}
async function assetResponse(req){
  try{
    const net=await fetchTimed(req,5000);
    if(net&&net.ok){const cp=net.clone();caches.open(CACHE).then(c=>c.put(req,cp)).catch(()=>{})}
    return net;
  }catch{return (await caches.match(req))||new Response('',{status:504})}
}
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.allSettled(SHELL.map(x=>c.add(x)))} )());self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('tdngo-manut-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==='navigate'){e.respondWith(navResponse(r));return}
  if(/\.(?:js|css)$/.test(u.pathname)){e.respondWith(assetResponse(r));return}
  e.respondWith(caches.match(r).then(cached=>{const net=fetch(r).then(resp=>{if(resp&&resp.ok){const cp=resp.clone();caches.open(CACHE).then(c=>c.put(r,cp)).catch(()=>{})}return resp}).catch(()=>cached);return cached||net}));
});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('notificationclick',e=>{e.notification.close();const target=e.notification?.data?.url||'./manutencao.html?go=alerts';e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){try{if('navigate'in w)w.navigate(target)}catch{}if('focus'in w)return w.focus()}return clients.openWindow(target)}))});