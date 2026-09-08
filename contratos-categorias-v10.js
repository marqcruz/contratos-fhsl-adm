(function(){
'use strict';
var filtroCategoria='';
var categorias=[];
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function podeEditarCategoria(){try{return currentUser&&['admin','gestor'].includes(String(currentUser.role||'').toLowerCase())}catch(e){return false}}

var oldNormalize=typeof normalize==='function'?normalize:null;
if(oldNormalize){
  normalize=function(c){
    var x=oldNormalize(c);
    x.categoriaObjeto=c.CategoriaObjeto||c.categoriaObjeto||'';
    x.categoriaObjetoId=String(c.CategoriaObjetoId||c.categoriaObjetoId||'');
    x.categoriaObjetoOrigem=c.CategoriaObjetoOrigem||c.categoriaObjetoOrigem||'auto';
    return x;
  };
}
var oldPayload=typeof toPayload==='function'?toPayload:null;
if(oldPayload){
  toPayload=function(c){
    var p=oldPayload(c);
    p.CategoriaObjeto=c.categoriaObjeto||'';
    p.CategoriaObjetoId=c.categoriaObjetoId||'';
    p.CategoriaObjetoOrigem=c.categoriaObjetoOrigem||'auto';
    return p;
  };
}

function installCss(){
  if(document.getElementById('cat-v10-css'))return;
  var s=document.createElement('style');s.id='cat-v10-css';s.textContent=`
#v10-categoria{min-width:250px;max-width:360px}.v10-cat-wrap{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:6px}.v10-cat{display:inline-flex;align-items:center;padding:3px 7px;border-radius:999px;border:1px solid var(--border);background:var(--surface2);color:var(--accent-text);font-size:9px;font-weight:750;line-height:1.2;cursor:pointer;max-width:100%;white-space:normal;text-align:left}.v10-cat.auto:before{content:'OBJETO · ';color:var(--text3);font-weight:650}.v10-cat.unclassified{color:var(--yellow-text);background:var(--yellow-bg)}.v10-cat-edit{border:0;background:transparent;color:var(--text3);font-size:10px;cursor:pointer;padding:2px 4px;border-radius:5px}.v10-cat-edit:hover{background:var(--surface2);color:var(--text)}.v10-cat-count{font-size:10px;color:var(--text3);white-space:nowrap}
#v10-cat-modal{position:fixed;inset:0;background:rgba(0,0,0,.68);z-index:15000;display:none;align-items:center;justify-content:center;padding:18px}#v10-cat-modal.open{display:flex}.v10-cat-box{width:min(560px,96vw);background:var(--surface,#161b22);border:1px solid var(--border,#2a3140);border-radius:14px;box-shadow:0 22px 60px rgba(0,0,0,.5);padding:18px}.v10-cat-box h3{margin:0 0 5px;font-size:16px}.v10-cat-box p{margin:0 0 14px;color:var(--text3);font-size:11px;line-height:1.45}.v10-cat-box select{width:100%;margin-bottom:14px}.v10-cat-actions{display:flex;justify-content:flex-end;gap:8px}.v10-cat-origin{margin-top:8px;font-size:10px;color:var(--text3)}
@media(max-width:900px){#v10-categoria{min-width:180px;max-width:100%;flex:1}}
`;document.head.appendChild(s);
}

async function loadCategorias(){
  try{
    if(typeof contratosApi!=='function')return;
    var r=await contratosApi('categories',{});
    if(r&&r.ok&&Array.isArray(r.data))categorias=r.data;
  }catch(e){console.warn('[Contratos categorias] falha ao carregar catálogo',e)}
  syncSelect();
}

function installSelect(){
  installCss();
  var bar=document.getElementById('gestao-v8');
  if(!bar||document.getElementById('v10-categoria'))return;
  var sel=document.createElement('select');sel.id='v10-categoria';sel.innerHTML='<option value="">Todas as categorias de objeto</option>';
  var unidade=document.getElementById('v8-unidade');
  if(unidade)unidade.insertAdjacentElement('afterend',sel);else bar.appendChild(sel);
  sel.onchange=function(){filtroCategoria=this.value;try{window.listaPage=1}catch(e){}renderLista();};
  syncSelect();
}
function categoriasAtuais(){
  var set=new Set();
  try{contracts.forEach(function(c){if(c.tipo==='Contrato'&&c.categoriaObjeto)set.add(c.categoriaObjeto)})}catch(e){}
  categorias.forEach(function(c){if(c&&c.Nome)set.add(c.Nome)});
  return Array.from(set).sort(function(a,b){if(a==='A CLASSIFICAR')return 1;if(b==='A CLASSIFICAR')return-1;return a.localeCompare(b,'pt-BR',{sensitivity:'base'})});
}
function syncSelect(){
  var sel=document.getElementById('v10-categoria');if(!sel)return;
  var arr=categoriasAtuais(),sig=arr.join('|');if(sel.dataset.sig===sig)return;
  var old=filtroCategoria;
  sel.innerHTML='<option value="">Todas as categorias de objeto</option>'+arr.map(function(x){return'<option value="'+esc(x)+'">'+esc(x)+'</option>'}).join('');
  sel.dataset.sig=sig;if(arr.indexOf(old)>=0)sel.value=old;else filtroCategoria='';
}

function ensureModal(){
  var m=document.getElementById('v10-cat-modal');if(m)return m;
  m=document.createElement('div');m.id='v10-cat-modal';m.innerHTML='<div class="v10-cat-box"><h3>Editar categoria do objeto</h3><p id="v10-cat-desc"></p><select id="v10-cat-select"></select><div class="v10-cat-origin" id="v10-cat-origin"></div><div class="v10-cat-actions"><button type="button" class="btn sm" id="v10-cat-cancel">Cancelar</button><button type="button" class="btn sm primary" id="v10-cat-save">Salvar categoria</button></div></div>';
  document.body.appendChild(m);
  m.onclick=function(e){if(e.target===m)m.classList.remove('open')};
  document.getElementById('v10-cat-cancel').onclick=function(){m.classList.remove('open')};
  return m;
}
function abrirEditor(c){
  if(!podeEditarCategoria()){showNotif('Apenas gestores e administradores podem alterar a categoria.','err');return}
  var m=ensureModal(),sel=document.getElementById('v10-cat-select');
  document.getElementById('v10-cat-desc').textContent=(c.numero||'Contrato')+' — '+(c.empresa||'');
  sel.innerHTML='<option value="__AUTO__">Classificação automática</option>'+categorias.map(function(x){return'<option value="'+esc(x.ID)+'">'+esc(x.Nome)+'</option>'}).join('');
  sel.value=c.categoriaObjetoOrigem==='manual'&&c.categoriaObjetoId?String(c.categoriaObjetoId):'__AUTO__';
  document.getElementById('v10-cat-origin').textContent=c.categoriaObjetoOrigem==='manual'?'Classificação atual: manual.':'Classificação atual: automática.';
  document.getElementById('v10-cat-save').onclick=async function(){
    var btn=this,val=sel.value,cat=categorias.find(function(x){return String(x.ID)===String(val)}),old={id:c.categoriaObjetoId,nome:c.categoriaObjeto,origem:c.categoriaObjetoOrigem};
    btn.disabled=true;btn.textContent='Salvando...';
    try{
      if(val==='__AUTO__'){c.categoriaObjetoId='';c.categoriaObjeto='';c.categoriaObjetoOrigem='auto';}
      else{c.categoriaObjetoId=cat?String(cat.ID):'';c.categoriaObjeto=cat?cat.Nome:'';c.categoriaObjetoOrigem='manual';}
      var r=await contratosApi('save',{payload:toPayload(c)});
      if(!r||!r.ok)throw new Error((r&&r.message)||'Não foi possível salvar a categoria.');
      m.classList.remove('open');showNotif('Categoria atualizada.','ok');
      try{if(typeof refreshAll==='function')await refreshAll();else renderLista()}catch(e){renderLista()}
    }catch(e){c.categoriaObjetoId=old.id;c.categoriaObjeto=old.nome;c.categoriaObjetoOrigem=old.origem;showNotif(e.message||'Falha ao salvar categoria.','err')}
    finally{btn.disabled=false;btn.textContent='Salvar categoria'}
  };
  m.classList.add('open');
}

function decorate(){
  installSelect();syncSelect();
  var rows=document.querySelectorAll('#lista-body tr.v8-parent');
  rows.forEach(function(tr){
    var link=tr.querySelector('[data-detail]');if(!link)return;
    var id=link.getAttribute('data-detail'),c=null;
    try{c=contracts.find(function(x){return String(x.id)===String(id)})}catch(e){}
    if(!c)return;
    var td=tr.children&&tr.children[2];if(!td||td.querySelector('.v10-cat-wrap'))return;
    var nome=c.categoriaObjeto||'A CLASSIFICAR';
    var wrap=document.createElement('div');wrap.className='v10-cat-wrap';
    var b=document.createElement('button');b.type='button';b.className='v10-cat auto'+(nome==='A CLASSIFICAR'?' unclassified':'');b.textContent=nome;b.title='Filtrar contratos desta categoria';
    b.onclick=function(ev){ev.stopPropagation();filtroCategoria=nome;var s=document.getElementById('v10-categoria');if(s)s.value=nome;try{window.listaPage=1}catch(e){}renderLista();};
    wrap.appendChild(b);
    if(podeEditarCategoria()){
      var edit=document.createElement('button');edit.type='button';edit.className='v10-cat-edit';edit.textContent='Editar categoria';edit.title='Alterar a categoria deste contrato';edit.onclick=function(ev){ev.stopPropagation();abrirEditor(c)};wrap.appendChild(edit);
    }
    td.appendChild(wrap);
  });
  var sum=document.getElementById('v8-summary');
  if(sum&&filtroCategoria){var n=rows.length;sum.textContent=n+' contrato'+(n===1?'':'s')+' nesta categoria';}
}

var oldRender=typeof renderLista==='function'?renderLista:null;
if(oldRender){
  renderLista=function(){
    installSelect();
    var originalContracts=null;
    try{
      if(filtroCategoria&&typeof contracts!=='undefined'&&Array.isArray(contracts)){
        originalContracts=contracts;
        var ids=new Set(originalContracts.filter(function(c){return c.tipo==='Contrato'&&String(c.categoriaObjeto||'')===String(filtroCategoria)}).map(function(c){return String(c.id)}));
        contracts=originalContracts.filter(function(c){return c.tipo==='Contrato'?ids.has(String(c.id)):ids.has(String(c.contratoPai))});
      }
      return oldRender.apply(this,arguments);
    }finally{
      if(originalContracts)contracts=originalContracts;
      setTimeout(function(){try{decorate()}catch(e){console.warn('[Contratos categorias]',e)}},0);
    }
  };
}

installCss();
setTimeout(function(){installSelect();loadCategorias();try{renderLista()}catch(e){}},0);
})();
