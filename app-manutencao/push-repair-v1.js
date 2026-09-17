(()=>{
'use strict';
if(window.__TDNGO_PUSH_REPAIR_V1__)return;window.__TDNGO_PUSH_REPAIR_V1__=true;
const EXT='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-manutencao-ext-api';
const $=id=>document.getElementById(id);
function session(){try{const raw=sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session');return raw?JSON.parse(raw):null}catch{return null}}
function token(){return session()?.tdngoToken||''}
function isIOS(){return /iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function standalone(){return !!(matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true)}
function platform(){return isIOS()?'IOS':/Android/i.test(navigator.userAgent)?'ANDROID':'DESKTOP'}
function toast(m,t=''){const e=$('toast');if(!e)return;e.textContent=String(m||'').toLocaleUpperCase('pt-BR');e.className='toast '+t;e.style.display='block';clearTimeout(e._pr);e._pr=setTimeout(()=>e.style.display='none',5000)}
async function call(action,p={}){const tk=token();if(!tk)throw new Error('Sessão inválida.');const r=await fetch(EXT,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tk},body:JSON.stringify({action,...p}),cache:'no-store'});const tx=await r.text();let d;try{d=JSON.parse(tx)}catch{d={ok:false,message:tx}}if(!r.ok||d.ok===false)throw new Error(d.message||'Falha ao configurar Push.');return d}
function keyBytes(raw){const pad='='.repeat((4-raw.length%4)%4),bin=atob((raw+pad).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(bin,c=>c.charCodeAt(0))}
function toB64url(buf){if(!buf)return'';let s='';for(const b of new Uint8Array(buf))s+=String.fromCharCode(b);return btoa(s).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}
async function reg(){if(!('serviceWorker'in navigator))throw new Error('Este aparelho não suporta Service Worker.');await navigator.serviceWorker.register('./sw.js?v=20260917-0635',{scope:'./',updateViaCache:'none'});return navigator.serviceWorker.ready}
async function syncExisting({interactive=false}={}){
 if(!token())return false;
 if(!window.isSecureContext||!('Notification'in window)||!('PushManager'in window))return false;
 if(isIOS()&&!standalone()){if(interactive)throw new Error('No iPhone, abra o TDNGo pelo ícone adicionado à Tela de Início.');return false}
 let perm=Notification.permission;
 if(perm==='default'&&interactive)perm=await Notification.requestPermission();
 if(perm!=='granted'){if(interactive)throw new Error(perm==='denied'?'As notificações estão bloqueadas no iPhone. Libere em Ajustes > Notificações > Manutenção.':'Autorize as notificações para continuar.');return false}
 const registration=await reg();
 const k=await call('push_public_key');
 const currentKey=String(k.publicKey||'');
 if(!currentKey)throw new Error('Chave Push indisponível.');
 let sub=await registration.pushManager.getSubscription();
 if(sub){
   const localKey=toB64url(sub.options?.applicationServerKey);
   if(localKey&&localKey!==currentKey){try{await sub.unsubscribe()}catch{}sub=null}
 }
 if(!sub)sub=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(currentKey)});
 await call('push_subscribe',{subscription:sub.toJSON(),plataforma:platform()});
 try{localStorage.setItem('tdngo_push_last_sync',new Date().toISOString())}catch{}
 const b=$('pushBtn');if(b)b.innerHTML='Alertas 24h ativos <span>✓</span>';
 return true;
}
async function activate(){const b=$('pushBtn');if(b)b.disabled=true;try{await syncExisting({interactive:true});toast('Alertas Push 24h ativados neste aparelho.','ok')}catch(e){toast(e.message||'Não foi possível ativar as notificações.','err')}finally{if(b)b.disabled=false}}
function install(){const b=$('pushBtn');if(b)b.onclick=activate;setTimeout(()=>syncExisting().catch(()=>{}),500);setTimeout(()=>syncExisting().catch(()=>{}),3500);window.addEventListener('pageshow',()=>syncExisting().catch(()=>{}));document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncExisting().catch(()=>{})});window.TDNGOPushRepair={sync:syncExisting,activate};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();