(function(){
'use strict';

/* Injeta o módulo Patrimônios na Central mantendo o mesmo controle de módulos do TDNGo. */
try{
  var grid=document.getElementById('hub-grid');
  if(grid&&!grid.querySelector('[data-mod="patrimonios"]')){
    var admin=grid.querySelector('[data-mod="admin"]');
    var a=document.createElement('a');
    a.className='hub-card';a.setAttribute('data-mod','patrimonios');a.setAttribute('data-cat','gestao');
    a.setAttribute('data-search','patrimonio patrimônios bens inventário depreciação qr code equipamentos móveis ativos unidade localização');
    a.href='patrimonios.html';
    a.onpointerdown=function(){try{sessionStorage.setItem('tdngo_explicit_nav',Date.now()+'|patrimonios.html')}catch(e){}};
    a.innerHTML='<span class="hub-ico">🏷️</span><h3>Patrimônios</h3><p>Bens, QR Code, localização, inventário, fotos e depreciação.</p><span class="hub-tag ativo">Disponível</span>';
    if(admin)grid.insertBefore(a,admin);else grid.appendChild(a);
  }
}catch(e){}

/* Remove recursos de recentes/favoritos. A Central fica determinística e limpa. */
try{
  var q=document.getElementById('hub-quick-section');
  if(q)q.remove();
}catch(e){}

window.prepararHub=function(){
  document.querySelectorAll('#hub-grid .hub-card .hub-fav').forEach(function(x){x.remove();});
};
window.renderAcessoRapido=function(){};
window.registrarUsoModulo=function(){};
window.alternarFavorito=function(){};
window.atualizarFavoritosVisuais=function(){};

var style=document.createElement('style');
style.id='tdngo-index-v3';
style.textContent=`
/* Central TDNGo v3 */
.hub-wrap{
  min-height:100vh!important;
  display:block!important;
  padding:24px 28px 32px!important;
  background:
    radial-gradient(circle at 8% -10%,color-mix(in srgb,var(--accent) 10%,transparent),transparent 34%),
    var(--bg)!important;
}
.hub-shell{max-width:1380px!important;margin:0 auto!important;width:100%!important}
.hub-top{
  display:flex!important;align-items:center!important;justify-content:space-between!important;
  gap:18px!important;margin:0 0 22px!important;padding:0 2px!important;min-height:52px!important
}
.hub-brand{display:flex!important;align-items:center!important;gap:12px!important}
.hub-brand-icon{
  width:44px!important;height:44px!important;border-radius:12px!important;
  box-shadow:0 8px 22px color-mix(in srgb,var(--accent) 24%,transparent)!important
}
.hub-brand h1{font-size:18px!important;font-weight:800!important;letter-spacing:-.25px!important}
.hub-brand p{font-size:11px!important;color:var(--text3)!important;margin-top:2px!important}
.hub-topuser{position:static!important;display:flex!important;align-items:center!important;gap:9px!important}
.hub-user-compact{
  margin:0!important;min-width:210px!important;border:1px solid var(--border)!important;
  background:var(--surface)!important;box-shadow:var(--shadow)!important
}
.hub-hero{
  display:grid!important;grid-template-columns:minmax(0,1fr) minmax(300px,430px)!important;
  align-items:center!important;gap:28px!important;margin:0 0 14px!important;padding:24px 26px!important;
  border:1px solid var(--border)!important;border-radius:18px!important;background:var(--surface)!important;
  box-shadow:0 8px 28px rgba(0,0,0,.08)!important
}
.hub-hero h2{font-size:24px!important;font-weight:820!important;letter-spacing:-.5px!important;margin:0 0 4px!important}
.hub-hero p{font-size:12px!important;color:var(--text2)!important;margin:0!important}
.hub-search-wrap{width:100%!important}
.hub-search{
  min-height:44px!important;border-radius:11px!important;padding:10px 42px 10px 14px!important;
  background:var(--surface2)!important;border:1px solid var(--border)!important
}
.hub-filters{
  display:flex!important;align-items:center!important;gap:7px!important;flex-wrap:wrap!important;
  margin:0 0 20px!important;padding:2px!important
}
.hub-filter{
  padding:7px 11px!important;border-radius:9px!important;background:transparent!important;
  border:1px solid transparent!important;color:var(--text2)!important;font-size:11px!important
}
.hub-filter:hover{background:var(--surface)!important;border-color:var(--border)!important;color:var(--text)!important}
.hub-filter.active{
  background:var(--surface)!important;border-color:var(--accent)!important;color:var(--accent-text)!important;
  box-shadow:var(--shadow)!important
}
.hub-section{margin-top:0!important}
.hub-section-head{
  display:flex!important;align-items:end!important;justify-content:space-between!important;
  margin:0 2px 10px!important;padding:0!important
}
.hub-section-title{font-size:12px!important;font-weight:800!important;letter-spacing:.055em!important}
.hub-section-sub{font-size:10px!important;color:var(--text3)!important;margin-top:2px!important}
.hub-grid{
  display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;
  gap:12px!important;max-width:none!important;width:100%!important
}
.hub-card{
  display:grid!important;grid-template-columns:46px minmax(0,1fr)!important;grid-template-rows:auto 1fr!important;
  column-gap:12px!important;row-gap:3px!important;min-height:112px!important;padding:16px!important;
  border:1px solid var(--border)!important;border-radius:14px!important;background:var(--surface)!important;
  color:var(--text)!important;text-decoration:none!important;box-shadow:none!important;overflow:hidden!important;
  transform:none!important;transition:border-color .14s ease,background .14s ease,box-shadow .14s ease!important
}
.hub-card:hover{
  transform:none!important;border-color:color-mix(in srgb,var(--accent) 72%,var(--border))!important;
  background:color-mix(in srgb,var(--surface) 92%,var(--accent-bg))!important;
  box-shadow:0 8px 24px rgba(0,0,0,.11)!important
}
.hub-ico{
  grid-row:1/3!important;width:46px!important;height:46px!important;margin:0!important;border-radius:12px!important;
  display:flex!important;align-items:center!important;justify-content:center!important;font-size:22px!important;
  background:var(--surface2)!important;border:1px solid var(--border)!important
}
.hub-card:hover .hub-ico{background:var(--accent-bg)!important;border-color:color-mix(in srgb,var(--accent) 35%,var(--border))!important}
.hub-card h3{
  margin:2px 0 0!important;padding:0!important;font-size:13px!important;font-weight:800!important;
  line-height:1.25!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important
}
.hub-card p{
  margin:3px 0 0!important;font-size:10.5px!important;color:var(--text2)!important;line-height:1.4!important;
  display:-webkit-box!important;-webkit-line-clamp:2!important;line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important
}
.hub-tag,.hub-fav,.hub-category-label{display:none!important}
.hub-empty{
  margin-top:12px!important;padding:34px!important;background:var(--surface)!important;border:1px dashed var(--border)!important;
  border-radius:14px!important
}
.hub-footer{
  margin-top:24px!important;padding-top:15px!important;border-top:1px solid var(--border)!important;
  font-size:10px!important;color:var(--text3)!important
}
@media(max-width:1180px){.hub-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
@media(max-width:860px){
  .hub-wrap{padding:16px!important}.hub-hero{grid-template-columns:1fr!important;gap:14px!important;padding:19px!important}
  .hub-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.hub-user-compact{min-width:0!important}
}
@media(max-width:600px){
  .hub-wrap{padding:12px!important}.hub-top{align-items:flex-start!important;gap:10px!important}.hub-brand p{display:none!important}
  .hub-user-compact{max-width:175px!important}.hub-user-compact .user-role{display:none!important}
  .hub-hero h2{font-size:20px!important}.hub-grid{grid-template-columns:1fr!important}.hub-card{min-height:100px!important}
  .hub-filters{overflow-x:auto!important;flex-wrap:nowrap!important;padding-bottom:4px!important}.hub-filter{white-space:nowrap!important}
}
`;
document.head.appendChild(style);

function clean(){
  try{
    var quick=document.getElementById('hub-quick-section');if(quick)quick.remove();
    document.querySelectorAll('.hub-fav').forEach(function(x){x.remove();});
  }catch(e){}
}
clean();
window.addEventListener('DOMContentLoaded',clean,{once:true});
})();
