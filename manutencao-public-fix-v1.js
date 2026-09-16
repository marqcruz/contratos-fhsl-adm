(()=>{
'use strict';
if(window.__TDNGO_PUBLIC_FIX_V1__)return;window.__TDNGO_PUBLIC_FIX_V1__=true;
const API='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-manutencao-scope-api';
const qs=new URLSearchParams(location.search);
const mode=qs.get('public');
if(!mode)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function post(action,payload={}){const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...payload}),cache:'no-store'});const t=await r.text();let d;try{d=JSON.parse(t)}catch{d={ok:false,message:t||'Falha'}}if(!r.ok||d.ok===false)throw new Error(d.message||'Falha ao carregar formulário público.');return d}
function fill(id,rows,placeholder){const e=$(id);if(!e)return;e.innerHTML=`<option value="">${placeholder}</option>`+(rows||[]).map(x=>`<option value="${esc(x.id)}">${esc(x.nome)}</option>`).join('')}
function showPublic(){
  $('loading')?.classList.add('hide');
  $('internal-app')?.classList.add('hide');
  $('public-app')?.classList.remove('hide');
  document.body.classList.add('tdngo-public-mode');
  if(mode==='track'&&window.pubTab)window.pubTab('track');
  if(mode==='open'&&window.pubTab)window.pubTab('open');
  const impact=qs.get('impact');if(impact&&$('p-impact'))$('p-impact').value=impact;
}
async function boot(){
  showPublic();
  try{const d=await post('public_bootstrap');fill('p-unit',d.units||[],'Selecione...');fill('p-category',d.categories||[],'Selecione...');}
  catch(e){try{window.toast?window.toast(e.message,'err'):console.warn(e)}catch{}}
  setTimeout(showPublic,250);setTimeout(showPublic,900);setTimeout(showPublic,1800);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
