(()=>{
'use strict';
if(window.__TDNGO_MANUT_ALERT_POLLER_V1__)return;window.__TDNGO_MANUT_ALERT_POLLER_V1__=true;
const API='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-manutencao-scope-api';
const INTERVAL=5000;
let busy=false,timer=null;
function token(){try{const raw=sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session');const s=raw?JSON.parse(raw):null;return s?.tdngoToken||''}catch{return''}}
function internalVisible(){const e=document.getElementById('internal-app');return !!e&&!e.classList.contains('hide')}
function toast(msg,type='ok'){const e=document.getElementById('toast');if(!e)return;e.textContent=String(msg||'');e.className='toast '+type;e.style.display='block';clearTimeout(e._fastAlert);e._fastAlert=setTimeout(()=>e.style.display='none',4200)}
async function call(){const t=token();if(!t)return null;const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify({action:'heartbeat'}),cache:'no-store'});if(!r.ok)return null;return await r.json().catch(()=>null)}
async function poll(force=false){if(busy||!internalVisible()||(!force&&document.hidden))return;busy=true;try{const d=await call();const list=Array.isArray(d?.notifications)?d.notifications:[];if(!list.length)return;for(const n of list){const title=n?.titulo||'Novo chamado de manutenção',body=n?.mensagem||'',id=String(n?.id||n?.chamado_id||'');toast(title+' · '+body,'ok');try{window.tdngoScheduleMaintenanceAlert?.(title,body,id)}catch{}}try{await window.refreshAll?.()}catch{}}catch(e){console.warn('[TDNGo fast alert]',e)}finally{busy=false}}
function start(){if(timer)return;timer=setInterval(()=>poll(false),INTERVAL);setTimeout(()=>poll(true),1200);window.addEventListener('focus',()=>poll(true));document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll(true)});window.addEventListener('online',()=>poll(true))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();