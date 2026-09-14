(()=>{
'use strict';
if(window.__TDNGO_TECH_STATE_FIX__)return;window.__TDNGO_TECH_STATE_FIX__=true;
const LIVE='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-manutencao-live-api';
let busy=false,last=0,accepted=new Set();
const $=id=>document.getElementById(id);
function token(){try{const raw=sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session');return raw?JSON.parse(raw)?.tdngoToken||'':''}catch{return''}}
async function sync(force=false){if(busy||(!force&&Date.now()-last<1200))return;busy=true;last=Date.now();try{const t=token();if(!t)return;const r=await fetch(LIVE,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify({action:'workspace'}),cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)return;accepted=new Set((d.tickets||[]).filter(x=>x.aceito_em||x.aceite_exigido===false).map(x=>x.protocolo));apply()}catch{}finally{busy=false}}
function apply(){const modal=$('modal');if(!modal?.classList.contains('open'))return;const proto=String($('modalTitle')?.textContent||'').trim();if(!proto||!accepted.has(proto))return;const b=document.querySelector('#modalActions [data-act="accept"]');if(b)b.remove();const sub=$('modalSub');if(sub&&/ACEITE/i.test(sub.textContent||''))sub.textContent=(sub.textContent||'').replace(/ACEITE[^·]*/i,'ACEITO');}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-act="accept"]');if(!b)return;b.disabled=true;b.textContent='Aceitando...';setTimeout(()=>{sync(true).then(()=>{if(document.body.contains(b)){b.disabled=false;b.textContent='Aceitar chamado'}})},500)},true);
const mo=new MutationObserver(()=>{apply();const modal=$('modal');if(modal?.classList.contains('open'))sync()});mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
setInterval(()=>sync(),8000);
})();
