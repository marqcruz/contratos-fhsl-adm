(function(){
'use strict';
function lockLista(){
  var order=document.getElementById('f-order');
  var dir=document.getElementById('f-dir');
  var per=document.getElementById('f-per');
  if(order){order.value='empresa';order.disabled=true;order.title='Ordenação fixa por empresa';}
  if(dir){dir.value='asc';dir.disabled=true;dir.title='Ordem crescente fixa';}
  if(per){per.value='10';per.disabled=true;per.title='10 contratos por página';}
  window.listaPage=Number(window.listaPage)||1;
}
var original=typeof renderLista==='function'?renderLista:null;
if(original){
  renderLista=function(){
    lockLista();
    return original.apply(this,arguments);
  };
}
lockLista();
try{if(typeof renderLista==='function')renderLista();}catch(e){console.warn('[TDNGo Contratos] lista fixa',e)}
})();
