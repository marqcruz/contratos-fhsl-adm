(function(){
'use strict';

function escH(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmtN(v){return Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:1});}
function fmtR(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});}
function short(v,n=34){v=String(v||'');return v.length>n?v.slice(0,n-1)+'…':v;}

function addCss(){
 if(document.getElementById('pc-chart-style'))return;
 const s=document.createElement('style');s.id='pc-chart-style';s.textContent=`
 .pc-contract-alert{margin:0 0 14px;border:2px solid #b7811d;background:linear-gradient(135deg,#2b210d,#201a0d);border-radius:12px;padding:16px 18px;box-shadow:0 0 0 1px rgba(255,193,7,.08) inset}.pc-contract-alert-head{display:flex;gap:12px;align-items:flex-start}.pc-contract-alert-ico{font-size:28px;line-height:1}.pc-contract-alert h2{margin:0 0 5px;font-size:15px;color:#ffe08a}.pc-contract-alert p{margin:0;color:#ead9aa;font-size:11px;line-height:1.55}.pc-contract-items{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}.pc-contract-chip{border:1px solid #765a1c;background:#302612;color:#f3d98a;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:700}.pc-contract-note{margin-top:11px;padding:10px 12px;border-radius:8px;background:rgba(255,255,255,.035);color:#fff2c1;font-size:10px}.pc-contract-note b{color:#fff}
 .pc-analytics{margin-bottom:14px}.pc-analytics-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}.pc-analytics-head h2{font-size:14px;margin:0}.pc-analytics-controls{margin-left:auto;display:flex;gap:7px;flex-wrap:wrap}.pc-analytics-controls select{padding:7px 9px;border:1px solid var(--border);border-radius:7px;background:var(--surface2);color:var(--text);font:inherit}.pc-chart-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.pc-chart{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:11px;min-width:0}.pc-chart h3{font-size:11px;margin:0 0 2px}.pc-chart .pc-desc{font-size:9px;color:var(--muted);margin-bottom:9px}.pc-bars{display:grid;gap:6px}.pc-bar-row{display:grid;grid-template-columns:minmax(105px,1.25fr) minmax(90px,2fr) auto;gap:7px;align-items:center}.pc-bar-name{font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pc-bar-track{height:9px;background:var(--surface2);border-radius:999px;overflow:hidden}.pc-bar-fill{height:100%;border-radius:999px;background:var(--accent);min-width:2px}.pc-bar-value{font-size:9px;font-weight:800;text-align:right;white-space:nowrap}.pc-empty{padding:28px 8px;text-align:center;color:var(--muted);font-size:10px}.pc-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px}.pc-mini{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px}.pc-mini b{display:block;font-size:16px}.pc-mini span{font-size:9px;color:var(--muted)}
 @media(max-width:1100px){.pc-chart-grid{grid-template-columns:1fr}.pc-summary{grid-template-columns:1fr 1fr}}
 @media print{.pc-analytics-controls{display:none!important}.pc-chart-grid{grid-template-columns:1fr 1fr 1fr}.pc-chart{break-inside:avoid}.pc-bars{gap:3px}.pc-bar-row{grid-template-columns:100px 1fr auto}.pc-contract-alert{break-inside:avoid;border:1px solid #777;background:#fff;color:#111}.pc-contract-alert h2,.pc-contract-alert p,.pc-contract-note{color:#111}.pc-contract-chip{color:#111;background:#eee;border-color:#bbb}}
 `;document.head.appendChild(s);
}

function ensureContractAlert(){
 if(document.getElementById('pc-contract-alert'))return;
 const result=document.getElementById('result');if(!result)return;
 const kpis=result.querySelector('.kpis');if(!kpis)return;
 const box=document.createElement('section');box.id='pc-contract-alert';box.className='pc-contract-alert';
 box.innerHTML=`<div class="pc-contract-alert-head"><div class="pc-contract-alert-ico">⚠️</div><div><h2>Atenção aos itens vinculados a contratos</h2><p>Antes de efetivar qualquer solicitação de compra, o coordenador deverá verificar se o item já possui fornecimento previsto em contrato, comodato, locação de equipamento ou serviço terceirizado. A previsão calculada pelo sistema indica necessidade de estoque, mas não substitui a conferência da forma contratual de fornecimento.</p></div></div><div class="pc-contract-items"><span class="pc-contract-chip">Papel para ECG</span><span class="pc-contract-chip">Filtro HMEF</span><span class="pc-contract-chip">Pás para cardioversor</span><span class="pc-contract-chip">Equipo para bomba de infusão</span><span class="pc-contract-chip">Papel para cardiotoco</span><span class="pc-contract-chip">Lancetas</span><span class="pc-contract-chip">Tiras reagentes</span><span class="pc-contract-chip">Outros itens vinculados</span></div><div class="pc-contract-note"><b>Orientação:</b> ao identificar item com consumo elevado ou compra sugerida, confirme primeiro o contrato relacionado, saldo contratual, fornecedor responsável e eventual obrigação de reposição antes de encaminhar nova compra.</div>`;
 kpis.insertAdjacentElement('beforebegin',box);
}

