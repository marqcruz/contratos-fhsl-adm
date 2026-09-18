(function(){
'use strict';
if(window.__TDNGO_CONTRATOS_UX19__)return;window.__TDNGO_CONTRATOS_UX19__=true;

function el(id){return document.getElementById(id)}
function active(x){return x&&x.classList&&x.classList.contains('active')}
function safeClick(x){try{if(x)x.click()}catch(e){}}

function css(){
  if(el('contratos-ux-v19-css'))return;
  var s=document.createElement('style');s.id='contratos-ux-v19-css';s.textContent=`
/* UX v19 — camada visual isolada; não altera regras de negócio */
#page-lista .toolbar{display:grid;grid-template-columns:minmax(300px,2fr) repeat(5,minmax(135px,auto));gap:8px;align-items:center;margin:0 0 10px}
#page-lista .toolbar #search{min-width:0;width:100%}
#page-lista .toolbar select,#page-lista .toolbar .btn{min-width:0;height:36px}
#page-lista .toolbar .ux19-clear{justify-content:center}
#page-lista .ux19-filter-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:-2px 0 10px;color:var(--text3);font-size:10px}
#page-lista .ux19-active{font-weight:700;color:var(--accent-text)}
#page-lista .ux19-hint kbd{display:inline-block;border:1px solid var(--border);border-bottom-width:2px;background:var(--surface);border-radius:5px;padding:1px 5px;font:700 9px/1.4 inherit;color:var(--text2)}
#page-lista .table-wrap{border-radius:10px}
#page-lista table thead th{position:sticky;top:0;z-index:3;background:var(--surface2)}
#page-lista tbody tr.v8-parent td{transition:background .12s}
#page-lista tbody tr.v8-parent:hover td{background:#f8fbfe}
#page-lista tbody tr.v8-child td{background:#fbfcfd}
#page-lista tbody tr.v8-child:hover td{background:#f3f7fb}
#page-lista #lista-pager{background:var(--surface);position:sticky;bottom:0;z-index:2}
#page-lista #lista-pager select{height:30px;border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--text);padding:3px 7px}
#gestao-v8{padding:2px 0 0}
#gestao-v8 .v8-chip,#gestao-v8 select,.v16-mainbtn,.v16-filterbtn,.f18-btn{transition:border-color .12s,background .12s,color .12s,box-shadow .12s}
#gestao-v8 .v8-chip:focus-visible,#gestao-v8 select:focus-visible,.v16-mainbtn:focus-visible,.v16-filterbtn:focus-visible,.f18-btn:focus-visible,
#page-lista .toolbar input:focus-visible,#page-lista .toolbar select:focus-visible,#page-lista .toolbar button:focus-visible{outline:3px solid rgba(29,106,173,.16);outline-offset:1px}
.loading-overlay{background:rgba(244,247,250,.90)!important;color:var(--accent)!important;backdrop-filter:blur(1px)}
.dialog-overlay,.modal-overlay,.v16-bg,.f18-bg{backdrop-filter:blur(2px)}
#page-novo .form-section{scroll-margin-top:18px}
#page-novo .fg input:required,#page-novo .fg select:required,#page-novo .fg textarea:required{border-left-width:3px}
#page-novo .fg input:required:valid,#page-novo .fg select:required:valid,#page-novo .fg textarea:required:valid{border-left-color:#86c99a}
#page-novo .form-actions{position:sticky;bottom:0;z-index:8;box-shadow:0 -6px 18px rgba(20,35,50,.05)}
@media(max-width:1250px){#page-lista .toolbar{grid-template-columns:minmax(260px,2fr) repeat(3,minmax(135px,1fr))}}
@media(max-width:850px){#page-lista .toolbar{grid-template-columns:1fr 1fr}#page-lista .toolbar #search{grid-column:1/-1}.ux19-hint{display:none}}
`;
  document.head.appendChild(s);
}

function countActive(){
  var n=0;
  var search=el('search');if(search&&search.value.trim())n++;
  ['f-tipo','f-status','v8-unidade','v10-categoria'].forEach(function(id){var x=el(id);if(x&&x.value)n++;});
  var bar=el('gestao-v8');
  if(bar){
    var st=bar.querySelector('[data-v8].active');
    if(st&&st.dataset.v8&&st.dataset.v8!=='todos')n++;
  }
  if(active(el('v8-pend')))n++;
  if(active(el('v16-filter')))n++;
  return n;
}

function updateMeta(){
  var box=el('ux19-filter-meta');if(!box)return;
  var n=countActive(),left=box.querySelector('.ux19-active');
  if(left)left.textContent=n?(n+' filtro'+(n===1?' ativo':'s ativos')):'Nenhum filtro adicional';
}

function clearFilters(){
  var search=el('search');if(search)search.value='';
  var type=el('f-tipo');if(type)type.value='';
  var status=el('f-status');if(status)status.value='';
  var order=el('f-order');if(order)order.value='numero';
  var dir=el('f-dir');if(dir)dir.value='desc';

  var todos=document.querySelector('#gestao-v8 [data-v8="todos"]');
  if(todos&&!active(todos))safeClick(todos);

  var uni=el('v8-unidade');if(uni&&uni.value){uni.value='';uni.dispatchEvent(new Event('change',{bubbles:true}));}
  var cat=el('v10-categoria');if(cat&&cat.value){cat.value='';cat.dispatchEvent(new Event('change',{bubbles:true}));}
  if(active(el('v8-pend')))safeClick(el('v8-pend'));
  if(active(el('v16-filter')))safeClick(el('v16-filter'));

  try{window.listaPage=1;if(typeof renderLista==='function')renderLista()}catch(e){console.warn('[UX19 clear]',e)}
  updateMeta();
  if(search)search.focus();
}

function installToolbar(){
  var page=el('page-lista'),tb=page&&page.querySelector('.toolbar');if(!tb)return;
  if(!el('ux19-clear')){
    var b=document.createElement('button');b.type='button';b.id='ux19-clear';b.className='btn ux19-clear';b.textContent='Limpar filtros';b.onclick=clearFilters;tb.appendChild(b);
  }
  if(!el('ux19-filter-meta')){
    var meta=document.createElement('div');meta.id='ux19-filter-meta';meta.className='ux19-filter-meta';
    meta.innerHTML='<span class="ux19-active">Nenhum filtro adicional</span><span class="ux19-hint"><kbd>/</kbd> buscar &nbsp; <kbd>Esc</kbd> limpar busca</span>';
    tb.insertAdjacentElement('afterend',meta);
  }
  var search=el('search');
  if(search){
    search.title='Busque por número, empresa, CNPJ, objeto ou aditivo';
    search.setAttribute('aria-label','Buscar contratos');
  }
  [['f-tipo','Filtrar por tipo'],['f-status','Filtrar por status'],['f-order','Ordenar contratos'],['f-dir','Direção da ordenação'],['f-per','Quantidade por página']].forEach(function(a){
    var x=el(a[0]);if(x){x.title=a[1];x.setAttribute('aria-label',a[1]);}
  });
  updateMeta();
}

function decorateRows(){
  document.querySelectorAll('#lista-body [data-detail]').forEach(function(x){
    if(x.tagName==='BUTTON'){
      x.title='Abrir detalhes do contrato';
      x.setAttribute('aria-label','Abrir detalhes do contrato');
    }
  });
  updateMeta();
}

function installKeys(){
  if(document.documentElement.dataset.ux19keys)return;
  document.documentElement.dataset.ux19keys='1';
  document.addEventListener('keydown',function(e){
    var tag=(e.target&&e.target.tagName||'').toLowerCase();
    var typing=tag==='input'||tag==='textarea'||tag==='select'||(e.target&&e.target.isContentEditable);
    if(e.key==='/'&&!typing&&document.querySelector('#page-lista.active')){
      e.preventDefault();var s=el('search');if(s){s.focus();s.select();}
    }else if(e.key==='Escape'&&document.activeElement===el('search')){
      if(el('search').value){el('search').value='';window.listaPage=1;try{renderLista()}catch(_){}}
      el('search').blur();
    }
  });
}

function install(){
  css();installToolbar();installKeys();decorateRows();
}

var oldRender=typeof renderLista==='function'?renderLista:null;
if(oldRender){
  renderLista=function(){
    var r=oldRender.apply(this,arguments);
    setTimeout(function(){try{installToolbar();decorateRows()}catch(e){console.warn('[UX19 render]',e)}},0);
    return r;
  };
}
var oldShow=typeof showPage==='function'?showPage:null;
if(oldShow){
  showPage=function(){
    var r=oldShow.apply(this,arguments);
    setTimeout(function(){try{install()}catch(e){}},0);
    return r;
  };
}

setTimeout(install,120);
})();