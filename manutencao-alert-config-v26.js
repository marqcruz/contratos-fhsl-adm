(()=>{'use strict';if(window.__TDNGO_ALERT_CONFIG_V26_FIX__)return;window.__TDNGO_ALERT_CONFIG_V26_FIX__=true;
function move(){const card=document.getElementById('alert25-card');const grid=document.querySelector('.cfg-module[data-module="alerts"] .cfg-module-grid');if(card&&grid&&card.parentElement!==grid)grid.prepend(card)}
function retry(){try{window.tdngoReloadAlertConfig&&window.tdngoReloadAlertConfig()}catch(e){}}
function ensure(){move();const grid=document.querySelector('.cfg-module[data-module="alerts"] .cfg-module-grid');if(!grid)return;const empty=grid.querySelector('.cfg-module-empty');if(document.getElementById('alert25-card')){empty&&empty.remove();return}if(empty)empty.textContent='Carregando notificações, alertas e sirene...';retry();setTimeout(move,300);setTimeout(move,900)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});else ensure();
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-cfg-tab="alerts"]'))setTimeout(ensure,120)});
const mo=new MutationObserver(()=>{clearTimeout(mo.t);mo.t=setTimeout(ensure,120)});mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(ensure,500);setTimeout(ensure,1500);setTimeout(ensure,3000);
})();