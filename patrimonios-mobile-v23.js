(()=>{
'use strict';
function addCss(){if(document.getElementById('pat-mobile-v23'))return;const s=document.createElement('style');s.id='pat-mobile-v23';s.textContent=`
@media(max-width:760px){
  #pm-install-card,.pm-install-card{display:none!important}
  html,body{overflow-x:hidden!important}
  body{padding-bottom:calc(62px + env(safe-area-inset-bottom))!important}
  .main{padding:calc(61px + env(safe-area-inset-top)) 11px calc(72px + env(safe-area-inset-bottom))!important}
  .ui-mobile-head{height:calc(54px + env(safe-area-inset-top))!important;padding:env(safe-area-inset-top) 10px 0!important;gap:8px!important}
  .ui-head-back,.ui-head-action{width:36px!important;height:36px!important;border-radius:10px!important}
  .ui-head-copy small{font-size:7.5px!important;letter-spacing:.08em!important}.ui-head-copy b{font-size:15px!important;margin-top:1px!important}

  #p-dashboard .grid4{gap:7px!important;margin-bottom:14px!important}
  #p-dashboard .stat{min-height:76px!important;padding:10px 11px!important;border-radius:13px!important}
  #p-dashboard .stat .num{font-size:19px!important;line-height:1!important;letter-spacing:-.35px!important}
  #p-dashboard .stat .lbl{font-size:7px!important;line-height:1.15!important;margin-top:6px!important;letter-spacing:.045em!important;text-transform:uppercase!important}

  #p-dashboard .pm-health-section-title{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;margin:14px 0 8px!important}
  #p-dashboard .pm-health-section-title>div{min-width:0!important;flex:1!important}
  #p-dashboard .pm-health-section-title h1{font-size:15px!important;line-height:1.15!important;letter-spacing:-.2px!important;white-space:normal!important}
  #p-dashboard .pm-health-section-title p{display:none!important}
  #p-dashboard .pm-health-mark{flex:0 0 auto!important;font-size:7.5px!important;padding:4px 7px!important;white-space:nowrap!important}
  #p-dashboard .pm-health-kpis{gap:7px!important;margin-bottom:14px!important}
  #p-dashboard .pm-hk{min-height:78px!important;padding:10px 11px!important;border-radius:13px!important;display:flex!important;flex-direction:column!important;justify-content:center!important}
  #p-dashboard .pm-hk b{font-size:19px!important;line-height:1!important}
  #p-dashboard .pm-hk span{font-size:8px!important;line-height:1.18!important;margin-top:6px!important}

  #p-dashboard .section{margin-top:15px!important}
  #p-dashboard .section-head{margin-bottom:7px!important}
  #p-dashboard .section-head h2{font-size:14px!important;line-height:1.15!important}
  #p-dashboard .table tbody{gap:6px!important}
  #p-dashboard .table tr{padding:9px 10px!important;border-radius:12px!important;gap:3px 8px!important}
  #p-dashboard .table td{font-size:8.8px!important}#p-dashboard .table td:first-child{font-size:10.5px!important;margin-bottom:2px!important}

  .ui-bottom{height:calc(60px + env(safe-area-inset-bottom))!important;padding:3px 5px env(safe-area-inset-bottom)!important}
  .ui-bottom button{height:49px!important;border-radius:10px!important;font-size:7.8px!important;gap:2px!important;padding:3px 1px!important}
  .ui-bottom button svg{width:18px!important;height:18px!important}
  .ui-bottom .ui-bottom-qr{transform:translateY(-4px)!important}
  .ui-bottom .ui-bottom-qr span:first-child{width:40px!important;height:40px!important;border-radius:13px!important;border-width:3px!important;box-shadow:0 5px 14px rgba(47,129,247,.25)!important}
  .ui-bottom .ui-bottom-qr svg{width:19px!important;height:19px!important}

  #p-inventario .inv16-summary{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important;margin-bottom:9px!important}
  #p-inventario .inv16-sum{min-height:62px!important;padding:8px 9px!important;border-radius:12px!important;gap:8px!important}
  #p-inventario .inv16-sum-ico{width:28px!important;height:28px!important;border-radius:8px!important}
  #p-inventario .inv16-sum b{font-size:16px!important}#p-inventario .inv16-sum span{font-size:7px!important;line-height:1.15!important;margin-top:2px!important}
  #p-inventario .inv15-card{padding:11px!important;border-radius:13px!important}.inv15-meta{font-size:8.5px!important}
  #p-inventario .inv15-stat{min-height:43px!important;padding:7px!important}.inv15-stat b{font-size:13px!important}.inv15-stat span{font-size:6.8px!important}
  #p-inventario .inv15-actions .btn{min-height:36px!important}

  #p-bens .table tbody{gap:7px!important}#p-bens .table tr{padding:10px 11px!important;border-radius:13px!important}
  .toolbar input,.toolbar select,.pm-health-toolbar input,.pm-health-toolbar select,.inv16-search,.inv16-filter{min-height:40px!important;border-radius:11px!important}

  #p-scanner .scan-frame{height:min(46dvh,410px)!important;min-height:285px!important;border-radius:15px!important}
  #p-scanner .scan-help{font-size:8.5px!important;line-height:1.3!important;margin-top:6px!important}
  #p-scanner .scan-manual input,#p-scanner .scan-manual .btn{min-height:44px!important;border-radius:11px!important}

  .modal{max-height:90dvh!important;border-radius:18px 18px 0 0!important}.modal-h{padding:11px 12px!important}.modal-b{padding:12px!important}.modal-f{padding:8px 11px max(9px,env(safe-area-inset-bottom))!important}
}
`;document.head.appendChild(s)}
function cleanupFloatingCentral(){
 document.querySelectorAll('a,button').forEach(el=>{const t=(el.textContent||'').trim();if(t!=='Central TDNGo')return; if(el.closest('.ui-more-sheet'))return; const r=el.getBoundingClientRect(); if(window.innerWidth<=760 && (r.bottom>window.innerHeight-180 || getComputedStyle(el).position==='fixed')){const p=el.parentElement;if(p&&p.children.length===1)p.style.display='none';else el.style.display='none';}})
}
function addCentralToMore(){const list=document.querySelector('#ui-more .ui-more-list');if(!list||list.querySelector('[data-central-tdngo]'))return;const b=document.createElement('button');b.type='button';b.className='ui-more-item';b.setAttribute('data-central-tdngo','1');b.innerHTML='<span class="ui-more-icon"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg></span><span><b>Central TDNGo</b><small>Voltar aos módulos do sistema</small></span><span>›</span>';b.onclick=()=>location.href='index.html';list.appendChild(b)}
function removeInstall(){document.getElementById('pm-install-card')?.remove()}
function run(){addCss();removeInstall();cleanupFloatingCentral();addCentralToMore()}
function install(){run();let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;run()})}).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,2050));else setTimeout(install,2050);
})();