(()=>{
'use strict';
if(window.__TDNGO_TECH_DECISION__)return;window.__TDNGO_TECH_DECISION__=true;
const API='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-manutencao-decision-api';
let improcedentIds=new Set();
const $=id=>document.getElementById(id);
function token(){try{const raw=sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session');return raw?JSON.parse(raw)?.tdngoToken||'':''}catch{return''}}
function toast(msg,type=''){const e=$('toast');if(!e)return;e.textContent=String(msg||'').toLocaleUpperCase('pt-BR');e.className='toast '+type;e.style.display='block';clearTimeout(e._decision);e._decision=setTimeout(()=>e.style.display='none',4200)}
async function call(action,p={}){const t=token();if(!t)throw new Error('Sessão não encontrada.');const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify({action,...p}),cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw new Error(d.message||'Falha na operação.');return d}
function currentProtocol(){return String($('modalTitle')?.textContent||'').trim().toUpperCase()}
function currentStatus(){return String($('modalSub')?.textContent||'').toUpperCase()}
function canShow(){const s=currentStatus();return s&&!/CONCLU|CANCEL|IMPROCEDENTE/.test(s)}
function decorate(){const a=$('modalActions');if(!a||a.querySelector('.tech-improcedente')||!canShow())return;const p=currentProtocol();if(!/^MAN-/.test(p))return;const b=document.createElement('button');b.type='button';b.className='secondary tech-improcedente';b.textContent='Improcedente';b.onclick=()=>markImprocedent(p);a.appendChild(b)}
async function markImprocedent(protocolo){const motivo=prompt('Justificativa da improcedência:','');if(motivo===null)return;if(String(motivo).trim().length<5)return toast('Informe uma justificativa com pelo menos 5 caracteres.','err');if(!confirm('Confirmar como IMPROCEDENTE? O chamado será encerrado e continuará no histórico.'))return;try{await call('improcedente',{protocolo,motivo});$('modal')?.classList.remove('open');toast('Chamado marcado como improcedente.','ok');setTimeout(()=>$('refreshBtn')?.click(),250);setTimeout(refreshIds,600)}catch(e){toast(e.message,'err')}}
function relabel(){if(!improcedentIds.size)return;document.querySelectorAll('article.ticket[data-id]').forEach(c=>{if(!improcedentIds.has(c.dataset.id))return;c.querySelectorAll('.tag').forEach(t=>{if(String(t.textContent||'').trim().toUpperCase()==='CANCELADO')t.textContent='IMPROCEDENTE'})})}
async function refreshIds(){try{const d=await call('improcedent_ids');improcedentIds=new Set(d.ids||[]);relabel()}catch{}}
function init(){setTimeout(refreshIds,700);const mo=new MutationObserver(()=>{decorate();relabel()});mo.observe(document.body,{childList:true,subtree:true});setInterval(refreshIds,20000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
