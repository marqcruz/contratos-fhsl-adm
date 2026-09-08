(function(){
'use strict';
function meta(a){
  try{if(typeof tdngoMetaAditivo==='function')return tdngoMetaAditivo(a)||null}catch(e){}
  var s=String(a&&a.prorrogacao||''),i=s.indexOf('TDNGO_ADITIVO:');
  if(i>=0){try{return JSON.parse(s.slice(i+'TDNGO_ADITIVO:'.length))}catch(e){}}
  return null;
}
function listaContratos(){
  try{if(typeof contracts!=='undefined'&&Array.isArray(contracts))return contracts}catch(e){}
  try{if(Array.isArray(window.contracts))return window.contracts}catch(e){}
  return [];
}
function ajustarVigencias(){
  var body=document.getElementById('lista-body');
  var lista=listaContratos();
  if(!body||!lista.length)return;
  body.querySelectorAll('tr.v8-child').forEach(function(tr){
    var link=tr.querySelector('[data-detail]');
    if(!link)return;
    var id=link.getAttribute('data-detail');
    var c=lista.find(function(x){return String(x.id)===String(id)});
    if(!c||c.tipo!=='Termo Aditivo')return;
    var td=tr.children&&tr.children[3];
    if(!td)return;
    var divs=td.querySelectorAll(':scope > div');
    if(!divs.length)return;
    var inicio=String(c.vigenciaInicio||'').trim();
    var m=meta(c);
    if(inicio){
      divs[0].textContent=inicio;
      return;
    }
    if(m&&m.vigencia===false){
      divs[0].textContent='Vigência global mantida';
      divs[0].style.fontSize='11px';
      divs[0].style.fontWeight='600';
      divs[0].style.color='var(--text2)';
    }else{
      divs[0].textContent='Data não informada';
      divs[0].style.fontSize='11px';
      divs[0].style.fontWeight='400';
      divs[0].style.color='var(--text3)';
    }
  });
}
var original=window.renderLista;
if(typeof original==='function'){
  window.renderLista=function(){
    var r=original.apply(this,arguments);
    try{ajustarVigencias()}catch(e){console.warn('[Contratos vigência]',e)}
    return r;
  };
}
try{ajustarVigencias()}catch(e){console.warn('[Contratos vigência inicial]',e)}
})();
