(()=>{'use strict';
if(window.__TDNGO_MANUT_TV_V27__)return;window.__TDNGO_MANUT_TV_V27__=true;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function css(){
 if($('#manut-tv-v27-css'))return;
 const s=document.createElement('style');s.id='manut-tv-v27-css';s.textContent=`
#page-dashboard{--tv-border:#d8e2ed;--tv-blue:#1769d2;--tv-red:#b42318;--tv-amber:#a15c00;--tv-green:#18794e}
#page-dashboard .page-head{align-items:center;margin-bottom:12px}
#page-dashboard .page-head h2{font-size:25px;letter-spacing:-.02em;margin-bottom:3px}
#page-dashboard .page-head p{font-size:12px}
#page-dashboard .page-head .actions{align-items:center;flex-wrap:wrap}
#page-dashboard .tv-clock{min-width:148px;padding:8px 12px;border:1px solid var(--tv-border);border-radius:12px;background:#fff;text-align:right;box-shadow:0 1px 2px rgba(15,23,42,.04)}
#page-dashboard .tv-clock strong{display:block;font-size:22px;line-height:1;font-variant-numeric:tabular-nums}
#page-dashboard .tv-clock span{display:block;margin-top:4px;font-size:9px;color:#64748b;text-transform:uppercase;font-weight:800;letter-spacing:.04em}
#page-dashboard .live-banner{min-height:44px;padding:10px 13px;border-radius:12px;font-size:11px;box-shadow:0 1px 2px rgba(15,23,42,.04)}
#page-dashboard .live-banner .tv-last-update{margin-left:auto;white-space:nowrap;font-weight:800;color:#315a7f}
#page-dashboard .kpis{grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:10px!important;margin-top:12px}
#page-dashboard .kpi{min-height:92px;padding:14px 15px!important;display:flex!important;flex-direction:column;justify-content:center;position:relative;overflow:hidden;border:1px solid var(--tv-border)!important;box-shadow:0 2px 8px rgba(15,23,42,.04)!important}
#page-dashboard .kpi:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#cbd5e1}
#page-dashboard .kpi b{font-size:30px!important;line-height:1!important;font-variant-numeric:tabular-nums}
#page-dashboard .kpi span{margin-top:7px!important;font-size:9px!important;letter-spacing:.04em;text-transform:uppercase;font-weight:850!important;color:#526173!important}
#page-dashboard .kpi.tv-danger{background:#fff7f7!important;border-color:#efc8c5!important}
#page-dashboard .kpi.tv-danger:before{background:#d92d20}
#page-dashboard .kpi.tv-danger b{color:#b42318!important}
#page-dashboard .kpi.tv-warning{background:#fffaf0!important;border-color:#edd6a6!important}
#page-dashboard .kpi.tv-warning:before{background:#d97706}
#page-dashboard .kpi.tv-warning b{color:#9a5b00!important}
#page-dashboard .kpi.tv-success{background:#f4fbf7!important;border-color:#c7e6d2!important}
#page-dashboard .kpi.tv-success:before{background:#22915a}
#page-dashboard .kpi.tv-info:before{background:#1769d2}
#page-dashboard .ops-grid{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:10px!important;margin-top:12px!important}
#page-dashboard .ops-card{min-height:92px!important;padding:14px 15px!important;display:flex!important;flex-direction:column!important;justify-content:center!important;position:relative!important;overflow:hidden!important;border:1px solid var(--tv-border)!important;border-radius:14px!important;box-shadow:0 2px 8px rgba(15,23,42,.04)!important}
#page-dashboard .ops-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#1769d2}#page-dashboard .ops-card.tv-danger{background:#fff7f7!important;border-color:#efc8c5!important}#page-dashboard .ops-card.tv-danger:before{background:#d92d20}#page-dashboard .ops-card.tv-danger b{color:#b42318!important}#page-dashboard .ops-card.tv-warning{background:#fffaf0!important;border-color:#edd6a6!important}#page-dashboard .ops-card.tv-warning:before{background:#d97706}#page-dashboard .ops-card.tv-warning b{color:#9a5b00!important}#page-dashboard .ops-card.tv-success{background:#f4fbf7!important;border-color:#c7e6d2!important}#page-dashboard .ops-card.tv-success:before{background:#22915a}#page-dashboard .ops-card.tv-success b{color:#18794e!important}
#page-dashboard .ops-card b{font-size:30px!important;line-height:1!important;font-variant-numeric:tabular-nums}
#page-dashboard .ops-card span{margin-top:7px!important;font-size:9px!important;letter-spacing:.04em;text-transform:uppercase;font-weight:850!important;color:#526173!important}
#page-dashboard .ops-columns{display:grid!important;grid-template-columns:minmax(0,2fr) minmax(280px,.8fr)!important;gap:12px!important;align-items:stretch!important}
#page-dashboard .ops-panel{border-radius:14px!important;border:1px solid var(--tv-border)!important;box-shadow:0 2px 10px rgba(15,23,42,.05)!important;padding:14px!important}
#page-dashboard .ops-panel>h3{font-size:14px!important;margin:0 0 12px!important;text-transform:uppercase;letter-spacing:.02em}
#page-dashboard .decision-list{display:grid!important;gap:9px!important}
#page-dashboard .field-ticket{border:1px solid #d9e3ee!important;border-left:5px solid #1769d2!important;border-radius:12px!important;background:#fff!important;padding:12px 13px!important}
#page-dashboard .field-ticket:has(.p1),#page-dashboard .field-ticket:has(.bad){border-left-color:#d92d20!important;background:#fff9f9!important}
#page-dashboard .field-ticket:has(.p2){border-left-color:#e58a00!important;background:#fffaf1!important}
#page-dashboard .field-ticket h4{font-size:13px!important;margin:7px 0 5px!important}
#page-dashboard .field-sub{font-size:10px!important;line-height:1.45!important}
#page-dashboard .field-actions .btn{min-height:34px!important;font-weight:800!important}
#page-dashboard .team-list{display:grid!important;gap:8px!important}
#page-dashboard .team-row{min-height:52px!important;padding:9px 10px!important;border:1px solid #e0e6ed!important;border-radius:10px!important;background:#fafcfe!important}
#page-dashboard .team-row b{font-size:11px!important}
#page-dashboard .team-state{font-size:8px!important;font-weight:900!important}
#page-dashboard .section{margin-top:18px}
#page-dashboard .section-title h3{font-size:14px!important;letter-spacing:.01em}
#page-dashboard .table-wrap{border-radius:14px!important;border:1px solid var(--tv-border)!important;box-shadow:0 2px 10px rgba(15,23,42,.04)}
#page-dashboard .table th{height:38px;font-size:9px!important}
#page-dashboard .table td{padding-top:12px!important;padding-bottom:12px!important}
#page-dashboard .row-link{font-size:12px!important;font-weight:900!important}
#page-dashboard .ticket-title{font-size:11px!important;font-weight:750!important}
#page-dashboard .ticket-sub{font-size:9px!important}
#page-dashboard [class*="decision"],#page-dashboard [class*="decisao"],#page-dashboard [class*="attention"],#page-dashboard [class*="critical"]{scroll-margin-top:12px}
#page-dashboard .tv-empty-ok{padding:18px;border:1px dashed #b9d7c5;border-radius:12px;background:#f5fbf7;color:#21623f;text-align:center;font-weight:750}
@keyframes tvPulse{0%,100%{box-shadow:0 0 0 0 rgba(217,45,32,.08)}50%{box-shadow:0 0 0 7px rgba(217,45,32,.04)}}
#page-dashboard .kpi.tv-danger.tv-live-pulse{animation:tvPulse 2.3s ease-in-out infinite}
@media(min-width:1500px){
 #page-dashboard .page-head h2{font-size:28px}
 #page-dashboard .kpi{min-height:104px}
 #page-dashboard .kpi b{font-size:36px!important}
 #page-dashboard .main{font-size:13px}
}
@media(max-width:1250px){#page-dashboard .kpis,#page-dashboard .ops-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}#page-dashboard .ops-columns{grid-template-columns:1fr!important}}
@media(max-width:760px){
 #page-dashboard .kpis,#page-dashboard .ops-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
 #page-dashboard .tv-clock{display:none}
 #page-dashboard .live-banner .tv-last-update{display:none}
}
`;document.head.appendChild(s);
}
function classifyKpis(){
 $('#page-dashboard .kpi,#page-dashboard .ops-card').forEach(card=>{
   card.classList.remove('tv-danger','tv-warning','tv-success','tv-info','tv-live-pulse');
   const label=(card.querySelector('span')?.textContent||'').toUpperCase();
   const n=Number((card.querySelector('b')?.textContent||'0').replace(/\D/g,''))||0;
   if(/SLA|P1|P2|CRIT|SEM RESPONS/.test(label)&&n>0){card.classList.add('tv-danger','tv-live-pulse');return}
   if(/SOBREAVISO|ABERT|ATRIBU/.test(label)&&n>0){card.classList.add('tv-warning');return}
   if(/CONCLU/.test(label)){card.classList.add('tv-success');return}
   card.classList.add('tv-info');
 });
}
function ensureClock(){
 const actions=$('#page-dashboard .page-head .actions');if(!actions)return;
 let box=$('#page-dashboard .tv-clock');
 if(!box){box=document.createElement('div');box.className='tv-clock';box.innerHTML='<strong>--:--</strong><span>--</span>';actions.prepend(box)}
}
function tick(){
 const box=$('#page-dashboard .tv-clock');if(!box)return;
 const d=new Date();box.querySelector('strong').textContent=d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 box.querySelector('span').textContent=d.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'});
}
function ensureLastUpdate(){
 const bar=$('#page-dashboard .live-banner');if(!bar)return;
 let u=bar.querySelector('.tv-last-update');if(!u){u=document.createElement('span');u.className='tv-last-update';bar.appendChild(u)}
}
function markUpdated(){const u=$('#page-dashboard .tv-last-update');if(u)u.textContent='Atualizado às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
function enhance(){
 css();ensureClock();ensureLastUpdate();classifyKpis();markUpdated();
 const empty=$('#page-dashboard #dash-table .empty');if(empty&&/nenhum chamado/i.test(empty.textContent||'')){empty.classList.add('tv-empty-ok');empty.textContent='✓ Nenhum chamado prioritário ou recente no momento.'}
}
function start(){
 enhance();tick();setInterval(tick,1000);
 let t;const watch=()=>{clearTimeout(t);t=setTimeout(()=>{classifyKpis();markUpdated()},80)};['#dash-kpis','#dash-table','#ops-desktop'].forEach(sel=>{const x=$(sel);if(x){const mo=new MutationObserver(watch);mo.observe(x,{childList:true,subtree:true})}})
 const old=window.refreshAll;if(typeof old==='function'&&!old.__tv27){const fn=async function(...a){const r=await old.apply(this,a);setTimeout(enhance,50);return r};fn.__tv27=true;window.refreshAll=fn}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();