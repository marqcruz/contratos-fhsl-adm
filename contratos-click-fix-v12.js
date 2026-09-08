(function(){
'use strict';
function css(){
  if(document.getElementById('contratos-click-fix-v12-css'))return;
  var s=document.createElement('style');
  s.id='contratos-click-fix-v12-css';
  s.textContent=`
#lista-body tr.v8-parent[data-has-children="1"]{cursor:default!important}
#lista-body .v11-toggle{touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;white-space:nowrap}
#lista-body .v11-toggle:focus{outline:2px solid var(--accent);outline-offset:2px}
`;
  document.head.appendChild(s);
}
function fixRows(){
  document.querySelectorAll('#lista-body tr.v8-parent').forEach(function(tr){
    tr.onclick=null;
    var b=tr.querySelector('.v11-toggle');
    if(!b)return;
    var txt=(b.textContent||'').trim();
    var n=(txt.match(/(\d+)\s+aditivo/i)||[])[1]||'';
    var aberto=txt.indexOf('−')>=0;
    b.textContent=(aberto?'Ocultar':'Exibir')+(n?' '+n+' aditivo'+(n==='1'?'':'s'):' aditivos');
    b.title=aberto?'Ocultar aditivos deste contrato':'Exibir aditivos deste contrato';
  });
}
function installGuard(){
  var body=document.getElementById('lista-body');
  if(!body||body.dataset.clickFixV12)return;
  body.dataset.clickFixV12='1';
  body.addEventListener('click',function(e){
    var tr=e.target.closest&&e.target.closest('tr.v8-parent');
    if(!tr)return;
    if(e.target.closest('.v11-toggle,.v10-edit,[data-detail],button,a,input,select,textarea,label'))return;
    e.preventDefault();
    e.stopPropagation();
  },true);
}
var old=typeof renderLista==='function'?renderLista:null;
if(old){
  renderLista=function(){
    var r=old.apply(this,arguments);
    setTimeout(function(){try{css();installGuard();fixRows()}catch(e){console.warn('[Contratos click fix]',e)}},0);
    return r;
  };
}
css();
setTimeout(function(){installGuard();fixRows()},0);
})();
