(()=>{'use strict';if(window.__TDNGO_TECH_SOUND_ONLY_V9__)return;window.__TDNGO_TECH_SOUND_ONLY_V9__=true;
const KEY='tdngo_tech_alert_seen_v9',TTL=6*60*60*1000;let lastPlay=0;
function clean(){const now=Date.now();let m={};try{m=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{};for(const k of Object.keys(m))if(now-Number(m[k]||0)>TTL)delete m[k];return m}
function identity(d={}){const id=String(d.notification_id||d.id||d.tag||'').trim();if(id)return'id:'+id;const ticket=String(d.chamado_id||d.ticket_id||'').trim(),type=String(d.tipo||d.type||'').trim(),title=String(d.title||d.titulo||'').trim(),body=String(d.body||d.mensagem||'').trim();return [ticket,type,title,body].filter(Boolean).join('|').slice(0,700)}
function fresh(d){const k=identity(d);if(!k)return false;const m=clean();if(m[k]){try{localStorage.setItem(KEY,JSON.stringify(m))}catch{};return false}m[k]=Date.now();try{localStorage.setItem(KEY,JSON.stringify(m))}catch{};return true}
async function play(d={}){if(!fresh(d))return;if(Date.now()-lastPlay<1800)return;lastPlay=Date.now();try{await window.tdngoCustomSirenPlay?.(true)}catch{}}
navigator.serviceWorker?.addEventListener('message',e=>{if(e.data?.type!=='TDNGO_MANUT_PUSH_ALERT')return;play(e.data?.data||{})});
window.addEventListener('tdngo-maintenance-alert',e=>play(e.detail||{}));
window.tdngoTechAlertFresh=fresh;
})();