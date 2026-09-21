(function(){
'use strict';
if(window.__TDNGO_CONTRATOS_UX20__)return;window.__TDNGO_CONTRATOS_UX20__=true;

function el(id){return document.getElementById(id)}
function getDensity(){try{return localStorage.getItem('tdngo_contratos_density')||'compact'}catch(e){return'compact'}}
function setDensity(v){try{localStorage.setItem('tdngo_contratos_density',v)}catch(e){}applyDensity(v)}
function applyDensity(v){
  var page=el('page-lista');if(!page)return;
  page.classList.toggle('ux20-compact',v==='compact');
  var b=el('ux20-density');
  if(b){
    b.textContent=v==='compact'?'▤ Compacto':'☰ Confortável';
    b.title=v==='compact'?'Exibição compacta ativa. Clique para aumentar o espaçamento.':'Exibição confortável ativa. Clique para compactar a lista.';
  }
}
function css(){
  if(el('contratos-ux-v20-css'))return;
  var s=document.createElement('style');s.id='contratos-ux-v20-css';s.textContent=`
#ux20-density{white-space:nowrap}
#page-lista.ux20-compact .table-wrap{font-size:11px}
#page-lista.ux20-compact table th{padding:7px 9px!important;font-size:9px!important;line-height:1.05!important}
#page-lista.ux20-compact table td{padding:6px 9px!important;font-size:11px!important;line-height:1.18!important;vertical-align:middle!important}
#page-lista.ux20-compact .v8-parent td{border-top-width:1px!important}
#page-lista.ux20-compact .v8-child td:first-child{padding-left:22px!important}
#page-lista.ux20-compact .badge{padding:2px 6px!important;font-size:8.5px!important;line-height:1.15!important}
#page-lista.ux20-compact .v8-days{margin-top:2px!important;font-size:9px!important;line-height:1.1!important}
#page-lista.ux20-compact .v8-pend{margin-top:3px!important;padding:1px 5px!important;font-size:8px!important}
#page-lista.ux20-compact td:nth-child(2) b{font-size:11px!important;line-height:1.1!important}
#page-lista.ux20-compact td:nth-child(2) div{font-size:9px!important;line-height:1.1!important;margin-top:1px!important}
#page-lista.ux20-compact td:nth-child(3){max-width:155px!important}
#page-lista.ux20-compact td:nth-child(3),#page-lista.ux20-compact td:nth-child(4){font-size:10px!important}
#page-lista.ux20-compact td:nth-child(7) .btn{padding:4px 8px!important;min-height:26px!important;font-size:9px!important}
#page-lista.ux20-compact #lista-pager{padding:7px 9px!important;font-size:10px!important}
#page-lista.ux20-compact #lista-pager .btn{padding:4px 7px!important;min-height:28px!important}
#page-lista.ux20-compact #lista-pager select{height:28px!important;font-size:10px!important}
#page-lista.ux20-compact .v8-child{opacity:.96}
@media(max-width:900px){
  #page-lista.ux20-compact table{min-width:900px}
}
`;document.head.appendChild(s);
}
function install(){
  css();
  var page=el('page-lista');if(!page)return;
  var bar=el('gestao-v8');
  if(bar&&!el('ux20-density')){
    var b=document.createElement('button');
    b.type='button';b.id='ux20-density';b.className='btn sm';
    b.onclick=function(){setDensity(getDensity()==='compact'?'comfortable':'compact')};
    var spacer=bar.querySelector('.v8-spacer');
    if(spacer)bar.insertBefore(b,spacer);
    else bar.appendChild(b);
  }
  applyDensity(getDensity());
}
var oldRender=typeof renderLista==='function'?renderLista:null;
if(oldRender){
  renderLista=function(){
    var r=oldRender.apply(this,arguments);
    setTimeout(install,0);
    return r;
  }
}
setTimeout(install,120);
})();