function ensureUI(){
 if(document.getElementById('pc-analytics'))return;
 const result=document.getElementById('result');if(!result)return;
 const kpis=result.querySelector('.kpis');if(!kpis)return;
 const box=document.createElement('section');box.id='pc-analytics';box.className='panel pc-analytics';
 box.innerHTML=`<div class="pc-analytics-head"><div><h2>📊 Análise de Consumo</h2><div class="sub">Gráficos calculados localmente a partir da planilha carregada.</div></div><div class="pc-analytics-controls"><select id="pc-chart-cat"><option value="">Todas as categorias</option></select><select id="pc-chart-top"><option value="10">Top 10</option><option value="20" selected>Top 20</option><option value="50">Top 50</option></select></div></div><div class="pc-summary"><div class="pc-mini"><b id="pc-cons-total">0</b><span>Consumo total no período</span></div><div class="pc-mini"><b id="pc-cob-med">—</b><span>Cobertura mediana</span></div><div class="pc-mini"><b id="pc-baixo-ponto">0</b><span>Abaixo do ponto de reposição</span></div><div class="pc-mini"><b id="pc-custo-total">R$ 0</b><span>Reposição estimada</span></div></div><div class="pc-chart-grid"><div class="pc-chart"><h3>Maiores consumos</h3><div class="pc-desc">Itens com maior consumo no período selecionado.</div><div id="pc-chart-cons" class="pc-bars"></div></div><div class="pc-chart"><h3>Menor cobertura de estoque</h3><div class="pc-desc">Itens com consumo e menor número de dias de cobertura.</div><div id="pc-chart-cob" class="pc-bars"></div></div><div class="pc-chart"><h3>Maior custo estimado de reposição</h3><div class="pc-desc">Itens que mais impactam financeiramente a compra sugerida.</div><div id="pc-chart-custo" class="pc-bars"></div></div></div>`;
 kpis.insertAdjacentElement('afterend',box);
 document.getElementById('pc-chart-cat').addEventListener('change',renderCharts);
 document.getElementById('pc-chart-top').addEventListener('change',renderCharts);
}

function chartItems(){
 let a=Array.isArray(itens)?itens.slice():[];
 const cat=document.getElementById('pc-chart-cat')?.value||'';
 if(cat)a=a.filter(x=>x.cat===cat);
 return a;
}
function fillCats(){
 const s=document.getElementById('pc-chart-cat');if(!s)return;
 const cur=s.value;const cats=[...new Set((Array.isArray(itens)?itens:[]).map(x=>x.cat).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 s.innerHTML='<option value="">Todas as categorias</option>'+cats.map(c=>'<option value="'+escH(c)+'">'+escH(c)+'</option>').join('');if(cats.includes(cur))s.value=cur;
}
function bars(id,arr,key,formatter,reverse){
 const el=document.getElementById(id);if(!el)return;
 const top=Math.max(1,Number(document.getElementById('pc-chart-top')?.value||20));
 let a=arr.filter(x=>Number.isFinite(Number(x[key]))&&Number(x[key])>=0);
 a.sort((x,y)=>reverse?Number(x[key])-Number(y[key]):Number(y[key])-Number(x[key]));a=a.slice(0,top);
 if(!a.length){el.innerHTML='<div class="pc-empty">Sem dados para este gráfico.</div>';return;}
 const max=Math.max(...a.map(x=>Number(x[key])||0),0.000001);
 el.innerHTML=a.map(x=>{const v=Number(x[key])||0,p=Math.max(1,Math.min(100,v/max*100));return '<div class="pc-bar-row" title="'+escH(x.prod)+'"><div class="pc-bar-name">'+escH(short(x.prod))+'</div><div class="pc-bar-track"><div class="pc-bar-fill" style="width:'+p.toFixed(1)+'%"></div></div><div class="pc-bar-value">'+formatter(v)+'</div></div>';}).join('');
}
function median(a){if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;}
function renderCharts(){
 ensureContractAlert();ensureUI();fillCats();const a=chartItems();
 const cons=a.reduce((s,x)=>s+Number(x.cons||0),0),cobs=a.map(x=>Number(x.cob)).filter(Number.isFinite),med=median(cobs),baixo=a.filter(x=>Number(x.cmd)>0&&Number(x.saldo)<Number(x.ponto)).length,custo=a.reduce((s,x)=>s+Number(x.custo||0),0);
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};set('pc-cons-total',fmtN(cons));set('pc-cob-med',med==null?'—':fmtN(med)+' d');set('pc-baixo-ponto',fmtN(baixo));set('pc-custo-total',fmtR(custo));
 bars('pc-chart-cons',a,'cons',fmtN,false);
 bars('pc-chart-cob',a.filter(x=>Number(x.cmd)>0&&Number.isFinite(Number(x.cob))),'cob',v=>fmtN(v)+' d',true);
 bars('pc-chart-custo',a.filter(x=>Number(x.custo)>0),'custo',fmtR,false);
}

function install(){
 addCss();ensureContractAlert();ensureUI();
 try{const original=render;if(typeof original==='function'&&!original.__pcCharts){const wrapped=function(){const r=original.apply(this,arguments);setTimeout(renderCharts,0);return r};wrapped.__pcCharts=true;render=wrapped;}}catch(e){console.warn('Planejamento: não foi possível integrar renderCharts',e)}
 try{const oldBtn=document.querySelector('.top .btn');if(oldBtn&&/TDNGo/i.test(oldBtn.textContent))oldBtn.onclick=()=>{window.top.location.href='index.html'};}catch(e){}
 setTimeout(()=>{if(typeof itens!=='undefined'&&itens.length)renderCharts()},250);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();