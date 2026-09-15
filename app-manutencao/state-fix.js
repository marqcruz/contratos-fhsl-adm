(()=>{
'use strict';
if(window.__TDNGO_TECH_STATE_FIX__)return;window.__TDNGO_TECH_STATE_FIX__=true;
const LIVE='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-manutencao-live-api';
let busy=false,last=0,tickets=new Map(),timer=0;
const $=id=>document.getElementById(id);
function token(){try{const raw=sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session');return raw?JSON.parse(raw)?.tdngoToken||'':''}catch{return''}}
async function sync(force=false){if(busy||(!force&&Date.now()-last<1500))return;busy=true;last=Date.now();try{const t=token();if(!t)return;const r=await fetch(LIVE,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify({action:'workspace'}),cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)return;tickets=new Map((d.tickets||[]).map(x=>[String(x.protocolo||'').trim(),x]));apply()}catch{}finally{busy=false}}
function apply(){const modal=$('modal');if(!modal?.classList.contains('open'))return;const proto=String($('modalTitle')?.textContent||'').trim(),x=tickets.get(proto);if(!x)return;const started=x.status==='EM_ATENDIMENTO'||!!x.iniciado_em,accepted=!!x.aceito_em||x.aceite_exigido===false;if(started||accepted){document.querySelector('#modalActions [data-act="accept"]')?.remove();const sub=$('modalSub');if(sub&&started&&!/ATENDIMENTO JÁ INICIADO/i.test(sub.textContent||'')){sub.textContent=((sub.textContent||'').replace(/\s*·\s*ACEITE[^·]*/i,'').trim()+' · ATENDIMENTO JÁ INICIADO').replace(/^\s*·\s*/, '')}}
}
function scheduleSync(){clearTimeout(timer);timer=setTimeout(()=>sync(true),180)}
const mo=new MutationObserver(muts=>{let modalChanged=false;for(const m of muts){if(m.type==='attributes'&&m.target?.id==='modal'){modalChanged=true;break}if(m.addedNodes?.length){for(const n of m.addedNodes){if(n.nodeType===1&&(n.id==='modal'||n.querySelector?.('#modal'))){modalChanged=true;break}}}}if(modalChanged)scheduleSync();else apply()});
mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
window.addEventListener('focus',()=>sync(true));document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync(true)});setInterval(()=>sync(false),8000);setTimeout(()=>sync(true),800);
})();
