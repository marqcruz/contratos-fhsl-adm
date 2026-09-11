(()=>{
'use strict';
function css(){if(document.getElementById('pm-mobile-rework-v20'))return;const s=document.createElement('style');s.id='pm-mobile-rework-v20';s.textContent=`
@media(max-width:760px){
  html,body{overflow-x:hidden!important;background:var(--x-bg,var(--pm-bg))!important}
  body{padding-bottom:calc(66px + env(safe-area-inset-bottom))!important}
  .main{padding:calc(62px + env(safe-area-inset-top)) 12px calc(76px + env(safe-area-inset-bottom))!important}
  .pm-appbar{height:calc(56px + env(safe-area-inset-top))!important;padding:env(safe-area-inset-top) 12px 0!important}
  .pm-appbar-brand{width:34px!important;height:34px!important;border-radius:11px!important}
  .pm-appbar-copy small{font-size:8px!important;letter-spacing:.08em!important}.pm-appbar-title{font-size:16px!important;margin-top:1px!important}
  .pm-appbar-action{width:36px!important;height:36px!important;border-radius:11px!important}

  #pm-install-card,.pm-install-card{display:none!important}
  #tdngo-central-nav,.tdngo-central-nav,.tdngo-central-float,.pm-central-float{display:none!important}

  #p-dashboard .grid4{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;margin-bottom:15px!important}
  #p-dashboard .stat{min-height:82px!important;padding:12px!important;border-radius:14px!important}
  #p-dashboard .stat .num{font-size:21px!important;line-height:1!important;letter-spacing:-.5px!important}
  #p-dashboard .stat .lbl{font-size:8px!important;line-height:1.2!important;margin-top:7px!important;letter-spacing:.02em!important;text-transform:uppercase!important}

  #p-dashboard .pm-health-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;margin-bottom:15px!important}
  #p-dashboard .pm-hk{min-height:88px!important;padding:12px!important;border-radius:14px!important;display:flex!important;flex-direction:column!important;justify-content:center!important}
  #p-dashboard .pm-hk b{font-size:21px!important;line-height:1!important}
  #p-dashboard .pm-hk span{font-size:9px!important;line-height:1.25!important;margin-top:7px!important;text-transform:none!important}

  #p-dashboard .section{margin-top:18px!important}
  #p-dashboard .section-head{margin-bottom:8px!important}
  #p-dashboard .section-head h2{font-size:16px!important;line-height:1.2!important}
  #p-dashboard .pm-health-section-title{display:flex!important;align-items:center!important;gap:8px!important;margin:17px 0 10px!important}
  #p-dashboard .pm-health-section-title h1{font-size:16px!important;line-height:1.2!important}
  #p-dashboard .pm-health-mark{font-size:8px!important;padding:4px 7px!important;white-space:nowrap!important}

  #p-dashboard .table{border:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}
  #p-dashboard .table table{min-width:0!important;display:block!important}
  #p-dashboard .table thead{display:none!important}
  #p-dashboard .table tbody{display:grid!important;gap:7px!important}
  #p-dashboard .table tr{display:grid!important;grid-template-columns:1fr auto!important;gap:4px 10px!important;padding:11px 12px!important;border:1px solid var(--x-line,var(--pm-border))!important;border-radius:13px!important;background:var(--x-surface,var(--pm-surface))!important}
  #p-dashboard .table td{display:block!important;border:0!important;padding:0!important;font-size:10px!important;min-width:0!important}
  #p-dashboard .table td:first-child{grid-column:1/-1!important;font-size:12px!important;font-weight:800!important;margin-bottom:2px!important}

  .pm-bottom{height:calc(60px + env(safe-area-inset-bottom))!important;padding:3px 6px env(safe-area-inset-bottom)!important;grid-template-columns:repeat(5,1fr)!important}
  .pm-bottom button{height:52px!important;border-radius:11px!important;font-size:8.5px!important;gap:2px!important;padding:4px 1px!important}
  .pm-bottom button svg{width:19px!important;height:19px!important}
  .pm-bottom .pm-scan{height:54px!important;transform:translateY(-5px)!important}
  .pm-bottom .pm-scan .pm-scan-orb{width:42px!important;height:42px!important;border-radius:14px!important;border-width:3px!important}
  .pm-bottom .pm-scan svg{width:21px!important;height:21px!important}

  #p-bens .toolbar,#p-inventario .inv16-toolbar,.pm-health-toolbar{gap:7px!important;margin-bottom:9px!important}
  .toolbar input,.toolbar select,.inv16-search,.inv16-filter,.pm-health-toolbar input,.pm-health-toolbar select{min-height:42px!important;border-radius:12px!important;font-size:11px!important}
  #p-bens .table tr{padding:12px!important;border-radius:14px!important}

  #p-inventario .inv16-summary{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}
  #p-inventario .inv16-sum{min-height:68px!important;padding:9px 10px!important;border-radius:13px!important}
  #p-inventario .inv16-sum-ico{width:30px!important;height:30px!important;border-radius:9px!important}
  #p-inventario .inv16-sum b{font-size:17px!important}
  #p-inventario .inv16-sum span{font-size:7.5px!important;line-height:1.2!important;margin-top:3px!important}
  #p-inventario .inv15-card{padding:12px!important;border-radius:14px!important}
  #p-inventario .inv15-card h3{font-size:13px!important}
  #p-inventario .inv15-meta{font-size:9px!important}
  #p-inventario .inv15-stat{min-height:46px!important;padding:8px 7px!important}
  #p-inventario .inv15-stat b{font-size:14px!important}
  #p-inventario .inv15-actions .btn{min-height:38px!important}

  #p-scanner .scan-frame{height:min(48dvh,430px)!important;min-height:300px!important;border-radius:16px!important}
  #p-scanner .scan-manual input{min-height:46px!important;border-radius:12px!important}
  #p-scanner .scan-manual .btn{min-height:46px!important;border-radius:12px!important}

  .modal{max-height:91dvh!important;border-radius:18px 18px 0 0!important}
  .modal-h{padding:12px 13px!important}.modal-b{padding:13px!important}.modal-f{padding:9px 12px max(10px,env(safe-area-inset-bottom))!important}
}
`;document.head.appendChild(s)}
function cleanupCentral(){
 document.querySelectorAll('a,button,div').forEach(el=>{
  const t=(el.textContent||'').trim();
  if(t==='Central TDNGo' && (el.tagName==='A'||el.tagName==='BUTTON'||el.children.length<=2)){
   const wrap=el.closest('#tdngo-central-nav,.tdngo-central-nav,.tdngo-central-float,.pm-central-float');
   if(wrap)wrap.style.display='none';else if(el.getBoundingClientRect().bottom>window.innerHeight-160)el.style.display='none';
  }
 });
}
function removeInstall(){document.getElementById('pm-install-card')?.remove()}
function install(){css();removeInstall();cleanupCentral();const mo=new MutationObserver(()=>{removeInstall();cleanupCentral()});mo.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,2100));else setTimeout(install,2100);
})();