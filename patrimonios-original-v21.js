(()=>{
'use strict';
function install(){
  document.documentElement.classList.add('pm-original-restored');
  const old=document.getElementById('pm-original-v21'); if(old) old.remove();
  const s=document.createElement('style'); s.id='pm-original-v21'; s.textContent=`
  /* Restaura a linguagem visual do arquivo-base original */
  :root{--pm-bg:#0d1117;--pm-surface:#161b22;--pm-surface2:#10151d;--pm-border:#2a3140;--pm-text:#e6edf3;--pm-muted:#8793a2;--pm-accent:#2388e8;--pm-accent2:#79c0ff}
  body{background:#0d1117!important;color:#e6edf3!important;font-size:13px!important}
  .app{min-height:100vh!important;display:flex!important}
  .side{display:block!important;width:238px!important;background:#161b22!important;border-right:1px solid #2a3140!important;padding:16px!important;position:fixed!important;inset:0 auto 0 0!important;overflow:auto!important}
  .main{margin-left:238px!important;padding:22px!important;min-width:0!important;width:calc(100% - 238px)!important;max-width:none!important}
  .brand{display:flex!important;align-items:center!important;gap:10px!important;padding-bottom:15px!important;border-bottom:1px solid #2a3140!important;margin-bottom:14px!important}
  .brand .ico{width:38px!important;height:38px!important;border-radius:10px!important;background:#2388e8!important;display:grid!important;place-items:center!important;color:#fff!important}
  .brand b{font-size:14px!important}.brand span{display:block!important;color:#7d8996!important;font-size:10px!important}
  .nav{display:block!important}.nav button{width:100%!important;border:0!important;background:transparent!important;color:#9aa7b8!important;text-align:left!important;padding:9px 10px!important;border-radius:7px!important;margin:2px 0!important;cursor:pointer!important;display:block!important}
  .nav button:hover,.nav button.active{background:#15243a!important;color:#79c0ff!important}.nav .pm-ico{display:none!important}.nav .pm-label{font-size:inherit!important}
  .pm-appbar,.pm-bottom,.pm-more-bg{display:none!important}
  .page>.top{display:flex!important}.top{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:14px!important;margin-bottom:18px!important}.top h1{font-size:21px!important;margin:0!important}.top p{margin:3px 0 0!important;color:#8b98a8!important}
  .card,.pm-health-card,.inv15-card,.inv15-kpi,.inv16-sum{background:#161b22!important;border:1px solid #2a3140!important;border-radius:10px!important;box-shadow:none!important;color:#e6edf3!important}
  .btn{border:1px solid #303a49!important;background:#161b22!important;color:#d7dee7!important;border-radius:7px!important;padding:8px 11px!important;box-shadow:none!important}.btn:hover{background:#202735!important}.btn.primary{background:#2388e8!important;border-color:#2388e8!important;color:#fff!important}.btn.red{background:#6d262b!important;border-color:#6d262b!important;color:#fff!important}.btn.green{background:#1f6f43!important;border-color:#1f6f43!important;color:#fff!important}
  input,select,textarea,.inv16-search,.inv16-filter{background:#10151d!important;color:#e6edf3!important;border:1px solid #303a49!important;border-radius:7px!important;padding:8px 9px!important;box-shadow:none!important}
  .table,.pm-health-table{overflow:auto!important;border:1px solid #2a3140!important;border-radius:9px!important;background:#161b22!important}.table table,.pm-health-table table{width:100%!important;border-collapse:collapse!important}.table th,.table td,.pm-health-table th,.pm-health-table td{padding:9px 10px!important;border-bottom:1px solid #242c38!important;text-align:left!important;vertical-align:top!important}.table th,.pm-health-table th{font-size:9px!important;color:#8793a2!important;text-transform:uppercase!important;background:#1c2230!important}.table td,.pm-health-table td{font-size:11px!important}
  .grid4{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}.stat{min-height:0!important;padding:14px!important}.stat .num{font-size:25px!important}.stat .lbl{font-size:10px!important}
  .toolbar{display:flex!important;gap:7px!important;flex-wrap:wrap!important;margin-bottom:10px!important}.toolbar input{flex:1!important;min-width:200px!important;width:auto!important}.toolbar select{width:auto!important}
  /* Inventário novo com estética do módulo original */
  #p-inventario{max-width:none!important;margin:0!important;padding:0!important}.inv15-head{display:flex!important;justify-content:space-between!important;gap:12px!important;align-items:flex-start!important;margin-bottom:15px!important}.inv15-head h1{font-size:21px!important}.inv15-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}.inv15-card{padding:14px!important}.inv15-progress{height:7px!important;background:#28313e!important}.inv15-stats{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:6px!important;background:transparent!important;border:0!important}.inv15-stat{background:#10151d!important;border-radius:8px!important;padding:8px!important}.inv15-actions{display:flex!important;gap:6px!important;margin-top:11px!important}.inv15-actions .btn{width:auto!important;flex:1!important}.inv16-summary{display:none!important}.inv16-toolbar{display:none!important}
  .inv15-sheet{background:#161b22!important;border:1px solid #2a3140!important;border-radius:13px!important}.inv15-sheet-h{background:#161b22!important;border-bottom:1px solid #2a3140!important}.inv15-sheet-b{background:#161b22!important}.inv15-camera{border-color:#2a3140!important}
  /* Saúde / manutenção no mesmo padrão */
  .pm-health-section-title h1{font-size:21px!important}.pm-health-kpis{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}.pm-hk{background:#161b22!important;border:1px solid #2a3140!important;border-radius:10px!important;padding:14px!important;min-height:0!important}.pm-health-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important}
  .pm-health-table table{min-width:900px!important}.pm-health-toolbar{display:flex!important;gap:7px!important;flex-wrap:wrap!important}.pm-health-toolbar input{flex:1!important;min-width:200px!important}.pm-health-toolbar select{width:auto!important}
  .pm-scan-clear{position:static!important;bottom:auto!important;border-radius:7px!important;min-height:40px!important;margin-top:10px!important;box-shadow:none!important;background:#161b22!important;color:#79c0ff!important;border-color:#303a49!important}
  .pm-focus-note{font-size:9px!important}
  @media(max-width:1000px){.grid4,.pm-health-kpis{grid-template-columns:repeat(2,1fr)!important}.inv15-grid{grid-template-columns:1fr!important}.pm-health-grid{grid-template-columns:1fr!important}}
  @media(max-width:760px){
    .app{display:block!important}.side{position:static!important;width:100%!important;height:auto!important;padding:12px!important}.main{margin:0!important;width:100%!important;padding:12px!important;min-height:0!important}
    .nav{display:flex!important;overflow:auto!important;gap:4px!important}.nav button{display:block!important;width:auto!important;white-space:nowrap!important;flex:0 0 auto!important}.nav .pm-label{font-size:inherit!important}
    .grid4,.pm-health-kpis,.pm-health-grid{grid-template-columns:1fr!important}.top{display:block!important}.actions{margin-top:10px!important}.toolbar{display:flex!important}.toolbar input{min-width:100%!important}.toolbar select{flex:1!important;min-width:140px!important}
    .table,.pm-health-table{overflow:auto!important}.table table,.pm-health-table table{display:table!important;min-width:900px!important}.table thead,.pm-health-table thead{display:table-header-group!important}.table tbody,.pm-health-table tbody{display:table-row-group!important}.table tr,.pm-health-table tr{display:table-row!important}.table td,.table th,.pm-health-table td,.pm-health-table th{display:table-cell!important}
    .inv15-grid{grid-template-columns:1fr!important}.inv15-modal{padding:10px!important;align-items:center!important}.inv15-sheet{width:min(900px,97vw)!important;height:auto!important;max-height:94dvh!important;border-radius:13px!important}.inv15-sheet-h{padding-top:13px!important}.inv15-sheet-b{padding-bottom:15px!important}.inv15-kpis{grid-template-columns:repeat(2,1fr)!important}.inv15-work{grid-template-columns:1fr!important}.inv15-camera{height:min(48dvh,430px)!important;min-height:300px!important}
    .pm-scan-clear{position:static!important}.pm-install-card{display:none!important}
  }
  `; document.head.appendChild(s);

  // Reconstitui rótulos do menu quando camadas anteriores os embrulharam.
  const labels={dashboard:'▦ Dashboard',bens:'🏷 Bens patrimoniais',scanner:'▣ Escanear QR',inventario:'☑ Inventários',manutencao:'🔧 Manutenção clínica',relatorios:'▥ Relatórios',config:'⚙ Configurações',importacao:'⇧ Importação inicial'};
  document.querySelectorAll('.nav button[data-page]').forEach(b=>{const p=b.dataset.page; if(labels[p]) b.textContent=labels[p];});
  const brand=document.querySelector('.brand .ico'); if(brand) brand.textContent='🏷️';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,2200));else setTimeout(install,2200);
})();