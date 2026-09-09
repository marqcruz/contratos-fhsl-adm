(function(){
'use strict';
function reaplica(){
  try{if(typeof window.tdngoCategoriasRedecorate==='function')window.tdngoCategoriasRedecorate();}catch(e){console.warn('[Categorias stable]',e)}
}
var old=typeof renderLista==='function'?renderLista:null;
if(old){
  renderLista=function(){
    var r=old.apply(this,arguments);
    setTimeout(reaplica,0);
    setTimeout(reaplica,40);
    return r;
  };
}
setTimeout(reaplica,80);
})();