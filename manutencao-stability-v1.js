(()=>{
'use strict';
if(window.__TDNGO_MANUT_STABILITY_V1__)return;window.__TDNGO_MANUT_STABILITY_V1__=true;
const $=s=>document.querySelector(s);
function addStyle(){if($('#tdngo-manut-stability-css'))return;const s=document.createElement('style');s.id='tdngo-manut-stability-css';s.textContent=`
#page-reports.tdngo-report-loading #report-kpis,#page-reports.tdngo-report-loading .report-grid{visibility:hidden!important}
#page-reports.tdngo-report-loading{position:relative;min-height:420px}
#page-reports.tdngo-report-loading:after{content:'Carregando relatório…';display:grid;place-items:center;position:absolute;inset:120px 0 auto;height:170px;border:1px dashed var(--border);border-radius:14px;background:#fff;color:var(--muted);font-size:12px;font-weight:700}
#page-settings.tdngo-settings-preparing>.settings-grid,#page-settings.tdngo-settings-preparing>.cfg-hub{visibility:hidden!important}
#page-settings.tdngo-settings-preparing{min-height:520px}
#page-settings .cfg-module[data-module="alerts"].tdngo-alerts-preparing>.cfg-module-grid{visibility:hidden!important}
#page-settings .cfg-module[data-module="alerts"].tdngo-alerts-preparing{min-height:390px;position:relative}
#page-settings .cfg-module[data-module="alerts"].tdngo-alerts-preparing:after{content:'Carregando alertas e SLA…';display:grid;place-items:center;position:absolute;inset:55px 0 auto;height:150px;border:1px dashed var(--border);border-radius:12px;background:#fff;color:var(--muted);font-size:11px;font-weight:700}
`;document.head.appendChild(s)}
function hasSession(){try{const raw=sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session');if(!raw)return false;const x=JSON.parse(raw);return !!(x?.tdngoToken||x?.token)}catch{return false}}
function guardSession(){const q=new URLSearchParams(location.search);if(q.has('public'))return;if(!hasSession())location.replace('index.html?logout=1&_='+Date.now())}
function reportLoading(on){$('#page-reports')?.classList.toggle('tdngo-report-loading',!!on)}
function wrapReports(){if(window.__TDNGO_REPORT_STABLE_WRAPPED__||typeof window.loadReports!=='function')return false;window.__TDNGO_REPORT_STABLE_WRAPPED__=true;const base=window.loadReports;window.loadReports=async function(){reportLoading(true);try{return await base.apply(this,arguments)}finally{requestAnimationFrame(()=>requestAnimationFrame(()=>reportLoading(false)))}};return true}
let settingsTimer=0,alertsTimer=0;
function settleSettings(){const p=$('#page-settings');if(!p)return;const hub=p.querySelector('.cfg-hub'),active=hub?.querySelector('.cfg-module.active');if(!hub||!active)return;clearTimeout(settingsTimer);settingsTimer=setTimeout(()=>p.classList.remove('tdngo-settings-preparing'),180)}
function settleAlerts(){const m=$('#page-settings .cfg-module[data-module="alerts"]');if(!m)return;const grid=m.querySelector('.cfg-module-grid');if(!grid)return;clearTimeout(alertsTimer);m.classList.add('tdngo-alerts-preparing');alertsTimer=setTimeout(()=>m.classList.remove('tdngo-alerts-preparing'),260)}
function watchSettings(){const p=$('#page-settings');if(!p)return;p.classList.add('tdngo-settings-preparing');const mo=new MutationObserver(()=>{settleSettings();const a=$('#page-settings .cfg-module[data-module="alerts"]');if(a?.classList.contains('active'))settleAlerts()});mo.observe(p,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});settleSettings()}
function bindClicks(){document.addEventListener('click',e=>{const b=e.target.closest?.('[data-page]');if(!b)return;const id=b.dataset.page;if(id==='reports')reportLoading(true);if(id==='settings'){const p=$('#page-settings');p?.classList.add('tdngo-settings-preparing');setTimeout(settleSettings,60)}const tab=e.target.closest?.('[data-cfg-tab="alerts"]');if(tab){const m=$('#page-settings .cfg-module[data-module="alerts"]');m?.classList.add('tdngo-alerts-preparing');setTimeout(settleAlerts,30)}},true)}
function init(){addStyle();guardSession();wrapReports();watchSettings();bindClicks();let n=0;const t=setInterval(()=>{n++;wrapReports();settleSettings();if(n>20)clearInterval(t)},150);window.addEventListener('pageshow',guardSession);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')guardSession()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
