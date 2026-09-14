(()=>{
'use strict';
const WAIT_MS=8000;
let shown=false;
function $id(id){return document.getElementById(id)}
function isHidden(el){return !el||el.classList.contains('hide')||getComputedStyle(el).display==='none'}
function loadingVisible(){const l=$id('loading');return !!l&&!isHidden(l)}
function appVisible(){return !isHidden($id('internal-app'))||!isHidden($id('public-app'))}
function hideLoading(){const l=$id('loading');if(l)l.classList.add('hide')}
function loadV6(){
  if(!document.querySelector('link[href*="manutencao-v6.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='manutencao-v6.css?v=20260914-0110';document.head.appendChild(l)}
  if(!document.querySelector('script[src*="manutencao-ui-v6.js"]')){const s=document.createElement('script');s.src='manutencao-ui-v6.js?v=20260914-0110';s.defer=true;document.head.appendChild(s)}
  if(!document.querySelector('script[src*="manutencao-privacy-v6.js"]')){const s=document.createElement('script');s.src='manutencao-privacy-v6.js?v=20260914-0125';s.defer=true;document.head.appendChild(s)}
}
async function hardRecover(clear=false){
  try{
    if(clear&&'caches'in window){const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('tdngo-manut-')).map(k=>caches.delete(k)))}
    if(clear&&'serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs){try{if((r.active?.scriptURL||'').includes('manutencao-sw.js'))await r.unregister()}catch{}}}
  }catch{}
  const u=new URL(location.href);u.searchParams.set('_reload',Date.now().toString());location.replace(u.toString())
}
function showRecovery(reason='O CARREGAMENTO DEMOROU MAIS QUE O ESPERADO.'){
  if(shown||!loadingVisible())return;shown=true;
  const l=$id('loading');if(!l)return;
  l.innerHTML=`<div style="width:min(460px,88vw);text-align:center;background:#fff;border:1px solid #dbe3eb;border-radius:16px;padding:22px;box-shadow:0 12px 32px rgba(15,23,42,.10)"><div style="font-weight:800;font-size:17px;color:#172033">NÃO FOI POSSÍVEL CONCLUIR O CARREGAMENTO</div><div style="margin-top:8px;color:#64748b;font-size:13px;line-height:1.45">${reason}</div><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px"><button id="mn-retry" style="border:0;border-radius:10px;padding:10px 14px;background:#1769d2;color:#fff;font-weight:700;cursor:pointer">TENTAR NOVAMENTE</button><button id="mn-clear" style="border:1px solid #cbd5e1;border-radius:10px;padding:10px 14px;background:#fff;color:#334155;font-weight:700;cursor:pointer">LIMPAR CACHE DO MÓDULO</button></div><div style="margin-top:10px;color:#94a3b8;font-size:11px">SE O PROBLEMA SE REPETIR, O SISTEMA TENTARÁ CARREGAR UMA CÓPIA NOVA DOS ARQUIVOS.</div></div>`;
  $id('mn-retry')?.addEventListener('click',()=>hardRecover(false));
  $id('mn-clear')?.addEventListener('click',()=>hardRecover(true));
}
function check(){if(appVisible()){hideLoading();return}if(loadingVisible())showRecovery()}
window.addEventListener('error',()=>{if(loadingVisible())setTimeout(()=>showRecovery('OCORREU UMA FALHA AO CARREGAR UM DOS ARQUIVOS DO MÓDULO.'),500)});
window.addEventListener('unhandledrejection',()=>{if(loadingVisible())setTimeout(()=>showRecovery('A CONEXÃO COM O MÓDULO NÃO RESPONDEU COMO ESPERADO.'),500)});
window.addEventListener('pageshow',()=>{setTimeout(()=>{if(appVisible())hideLoading()},100)});
loadV6();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(check,WAIT_MS),{once:true});else setTimeout(check,WAIT_MS);
})();