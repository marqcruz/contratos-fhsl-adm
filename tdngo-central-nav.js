(function(){
'use strict';

function norm(v){
  return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
}

function isLegacyBack(el){
  if(!el || el.id==='tdngo-central-nav') return false;
  var text=norm(el.textContent||el.getAttribute('aria-label')||el.getAttribute('title')||'');
  var href=norm(el.getAttribute&&el.getAttribute('href'));
  var onclick=norm(el.getAttribute&&el.getAttribute('onclick'));
  var cls=norm(el.className||'');
  if(/^([←↩⟵‹«]\s*)?(voltar|retornar)\b/.test(text)) return true;
  if(text.indexOf('voltar aos modulos')>=0 || text.indexOf('voltar ao painel')>=0 || text.indexOf('voltar para o painel')>=0 || text.indexOf('voltar ao tdngo')>=0) return true;
  if((text==='tdngo' || text.indexOf('central tdngo')>=0) && href.indexOf('index.html')>=0) return true;
  if((onclick.indexOf('history.back')>=0 || onclick.indexOf('history.go(-1')>=0) && (text.indexOf('voltar')>=0 || cls.indexOf('back')>=0)) return true;
  if(href.indexOf('index.html')>=0 && (text.indexOf('modulo')>=0 || text.indexOf('painel')>=0 || text.indexOf('tdngo')>=0)) return true;
  return false;
}

function removeLegacy(){
  try{
    document.querySelectorAll('a,button').forEach(function(el){
      if(isLegacyBack(el)) el.remove();
    });
  }catch(e){console.warn('[TDNGo] falha ao remover retornos antigos',e);}
}

function css(){
  if(document.getElementById('tdngo-central-nav-style')) return;
  var s=document.createElement('style');
  s.id='tdngo-central-nav-style';
  s.textContent=`
#tdngo-central-nav{position:fixed;left:18px;bottom:18px;z-index:2147483000;display:inline-flex;align-items:center;gap:9px;padding:9px 13px;border:1px solid rgba(148,163,184,.28);border-radius:10px;background:rgba(15,23,42,.94);color:#f8fafc;text-decoration:none;font:600 12px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.01em;box-shadow:0 8px 26px rgba(0,0,0,.24);backdrop-filter:blur(10px);cursor:pointer;transition:transform .15s ease,background .15s ease,border-color .15s ease}
#tdngo-central-nav:hover{background:#172033;border-color:rgba(96,165,250,.55);transform:translateY(-1px)}
#tdngo-central-nav:focus-visible{outline:2px solid #60a5fa;outline-offset:2px}
#tdngo-central-nav .tdngo-central-ico{width:25px;height:25px;border-radius:7px;background:#1d4ed8;display:grid;place-items:center;flex:0 0 25px}
#tdngo-central-nav .tdngo-central-ico svg{width:14px;height:14px;display:block;fill:#fff}
#tdngo-central-nav .tdngo-central-label{white-space:nowrap}
@media (prefers-color-scheme:light){#tdngo-central-nav{background:rgba(255,255,255,.96);color:#172033;border-color:#d7dde6;box-shadow:0 8px 24px rgba(15,23,42,.14)}#tdngo-central-nav:hover{background:#f8fafc;border-color:#93c5fd}}
@media print{#tdngo-central-nav{display:none!important}}
`;
  (document.head||document.documentElement).appendChild(s);
}

function goCentral(ev){
  if(ev){ev.preventDefault();ev.stopPropagation();}
  try{sessionStorage.setItem('tdngo_explicit_nav',Date.now()+'|index.html');}catch(e){}
  try{
    if(window.top && window.top!==window.self){window.top.location.assign('index.html');return;}
  }catch(e){}
  location.assign('index.html');
}

function inject(){
  removeLegacy();
  if(window.top!==window.self) return;
  if(document.getElementById('tdngo-central-nav')) return;
  css();
  var a=document.createElement('a');
  a.id='tdngo-central-nav';
  a.href='index.html';
  a.setAttribute('aria-label','Central TDNGo');
  a.setAttribute('title','Central TDNGo');
  a.innerHTML='<span class="tdngo-central-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z"/></svg></span><span class="tdngo-central-label">Central TDNGo</span>';
  a.addEventListener('click',goCentral);
  document.body.appendChild(a);
}

function run(){
  inject();
  setTimeout(inject,350);
  setTimeout(inject,1200);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
})();
