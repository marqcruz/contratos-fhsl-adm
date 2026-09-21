(()=>{'use strict';
if(window.__TDNGO_MANUT_SETTINGS_FIX_V28__)return;window.__TDNGO_MANUT_SETTINGS_FIX_V28__=true;
function place(){
 const grid=document.querySelector('.cfg-module[data-module="alerts"] .cfg-module-grid');
 if(!grid)return;
 ['alert25-card','cats-card-v12'].forEach(id=>{const card=document.getElementById(id);if(card&&card.parentElement!==grid)grid.appendChild(card)});
 const empty=grid.querySelector('.cfg-module-empty');if(grid.querySelector('.card'))empty?.remove();
}
function start(){place();const mo=new MutationObserver(()=>{clearTimeout(mo.t);mo.t=setTimeout(place,80)});mo.observe(document.body,{childList:true,subtree:true});document.addEventListener('click',e=>{if(e.target.closest?.('[data-cfg-tab="alerts"]'))setTimeout(place,80)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();