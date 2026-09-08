(function(){
'use strict';
function normalizeRow(tr){
  if(!tr)return;
  tr.onclick=null;
  var td=tr.children&&tr.children[2];
  if(!td)return;
  var pill=td.querySelector('.v10-cat');
  td.querySelectorAll(':scope > br').forEach(function(br){br.remove();});
  if(pill){td.insertBefore(document.createElement('br'),pill);}
}
function normalizeAll(){
  document.querySelectorAll('#lista-body tr.v8-parent').forEach(normalizeRow);
}
function install(){
  var body=document.getElementById('lista-body');
  if(!body||body.dataset.layoutFixV13)return;
  body.dataset.layoutFixV13='1';
  body.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('.v11-toggle');
    if(t){setTimeout(normalizeAll,0);return;}
    var tr=e.target.closest&&e.target.closest('tr.v8-parent');
    if(!tr)return;
    if(e.target.closest('button,a,.link,input,select,textarea,label'))return;
    e.preventDefault();
    e.stopPropagation();
  },true);
}
var old=typeof renderLista==='function'?renderLista:null;
if(old){
  renderLista=function(){
    var r=old.apply(this,arguments);
    setTimeout(function(){install();normalizeAll();},0);
    return r;
  };
}
setTimeout(function(){install();normalizeAll();},0);
})();
