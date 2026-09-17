(()=>{'use strict';if(window.__TDNGO_MANUT_NOTIF_GUARD_V27__)return;window.__TDNGO_MANUT_NOTIF_GUARD_V27__=true;
const qs=new URLSearchParams(location.search);
const forcePublic=qs.has('public')||qs.has('force_public');
if(forcePublic){
  window.__TDNGO_FORCE_PUBLIC_MANUTENCAO__=true;
  try{
    const raw=sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session');
    if(raw)sessionStorage.setItem('fhsl_session_backup_public',raw);
    sessionStorage.removeItem('fhsl_session');
    localStorage.removeItem('fhsl_session');
  }catch{}
  document.addEventListener('click',ev=>{try{const a=ev.target.closest?.('a[href]');if(!a)return;const href=a.getAttribute('href')||'';if(!/public=/.test(href)){const b=sessionStorage.getItem('fhsl_session_backup_public');if(b){sessionStorage.setItem('fhsl_session',b);localStorage.setItem('fhsl_session',b)}}}catch{}},true);
}
const API_MARK='/functions/v1/tdngo-manutencao';
const PAGE_STARTED=Date.now();
const STORE='tdngo_manut_notif_seen_v27';
const TTL=7*24*60*60*1000;
let terminalProtocols=new Set(),baselineId=0;
function load(){try{const o=JSON.parse(localStorage.getItem(STORE)||'{}'),now=Date.now(),clean={};for(const [k,v] of Object.entries(o||{}))if(Number(v)&&now-Number(v)<TTL)clean[k]=Number(v);localStorage.setItem(STORE,JSON.stringify(clean));return clean}catch{return{}}}
let seen=load();
function save(){try{const entries=Object.entries(seen).sort((a,b)=>b[1]-a[1]).slice(0,800);localStorage.setItem(STORE,JSON.stringify(Object.fromEntries(entries)))}catch{}}
function key(n){const id=String(n?.id??n?.notification_id??'').trim();if(id)return'id:'+id;return [n?.chamado_id||'',n?.tipo||'',n?.titulo||'',n?.mensagem||''].join('|').slice(0,900)}
function remember(n){const k=key(n);if(k)seen[k]=Date.now();const id=Number(n?.id||0);if(Number.isFinite(id))baselineId=Math.max(baselineId,id)}
function protocol(n){const s=String(n?.titulo||n?.mensagem||'');return (s.match(/MAN-\d{8}-[A-Z0-9]+/i)||[])[0]?.toUpperCase()||''}
function stale(n){const t=Date.parse(n?.criado_em||n?.created_at||'');return Number.isFinite(t)&&t<PAGE_STARTED-5000}
function shouldSuppress(n){const k=key(n),id=Number(n?.id||0),p=protocol(n);if(k&&seen[k])return true;if(id&&id<=baselineId)return true;if(stale(n))return true;if(p&&terminalProtocols.has(p))return true;return false}
function actionFrom(init){try{return init?.body&&typeof init.body==='string'?(JSON.parse(init.body)?.action||''):''}catch{return''}}
function responseFrom(data,original){const body=JSON.stringify(data);return new Response(body,{status:original.status,statusText:original.statusText,headers:original.headers})}
const baseFetch=window.fetch.bind(window);
window.fetch=async function(input,init){const url=String(typeof input==='string'?input:input?.url||''),action=actionFrom(init),r=await baseFetch(input,init);if(!r.ok||!url.includes(API_MARK)||!['bootstrap','list','heartbeat'].includes(action))return r;let d;try{d=await r.clone().json()}catch{return r}
 if(action==='bootstrap'){
   for(const n of d.notifications||[])remember(n);
   save();
   return responseFrom(d,r);
 }
 if(action==='list'){
   terminalProtocols=new Set((d.data||[]).filter(x=>['CONCLUIDO','CANCELADO','IMPROCEDENTE'].includes(String(x.status||'').toUpperCase())).map(x=>String(x.protocolo||'').toUpperCase()).filter(Boolean));
   return responseFrom(d,r);
 }
 if(action==='heartbeat'){
   const incoming=Array.isArray(d.notifications)?d.notifications:[];
   const fresh=[];
   for(const n of incoming){if(!shouldSuppress(n))fresh.push(n);remember(n)}
   d.notifications=fresh;
   save();
   return responseFrom(d,r);
 }
 return r;
};
if(!forcePublic){
 const loadPush=()=>{if(document.querySelector('script[data-tdngo-push]'))return;const s=document.createElement('script');s.src='tdngo-push-v1.js?v=20260917-0615';s.dataset.tdngoPush='1';document.head.appendChild(s)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadPush,{once:true});else loadPush();
}
})();