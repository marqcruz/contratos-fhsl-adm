(()=>{
'use strict';
const API='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-manutencao-api';
const STARTED_AT=Date.now();
const SEEN_KEY='tdngo_manut_alerts_seen_v5';
const NativeNotification=window.Notification;
let alertTimer=null,dateSyncTimer=null;

function toast(msg,type=''){const e=document.getElementById('toast');if(!e)return;e.textContent=String(msg||'').toLocaleUpperCase('pt-BR');e.className='toast '+type;e.style.display='block';clearTimeout(e._v5);e._v5=setTimeout(()=>e.style.display='none',4200)}
function getSession(){try{const raw=sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session');return raw?JSON.parse(raw):null}catch{return null}}
function token(){return getSession()?.tdngoToken||''}
function isMobile(){return matchMedia('(max-width:760px)').matches||matchMedia('(display-mode:standalone)').matches}
function loadSeen(){try{return JSON.parse(localStorage.getItem(SEEN_KEY)||'{}')||{}}catch{return{}}}
let seen=loadSeen();
function saveSeen(){try{const now=Date.now(),fresh={};Object.entries(seen).sort((a,b)=>Number(b[1])-Number(a[1])).slice(0,200).forEach(([k,v])=>{if(now-Number(v)<7*86400000)fresh[k]=v});seen=fresh;localStorage.setItem(SEEN_KEY,JSON.stringify(seen))}catch{}}
function remember(tag){seen[tag]=Date.now();saveSeen()}

function installNotificationProxy(){
  if(!NativeNotification)return;
  function ProxyNotification(title,options={}){
    const tag=options.tag||('manut-'+Date.now());
    if(seen[tag])return {close(){}};
    remember(tag);
    const opts={...options,tag,renotify:true,data:{...(options.data||{}),url:options.data?.url||'./manutencao.html?go=alerts'}};
    if(isMobile()&&'serviceWorker'in navigator){
      navigator.serviceWorker.ready.then(reg=>reg.showNotification(String(title||'TDNGO MANUTENÇÃO').toLocaleUpperCase('pt-BR'),opts)).catch(()=>{try{return new NativeNotification(title,opts)}catch{}});
      return {close(){}};
    }
    try{return new NativeNotification(title,opts)}catch{return {close(){}}}
  }
  try{Object.defineProperty(ProxyNotification,'permission',{get:()=>NativeNotification.permission});ProxyNotification.requestPermission=(...a)=>NativeNotification.requestPermission(...a);window.Notification=ProxyNotification}catch{}
}

async function requestAlerts(){
  if(!NativeNotification){toast('ESTE NAVEGADOR NÃO DISPONIBILIZA NOTIFICAÇÕES. NO IPHONE, INSTALE O TDNGO MANUTENÇÃO NA TELA DE INÍCIO.','err');return}
  try{
    const p=await NativeNotification.requestPermission();
    if(p==='granted'){
      localStorage.setItem('tdngo_manut_alerts_enabled','1');
      decorateAlertState();
      toast('ALERTAS DE MANUTENÇÃO ATIVADOS NESTE DISPOSITIVO.','ok');
    }else toast('AS NOTIFICAÇÕES NÃO FORAM AUTORIZADAS NESTE DISPOSITIVO.','err');
  }catch{toast('NÃO FOI POSSÍVEL ATIVAR AS NOTIFICAÇÕES.','err')}
}

function decorateAlertState(){
  const granted=!!NativeNotification&&NativeNotification.permission==='granted';
  document.querySelectorAll('button').forEach(b=>{
    const t=(b.textContent||'').toLocaleLowerCase('pt-BR');
    if(t.includes('ativar alertas')||t.includes('alertas ativos')){
      if(granted){b.textContent='Alertas ativos';b.classList.add('v5-alert-button-active')}else{b.textContent='Ativar alertas';b.classList.remove('v5-alert-button-active')}
    }
  });
  const banner=document.querySelector('#page-dashboard .live-banner');
  if(banner){let s=banner.querySelector('.v5-alert-live');if(granted&&!s){s=document.createElement('span');s.className='v5-alert-live';s.textContent='ALERTAS DO DISPOSITIVO ATIVOS';banner.appendChild(s)}else if(!granted&&s)s.remove()}
}

async function pollAlerts(){
  const t=token();if(!t)return;
  try{
    const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify({action:'heartbeat'}),cache:'no-store'});
    if(!r.ok)return;
    const d=await r.json();
    const rows=Array.isArray(d.notifications)?d.notifications:[];
    for(const n of rows){
      const tag='manut-'+n.id;if(seen[tag])continue;
      const ts=new Date(n.criado_em||0).getTime();
      if(ts&&ts<STARTED_AT-120000){remember(tag);continue}
      const title=String(n.titulo||'NOVO CHAMADO DE MANUTENÇÃO').toLocaleUpperCase('pt-BR');
      const body=String(n.mensagem||'').toLocaleUpperCase('pt-BR');
      try{navigator.vibrate?.([180,90,180,90,240])}catch{}
      toast(title,'ok');
      if(NativeNotification&&NativeNotification.permission==='granted'){
        try{new window.Notification(title,{body,tag,requireInteraction:true,icon:'assets/manutencao-icon.svg',badge:'assets/manutencao-icon.svg',data:{url:'./manutencao.html?go=alerts',chamado_id:n.chamado_id||null}})}catch{}
      }else remember(tag);
    }
  }catch{}
}

function shouldUpper(el){
  if(!(el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement))return false;
  if(el.classList.contains('v5-date-br')||el.dataset.noUpper==='1')return false;
  if(['track-token','website'].includes(el.id))return false;
  if(el instanceof HTMLInputElement&&['email','password','file','date','datetime-local','number','checkbox','radio'].includes(el.type))return false;
  return true;
}
function upperInput(ev){const el=ev.target;if(!shouldUpper(el))return;const a=el.selectionStart,b=el.selectionEnd,up=el.value.toLocaleUpperCase('pt-BR');if(up===el.value)return;el.value=up;try{el.setSelectionRange(a,b)}catch{}}

const pad=n=>String(n).padStart(2,'0');
function isoToBr(v,withTime){if(!v)return'';const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);if(!m)return String(v);return `${m[3]}/${m[2]}/${m[1]}${withTime?` ${m[4]||'00'}:${m[5]||'00'}`:''}`}
function validParts(d,m,y,h=0,mi=0){const x=new Date(y,m-1,d,h,mi);return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d&&x.getHours()===h&&x.getMinutes()===mi}
function brToIso(v,withTime){const s=String(v||'').trim();if(!s)return'';const r=withTime?/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/:/^(\d{2})\/(\d{2})\/(\d{4})$/;const m=s.match(r);if(!m)return null;const d=+m[1],mo=+m[2],y=+m[3],h=withTime?+m[4]:0,mi=withTime?+m[5]:0;if(!validParts(d,mo,y,h,mi))return null;return `${y}-${pad(mo)}-${pad(d)}${withTime?`T${pad(h)}:${pad(mi)}`:''}`}
function maskDate(v,withTime){let d=String(v||'').replace(/\D/g,'').slice(0,withTime?12:8);if(d.length>2)d=d.slice(0,2)+'/'+d.slice(2);if(d.length>5)d=d.slice(0,5)+'/'+d.slice(5);if(withTime&&d.length>10)d=d.slice(0,10)+' '+d.slice(10);if(withTime&&d.length>13)d=d.slice(0,13)+':'+d.slice(13);return d}
function enhanceDateInput(inp){
  if(inp.dataset.brEnhanced==='1')return;
  const withTime=inp.type==='datetime-local';
  if(inp.type!=='date'&&!withTime)return;
  inp.dataset.brEnhanced='1';inp.classList.add('v5-date-native');
  const vis=document.createElement('input');vis.type='text';vis.autocomplete='off';vis.inputMode='numeric';vis.className=((inp.className||'input').replace('v5-date-native','').trim()||'input')+' v5-date-br';vis.placeholder=withTime?'DD/MM/AAAA HH:MM':'DD/MM/AAAA';vis.value=isoToBr(inp.value,withTime);vis.dataset.forDate=inp.id||'';inp.insertAdjacentElement('afterend',vis);
  const commit=()=>{const iso=brToIso(vis.value,withTime);if(iso===null){vis.setCustomValidity('INFORME UMA DATA VÁLIDA NO FORMATO '+vis.placeholder);vis.reportValidity();return false}vis.setCustomValidity('');inp.value=iso;inp.dispatchEvent(new Event('change',{bubbles:true}));return true};
  vis.addEventListener('input',()=>{const p=vis.selectionStart||0;vis.value=maskDate(vis.value,withTime);try{vis.setSelectionRange(p,p)}catch{}});
  vis.addEventListener('blur',commit);vis.addEventListener('keydown',e=>{if(e.key==='Enter')commit()});
}
function enhanceDates(root=document){root.querySelectorAll?.('input[type="date"],input[type="datetime-local"]').forEach(enhanceDateInput)}
function syncDates(){document.querySelectorAll('input.v5-date-native').forEach(inp=>{const vis=inp.nextElementSibling;if(!vis?.classList.contains('v5-date-br')||document.activeElement===vis)return;const want=isoToBr(inp.value,inp.getAttribute('type')==='datetime-local');if(vis.value!==want)vis.value=want})}

function replaceRawDates(root=document){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||['SCRIPT','STYLE','TEXTAREA','INPUT','OPTION'].includes(p.tagName))return NodeFilter.FILTER_REJECT;return /\b\d{4}-\d{2}-\d{2}\b/.test(n.nodeValue||'')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const n of nodes)n.nodeValue=n.nodeValue.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g,'$3/$2/$1')
}

function init(){
  installNotificationProxy();
  window.enableNotifications=requestAlerts;
  document.addEventListener('input',upperInput,true);
  enhanceDates();replaceRawDates();decorateAlertState();
  const mo=new MutationObserver(muts=>{for(const m of muts)for(const n of m.addedNodes)if(n.nodeType===1){enhanceDates(n);replaceRawDates(n)}decorateAlertState()});
  mo.observe(document.body,{childList:true,subtree:true});
  dateSyncTimer=setInterval(syncDates,700);
  setTimeout(pollAlerts,2500);alertTimer=setInterval(pollAlerts,10000);
  window.addEventListener('focus',pollAlerts);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pollAlerts()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
