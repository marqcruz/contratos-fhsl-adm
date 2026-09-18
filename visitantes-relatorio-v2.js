(()=>{
'use strict';
if(window.__TDNGO_VIS_REL_V2__)return;window.__TDNGO_VIS_REL_V2__=true;
let relPagina=1,relPorPagina=25,relAtual=[];

function el(id){return document.getElementById(id)}
function ensureUI(){
  const page=el('page-relatorio'); if(!page)return;
  const table=page.querySelector('.table-wrap');
  if(table){
    table.classList.add('rel-table-wrap-v2');
    const tbl=table.querySelector('table'); if(tbl)tbl.classList.add('rel-table-v2');
  }
  if(table&&!el('rel-pager-v2')){
    const p=document.createElement('div');p.id='rel-pager-v2';p.className='rel-pager-v2';
    p.innerHTML='<div id="rel-page-info">0 registros</div><div class="rel-page-actions">'+
      '<span>Exibir</span><select id="rel-page-size" onchange="window.relSetPageSize(this.value)"><option value="10">10</option><option value="25" selected>25</option><option value="50">50</option><option value="100">100</option></select>'+
      '<button class="btn sm" id="rel-first" onclick="window.relGoPage(1)">«</button>'+
      '<button class="btn sm" id="rel-prev" onclick="window.relGoPage(relPagina-1)">‹</button>'+
      '<span id="rel-page-label">Página 1 de 1</span>'+
      '<button class="btn sm" id="rel-next" onclick="window.relGoPage(relPagina+1)">›</button>'+
      '<button class="btn sm" id="rel-last" onclick="window.relGoLast()">»</button>'+
      '</div>';
    table.insertAdjacentElement('afterend',p);
  }
  if(!el('rel-v2-style')){
    const s=document.createElement('style');s.id='rel-v2-style';s.textContent=`
#page-relatorio .report-filters{border-radius:12px;padding:14px;background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow)}
#page-relatorio .report-grid{gap:10px}
#page-relatorio .quick-strip{gap:10px}
#page-relatorio .quick-card{padding:13px 15px;border-radius:11px}
#page-relatorio .chart-card{border-radius:11px}
.rel-table-wrap-v2{margin-top:14px;border-radius:11px;max-height:560px;overflow:auto!important}
.rel-table-v2{min-width:1180px}
.rel-table-v2 thead{position:sticky;top:0;z-index:2}
.rel-table-v2 th{background:var(--surface2);padding:9px 10px;font-size:10px}
.rel-table-v2 td{padding:9px 10px;font-size:12px;line-height:1.35}
.rel-table-v2 tbody tr:nth-child(even) td{background:color-mix(in srgb,var(--surface2) 45%,var(--surface))}
.rel-table-v2 tbody tr:hover td{background:var(--accent-bg)}
.rel-pager-v2{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 2px 0;color:var(--text2);font-size:12px}
.rel-page-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.rel-page-actions select{height:30px;border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--text);padding:3px 8px}
@media(max-width:900px){.rel-pager-v2{align-items:flex-start;flex-direction:column}}
`;document.head.appendChild(s);
  }
}

function renderPage(){
  ensureUI();
  const total=relAtual.length,pages=Math.max(1,Math.ceil(total/relPorPagina));
  relPagina=Math.min(Math.max(relPagina,1),pages);
  const ini=(relPagina-1)*relPorPagina,fim=Math.min(ini+relPorPagina,total);
  const arr=relAtual.slice(ini,fim);
  const tb=el('rel-body'); if(!tb)return;
  tb.innerHTML=arr.map(v=>`<tr>
<td>${fmtDT(v.Entrada)}</td><td>${fmtDT(v.SaidaEm||v.Saida)}</td><td>${String(v.Agendado||'').toUpperCase()==='SIM'?'SIM · '+fmtDT(v.Agendamento):'NÃO'}</td>
<td>${esc(v.Tipo)}</td><td><strong>${esc(v.Nome)}</strong></td><td>${esc(v.DocumentoTipo||'DOC')} ${esc(v.Documento)}</td>
<td>${esc(v.Empresa||'—')}</td><td>${esc(v.Setor)}</td><td>${esc(v.ResponsavelSetor||'—')}</td><td>${esc(v.Responsavel)}</td>
<td>${esc(v.Motivo||'—')}</td><td><strong>${fmtDur(minutosPermanencia(v))}</strong></td></tr>`).join('');
  const empty=el('rel-empty');if(empty)empty.style.display=total?'none':'block';
  if(el('rel-page-info'))el('rel-page-info').textContent=total?('Mostrando '+(ini+1)+'–'+fim+' de '+total+' registros'):'Nenhum registro';
  if(el('rel-page-label'))el('rel-page-label').textContent='Página '+relPagina+' de '+pages;
  if(el('rel-first'))el('rel-first').disabled=relPagina<=1;
  if(el('rel-prev'))el('rel-prev').disabled=relPagina<=1;
  if(el('rel-next'))el('rel-next').disabled=relPagina>=pages;
  if(el('rel-last'))el('rel-last').disabled=relPagina>=pages;
}
window.relGoPage=function(n){relPagina=Math.max(1,Number(n)||1);renderPage()};
window.relGoLast=function(){relPagina=Math.max(1,Math.ceil(relAtual.length/relPorPagina));renderPage()};
window.relSetPageSize=function(n){relPorPagina=Math.max(1,Number(n)||25);relPagina=1;renderPage()};

const originalRenderRelatorio=window.renderRelatorio;
window.renderRelatorio=function(arr){
  relAtual=Array.isArray(arr)?arr:[];
  relPagina=1;

  // KPIs e gráficos continuam usando o conjunto completo filtrado.
  const prest=relAtual.filter(v=>String(v.Tipo).toUpperCase().includes('PRESTADOR')).length,
        vis=relAtual.filter(v=>String(v.Tipo).toUpperCase()==='VISITANTE').length,
        ab=relAtual.filter(v=>v.Status==='NO PRÉDIO').length;
  const mins=relAtual.filter(v=>v.SaidaEm||v.Saida).map(minutosPermanencia),
        med=mins.length?Math.round(mins.reduce((a,b)=>a+b,0)/mins.length):0;
  el('rel-total').textContent=relAtual.length;
  el('rel-visitantes').textContent=vis;
  el('rel-prestadores').textContent=prest;
  el('rel-tempo').textContent=mins.length?fmtDur(med):'—';
  el('rel-abertos').textContent=ab;
  renderBars('bars-setor',contagem(relAtual,'Setor'));
  renderBars('bars-empresa',contagem(relAtual,'Empresa'));
  renderPage();
};
ensureUI();
})();