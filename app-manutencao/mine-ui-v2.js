(()=>{
'use strict';
if(window.__TDNGO_MINE_UI_V2__)return;window.__TDNGO_MINE_UI_V2__=true;
const BASE='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/';
const LIVE=BASE+'tdngo-manutencao-live-api',API=BASE+'tdngo-manutencao-api';
const $=id=>document.getElementById(id);let tickets=[],units=[],busy=false,timer=0;
function session(){try{const raw=sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session');return raw?JSON.parse(raw):null}catch{return null}}
function token(){return session()?.tdngoToken||''}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function unitName(id){return units.find(x=>String(x.id)===String(id))?.nome||'Unidade'}
function statusLabel(s){return({ABERTO:'Aberto',TRIAGEM:'Triagem',ATRIBUIDO:'Atribuído',EM_ATENDIMENTO:'Em atendimento',AGUARDANDO_MATERIAL:'Aguardando material',AGUARDANDO_TERCEIRO:'Aguardando terceiro',REABERTO:'Reaberto',CONCLUIDO:'Concluído',CANCELADO:'Cancelado'})[s]||s||'—'}
function since(v){if(!v)return'—';const m=Math.max(0,Math.floor((Date.now()-new Date(v).getTime())/60000));if(m<60)return`${m} min`;const h=Math.floor(m/60);if(h<24)return`${h}h ${m%60}min`;return`${Math.floor(h/24)}d ${h%24}h`}
async function call(url,action){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify({action}),cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw new Error(d.message||'Falha');return d}
async function load(){if(busy||!token())return;busy=true;try{const [w,b]=await Promise.all([call(LIVE,'workspace'),call(API,'bootstrap')]);tickets=w.tickets||[];units=b.units||[];render()}catch{}finally{busy=false}}
function active(){return $('page-mine')?.classList.contains('active')}
function render(){if(!active())return;const host=$('mine');if(!host)return;const q=String($('search')?.value||'').trim().toUpperCase(),st=$('statusFilter')?.value||'';const rows=tickets.filter(x=>(!st||x.status===st)&&(!q||[x.protocolo,x.titulo,x.local_problema,unitName(x.unidade_id),x.prioridade,statusLabel(x.status)].join(' ').toUpperCase().includes(q)));host.classList.add('mine-v2');host.innerHTML=rows.length?rows.map(x=>`<article class="mine-card ${['P1','P2'].includes(x.prioridade)?'is-critical':''}">
 <div class="mine-head"><div class="mine-main"><div class="mine-proto">${esc(x.protocolo)}</div><div class="mine-title">${esc(x.titulo)}</div></div><span class="mine-priority ${String(x.prioridade||'').toLowerCase()}">${esc(x.prioridade||'—')}</span></div>
 <div class="mine-tags"><span>${esc(statusLabel(x.status))}</span>${x.aceite_exigido&&!x.aceito_em?'<span class="pending">Aceite pendente</span>':''}</div>
 <div class="mine-place"><b>${esc(unitName(x.unidade_id))}</b><span>${esc(x.local_problema||'Local não informado')}</span></div>
 <div class="mine-foot"><div><small>Aberto há</small><strong>${since(x.aberto_em)}</strong></div><button type="button" data-mine-open="${esc(x.id)}">Abrir chamado</button></div>
 </article>`).join(''):'<div class="mine-empty">Nenhum chamado encontrado.</div>';
host.querySelectorAll('[data-mine-open]').forEach(b=>b.onclick=()=>{location.href='./?ticket='+encodeURIComponent(b.dataset.mineOpen)});
}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>{if(active())load()},120)}
function install(){const p=$('page-mine'),host=$('mine');if(!p||!host)return;new MutationObserver(()=>{if(active())schedule()}).observe(p,{attributes:true,attributeFilter:['class']});new MutationObserver(()=>{if(active()&&!host.classList.contains('mine-v2'))schedule()}).observe(host,{childList:true});$('search')?.addEventListener('input',render);$('statusFilter')?.addEventListener('change',render);document.querySelector('[data-page="mine"]')?.addEventListener('click',()=>setTimeout(load,80));if(active())load();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();