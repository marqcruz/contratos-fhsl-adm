(function(){
'use strict';

let confListaPage=1;
function byId(id){return document.getElementById(id);}
function val(id){const el=byId(id);return el?el.value:'';}
function norm(v){return String(v==null?'':v).trim().toLowerCase();}
function uniq(list){return Array.from(new Set(list.filter(Boolean))).sort(function(a,b){return String(a).localeCompare(String(b),'pt-BR',{sensitivity:'base'});});}
function setOptions(id,items,first,formatter){
  const el=byId(id);if(!el)return;
  const old=el.value;
  el.innerHTML='<option value="">'+first+'</option>'+items.map(function(x){return '<option value="'+esc(x)+'">'+esc(formatter?formatter(x):x)+'</option>';}).join('');
  if(items.indexOf(old)>=0)el.value=old;
}
function syncFilters(){
  setOptions('filtro-empresa',uniq(conferencias.map(function(c){return c.Empresa||'';})),'Todas as empresas');
  setOptions('filtro-unidade',uniq(conferencias.map(function(c){return c.Unidade||'';})),'Todas as unidades');
  const meses=uniq(conferencias.map(function(c){return c.MesRef||'';})).sort().reverse();
  setOptions('filtro-mes',meses,'Todas as competências',function(x){return fmtMes(x);});
}
function statusCanon(c){return c.Status==='Aprovada'?'Concluída':(c.Status||'Em conferência');}
function numeroOrd(c){const m=String(c.Numero||'').match(/^(\d+)/);return m?Number(m[1]):0;}
function progresso(c){
  const itens=c.ItensObj||{};let ok=0,tot=0,keys=[];
  GRUPOS.forEach(function(g,gi){g.itens.forEach(function(_,ii){keys.push(itemKey(gi,ii));});});
  if(String(c.TemSocios||'Não')==='Sim')GRUPO_SOCIOS.itens.forEach(function(_,ii){keys.push(itemKey('S',ii));});
  keys.forEach(function(k){tot++;if(itens[k]==='ok'||itens[k]==='na')ok++;});
  return {ok:ok,tot:tot,pct:tot?Math.round(ok/tot*100):0};
}
function badge(st){
  return st==='Concluída'
    ? '<span class="badge c-blue-b">✔️ Concluída</span>'
    : '<span class="badge c-yellow-b">⏳ Em conferência</span>';
}
function prepararLista(){
  const page=byId('page-lista');if(!page)return;

  const stats=page.querySelector('.stats-grid');if(stats)stats.remove();

  const toolbar=page.querySelector('.toolbar');
  if(toolbar){
    toolbar.classList.add('conf-toolbar');
    toolbar.innerHTML=
      '<input type="text" id="busca-lista" placeholder="🔍 Buscar nº, empresa, unidade, competência ou NF..." oninput="confResetPage()">'+
      '<select id="filtro-status" onchange="confResetPage()"><option value="">Todos os status</option><option value="Em conferência">Em conferência</option><option value="Concluída">Concluída</option></select>'+
      '<select id="filtro-empresa" onchange="confResetPage()"><option value="">Todas as empresas</option></select>'+
      '<select id="filtro-unidade" onchange="confResetPage()"><option value="">Todas as unidades</option></select>'+
      '<select id="filtro-mes" onchange="confResetPage()"><option value="">Todas as competências</option></select>'+
      '<select id="filtro-pdf" onchange="confResetPage()"><option value="">Todos os PDFs</option><option value="com">Com PDF</option><option value="sem">Sem PDF</option></select>'+
      '<select id="filtro-ordem" onchange="confResetPage()"><option value="numero_desc">Mais recentes</option><option value="numero_asc">Mais antigas</option><option value="competencia_desc">Competência mais recente</option><option value="empresa">Empresa A–Z</option></select>'+
      '<select id="filtro-pagina-tam" onchange="confResetPage()"><option value="10">10 por página</option><option value="25">25 por página</option><option value="50">50 por página</option></select>'+
      '<button class="btn" onclick="limparFiltrosConferencia()">Limpar filtros</button>'+
      '<button class="btn primary" onclick="showPage(\'nova\')">➕ Nova conferência</button>';

    if(!byId('pdf-retention-tag')){
      const tag=document.createElement('div');
      tag.id='pdf-retention-tag';
      tag.className='pdf-retention-tag';
      tag.textContent='📄 PDFs arquivados serão excluídos pelo administrador após 2 dias.';
      toolbar.insertAdjacentElement('afterend',tag);
    }
  }

  const wrap=page.querySelector('.table-wrap');
  if(wrap&&!byId('lista-pager')){
    const pager=document.createElement('div');
    pager.id='lista-pager';
    pager.className='conf-pager';
    wrap.insertAdjacentElement('afterend',pager);
  }

  const top=document.querySelector('.topbar');if(top)top.style.display='none';
}

window.confResetPage=function(){confListaPage=1;renderLista();};
window.confIrPagina=function(n){confListaPage=Math.max(1,Number(n)||1);renderLista();};
window.limparFiltrosConferencia=function(){
  ['busca-lista','filtro-status','filtro-empresa','filtro-unidade','filtro-mes','filtro-pdf'].forEach(function(id){const el=byId(id);if(el)el.value='';});
  const ordem=byId('filtro-ordem');if(ordem)ordem.value='numero_desc';
  confListaPage=1;renderLista();
};
window.semPdfConferencia=function(){showNotif('Esta conferência ainda não possui PDF final arquivado.','info');};
window.excluirPdfConferencia=async function(id){
  if(!currentUser||currentUser.role!=='admin'){showNotif('Somente administradores podem excluir o PDF arquivado.','err');return;}
  const c=conferencias.find(function(x){return String(x.ID)===String(id);});
  if(!c||!c.TemPdfFinal){semPdfConferencia();return;}
  if(!confirm('Excluir somente o PDF arquivado desta conferência? O registro da conferência será mantido.'))return;
  const r=await operacionalApi('delete_conferencia_pdf',{id:id});
  if(r&&r.ok){showNotif('PDF arquivado excluído. A conferência foi mantida.','ok');await carregar();}
  else showNotif((r&&r.message)||'Não foi possível excluir o PDF.','err');
};

window.renderLista=function(){
  prepararLista();
  syncFilters();

  const q=norm(val('busca-lista')),fs=val('filtro-status'),fe=val('filtro-empresa'),fu=val('filtro-unidade'),
    fm=val('filtro-mes'),fp=val('filtro-pdf'),ord=val('filtro-ordem')||'numero_desc',
    per=Math.max(1,parseInt(val('filtro-pagina-tam')||'10',10)||10);

  let lista=conferencias.filter(function(c){
    const st=statusCanon(c);
    if(q&&!norm([c.Numero,c.Empresa,c.Unidade,fmtMes(c.MesRef),c.NotaFiscal].join(' ')).includes(q))return false;
    if(fs&&st!==fs)return false;
    if(fe&&String(c.Empresa)!==fe)return false;
    if(fu&&String(c.Unidade)!==fu)return false;
    if(fm&&String(c.MesRef)!==fm)return false;
    if(fp==='com'&&!c.TemPdfFinal)return false;
    if(fp==='sem'&&c.TemPdfFinal)return false;
    return true;
  });

  lista.sort(function(a,b){
    if(ord==='numero_asc')return numeroOrd(a)-numeroOrd(b);
    if(ord==='empresa')return String(a.Empresa||'').localeCompare(String(b.Empresa||''),'pt-BR',{sensitivity:'base'});
    if(ord==='competencia_desc')return String(b.MesRef||'').localeCompare(String(a.MesRef||''));
    return numeroOrd(b)-numeroOrd(a);
  });

  const total=lista.length,pages=Math.max(1,Math.ceil(total/per));
  confListaPage=Math.min(Math.max(confListaPage,1),pages);
  const ini=(confListaPage-1)*per,fim=Math.min(ini+per,total),pg=lista.slice(ini,fim);

  const empty=byId('lista-empty');if(empty)empty.style.display=total?'none':'block';

  byId('lista-body').innerHTML=pg.map(function(c){
    const p=progresso(c),st=statusCanon(c),temPdf=!!c.TemPdfFinal;
    let acoes=podeEditar()
      ? '<button class="btn sm" onclick="editarConf(\''+c.ID+'\')" title="Editar/ver">✏️</button>'
      : '<button class="btn sm" onclick="editarConf(\''+c.ID+'\')" title="Visualizar">👁️</button>';

    acoes+=' <button class="btn sm '+(temPdf?'':'pdf-empty')+'" onclick="'+(temPdf?"abrirPdfSalvo('"+c.ID+"')":"semPdfConferencia()")+'" title="'+(temPdf?'Visualizar PDF final arquivado':'Sem PDF arquivado')+'">📎</button>';

    if(currentUser&&currentUser.role==='admin'){
      acoes+=' <button class="btn sm '+(temPdf?'danger-soft':'pdf-empty')+'" onclick="excluirPdfConferencia(\''+c.ID+'\')" title="'+(temPdf?'Excluir somente o PDF arquivado':'Sem PDF para excluir')+'">🧹</button>';
      acoes+=' <button class="btn sm danger" onclick="delConf(\''+c.ID+'\')" title="Excluir conferência">🗑️</button>';
    }

    return '<tr><td><strong>'+esc(c.Numero)+'</strong></td><td>'+esc(c.Empresa)+'</td><td>'+esc(c.Unidade)+'</td>'+
      '<td>'+fmtMes(c.MesRef)+'</td><td>'+p.ok+' concluídos · '+p.pct+'%</td><td>'+badge(st)+'</td>'+
      '<td class="conf-actions">'+acoes+'</td></tr>';
  }).join('');

  const pager=byId('lista-pager');
  if(pager){
    let opts='';for(let i=1;i<=pages;i++)opts+='<option value="'+i+'"'+(i===confListaPage?' selected':'')+'>'+i+'</option>';
    pager.innerHTML='<span>'+(!total?'Nenhum resultado':'Mostrando '+(ini+1)+'–'+fim+' de '+total)+'</span>'+
      '<span class="pager-actions"><button class="btn sm" onclick="confIrPagina('+(confListaPage-1)+')" '+(confListaPage<=1?'disabled':'')+'>‹</button>'+
      '<select onchange="confIrPagina(this.value)">'+opts+'</select><span>de '+pages+'</span>'+
      '<button class="btn sm" onclick="confIrPagina('+(confListaPage+1)+')" '+(confListaPage>=pages?'disabled':'')+'>›</button></span>';
  }
};

const originalShowPage=showPage;
window.showPage=function(id,btn){
  const ok=originalShowPage(id,btn);
  const top=document.querySelector('.topbar');
  if(top)top.style.display=id==='lista'?'none':'flex';
  return ok;
};

window.doLogout=function(){
  if(conferenciaEmEdicao&&!permitindoSaida){
    const v=validarConferenciaCompleta(false);
    if(!v.ok||!pdfFinalGerado||!pdfFinalBaixado){showNotif('Conclua toda a conferência, compile e baixe o PDF final antes de sair.','err');return;}
    if(!confirm('Ao sair, todos os PDFs anexados nesta sessão serão perdidos. Confirma?'))return;
  }
  permitindoSaida=true;conferenciaEmEdicao=false;anexos={};
  sessionStorage.removeItem('fhsl_session');localStorage.removeItem('fhsl_session');currentUser=null;
  location.replace('index.html');
};

prepararLista();
})();