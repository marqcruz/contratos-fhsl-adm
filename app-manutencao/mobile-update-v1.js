(()=>{
'use strict';
if(window.__TDNGO_MOBILE_UPDATE_V1__)return;window.__TDNGO_MOBILE_UPDATE_V1__=true;
const LOCAL=String(window.__TDNGO_APP_VERSION__||'0');
const KEY='tdngo_mobile_last_version';
let checking=false;
async function remoteVersion(){const r=await fetch('./version.json?_='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'}});if(!r.ok)throw new Error('version '+r.status);const d=await r.json();return String(d.version||'0')}
async function clearOldCaches(){if(!('caches'in window))return;const keys=await caches.keys();await Promise.all(keys.filter(k=>/^tdngo-(tech|manut-mobile)-/.test(k)).map(k=>caches.delete(k)))}
async function refreshTo(v){try{localStorage.setItem(KEY,v)}catch{}try{await clearOldCaches()}catch{}try{if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs){try{await r.update();if(r.waiting)r.waiting.postMessage('SKIP_WAITING')}catch{}}}}catch{}const u=new URL(location.href);u.searchParams.set('__tdngo_v',v);u.searchParams.set('_refresh',Date.now().toString());location.replace(u.href)}
async function check(force=false){if(checking)return;checking=true;try{const v=await remoteVersion();if(v&&v!=='0'&&v!==LOCAL){await refreshTo(v);return}try{localStorage.setItem(KEY,v||LOCAL)}catch{}if(force&&navigator.serviceWorker?.controller){try{const r=await navigator.serviceWorker.getRegistration('./');await r?.update()}catch{}}}catch{}finally{checking=false}}
window.TDNGOMobileUpdate={check,version:LOCAL};
window.addEventListener('pageshow',()=>check(true));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check(true)});
setInterval(()=>check(false),60000);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>check(true),{once:true});else check(true);
})();
