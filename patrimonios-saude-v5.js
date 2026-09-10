(()=>{
'use strict';

const API='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-patrimonios-saude-api';
let HS={items:[],manutencoes:[],loaded:false};

const ICON={
wrench:'<svg viewBox="0 0 24 24"><path d="M14.5 6.5a4.5 4.5 0 0 0-5.8 5.8L4 17l3 3 4.7-4.7a4.5 4.5 0 0 0 5.8-5.8l-3 3-3-3z"/></svg>',
chart:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
heart:'<svg viewBox="0 0 24 24"><path d="M20.8 5.8a5 5 0 0 0-7.1 0L12 7.5l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.1a5 5 0 0 0 0-7.1z"/></svg>',
shield:'<svg viewBox="0 0 24 24"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 7.9 7.5 9.5 4.3-1.6 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/></svg>',
clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></svg>',
file:'<svg viewBox="0 0 24 24"><path d="M6 3.5h8l4 4V20H6z"/><path d="M14 3.5v4h4M9 12h6M9 16h6"/></svg>'
};

function token(){
 try{
  if(window.currentUser&&currentUser.tdngoToken)return currentUser.tdngoToken;
  const raw=sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session');
  if(raw){const x=JSON.parse(raw);return x.tdngoToken||x.token||''}
 }catch(e){}
 return '';
}
async function api(action,p={}){
 const t=token(); if(!t) throw new Error('Sessão do TDNGo não encontrada. Entre novamente.');
 const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},body:JSON.stringify({...p,action})});
 const d=await r.json().catch(()=>({ok:false,message:'Resposta inválida do servidor.'}));
 if(!r.ok||d.ok===false) throw new Error(d.message||('Erro HTTP '+r.status));
 return d;
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function brl(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function dbr(v){if(!v)return'—';const s=String(v).slice(0,10),p=s.split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:s}
function days(v){if(!v)return null;return Math.ceil((new Date(v+'T23:59:59')-new Date())/86400000)}
function item(id){return HS.items.find(x=>x.id===id)}
function unitName(id){try{return (window.units||[]).find(x=>x.id===id)?.nome||''}catch(e){return''}}
function statusPill(s){
 const x=String(s||'').toUpperCase(), c=['OPERACIONAL','CONCLUIDA'].includes(x)?'ok':['INDISPONIVEL','ATRASADA'].includes(x)?'bad':'warn';
 return `<span class="pill ${c}">${esc(x.replaceAll('_',' '))}</span>`;
}

function css(){
 if(document.getElementById('pat-health-v5'))return;
 const s=document.createElement('style');s.id='pat-health-v5';s.textContent=`
 .pm-health-mark{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:800;color:#86b7ff;background:rgba(59,130,246,.10);border:1px solid rgba(96,165,250,.2);border-radius:999px;padding:4px 8px}
 .pm-health-mark svg,.pm-health-icon svg,.pm-health-nav svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
 .pm-health-nav{display:flex!important;align-items:center!important;gap:10px!important}.pm-health-nav svg{width:20px;height:20px}
 .pm-health-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px;margin:0 0 18px}
 .pm-hk{background:var(--pm-surface);border:1px solid var(--pm-border);border-radius:15px;padding:14px;min-height:105px;position:relative;overflow:hidden}
 .pm-hk:after{content:'';position:absolute;width:72px;height:72px;border-radius:999px;right:-20px;bottom:-25px;background:rgba(59,130,246,.09)}
 .pm-hk b{display:block;font-size:24px;letter-spacing:-.7px}.pm-hk span{font-size:10px;color:var(--pm-muted);display:block;margin-top:7px}.pm-hk.alert b{color:#f8c15e}.pm-hk.bad b{color:#ff7a7a}.pm-hk.good b{color:#69db8f}
 .pm-health-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:14px}.pm-health-card{background:var(--pm-surface);border:1px solid var(--pm-border);border-radius:15px;padding:15px}
 .pm-health-card h3{font-size:13px;margin:0 0 12px}.pm-bar-row{display:grid;grid-template-columns:130px 1fr 48px;gap:8px;align-items:center;margin:8px 0;font-size:11px}.pm-bar-track{height:7px;border-radius:999px;background:var(--pm-surface2);overflow:hidden}.pm-bar-track i{display:block;height:100%;background:var(--pm-accent);border-radius:999px}
 .pm-health-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}.pm-health-toolbar input,.pm-health-toolbar select{min-height:38px}.pm-health-toolbar input{flex:1;min-width:220px}
 .pm-health-table{overflow:auto;border:1px solid var(--pm-border);border-radius:14px;background:var(--pm-surface)}.pm-health-table table{width:100%;border-collapse:collapse;min-width:900px}.pm-health-table th{font-size:9px;text-transform:uppercase;color:var(--pm-muted);background:var(--pm-surface2);padding:10px}.pm-health-table td{padding:10px;border-top:1px solid var(--pm-border);font-size:11px}
 .pm-due{font-weight:800}.pm-due.over{color:#ff7a7a}.pm-due.soon{color:#f8c15e}.pm-due.ok{color:#69db8f}
 .pm-health-actions{display:flex;gap:5px;justify-content:flex-end}.pm-health-mini{width:32px;height:32px;border:1px solid var(--pm-border);border-radius:9px;background:var(--pm-surface2);color:var(--pm-text);display:grid;place-items:center;cursor:pointer}.pm-health-mini svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.8}
 .pm-health-section-title{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px}.pm-health-section-title h1{margin:0;font-size:25px}.pm-health-section-title p{margin:5px 0 0;color:var(--pm-muted);font-size:12px}
 .pm-health-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}.pm-health-form .full{grid-column:1/-1}.pm-health-form label{font-size:9px;font-weight:750;color:var(--pm-muted);display:block;margin:0 0 4px;text-transform:uppercase}.pm-health-form input,.pm-health-form select,.pm-health-form textarea{width:100%}
 .pm-health-callout{padding:11px 12px;border:1px solid rgba(96,165,250,.22);background:rgba(59,130,246,.07);border-radius:12px;font-size:11px;color:var(--pm-muted);line-height:1.5}
 .pm-report-print{display:none}
 @media(max-width:900px){.pm-health-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.pm-health-grid{grid-template-columns:1fr}.pm-health-form{grid-template-columns:1fr 1fr}}
 @media(max-width:760px){.pm-health-section-title{margin-bottom:14px}.pm-health-section-title h1{font-size:21px}.pm-health-section-title p{font-size:11px}.pm-health-kpis{gap:8px}.pm-hk{min-height:90px;padding:12px}.pm-hk b{font-size:20px}.pm-health-form{grid-template-columns:1fr}.pm-health-form .full{grid-column:auto}.pm-health-toolbar{display:grid;grid-template-columns:1fr 1fr}.pm-health-toolbar input{grid-column:1/-1;min-width:0}.pm-health-table{border:0;background:transparent}.pm-health-table table{min-width:0;display:block}.pm-health-table thead{display:none}.pm-health-table tbody{display:grid;gap:8px}.pm-health-table tr{display:block;background:var(--pm-surface);border:1px solid var(--pm-border);border-radius:14px;padding:12px}.pm-health-table td{display:block;border:0;padding:3px 0}.pm-health-table td:last-child{margin-top:8px}.pm-health-actions{justify-content:flex-start}}
 @media print{.side,.pm-appbar,.pm-bottom,.top,.no-print{display:none!important}.main{margin:0!important;width:100%!important;padding:0!important}.page{display:none!important}#p-relatorios{display:block!important}.pm-health-section-title button{display:none!important}.pm-health-card,.pm-hk{box-shadow:none!important;border-color:#ddd!important;color:#111!important}.pm-report-print{display:block}.pm-health-table{border-color:#ddd!important}.pm-health-table th,.pm-health-table td{color:#111!important;border-color:#ddd!important}}
 `;
 document.head.appendChild(s);
}

function addPages(){
 const main=document.querySelector('.main'); if(!main||document.getElementById('p-manutencao'))return;
 const maint=document.createElement('section');maint.className='page';maint.id='p-manutencao';maint.innerHTML=`
 <div class="pm-health-section-title"><div><div class="pm-health-mark">${ICON.heart} Saúde</div><h1 style="margin-top:8px">Manutenção e Engenharia Clínica</h1><p>Controle técnico de equipamentos, calibração, preventiva, corretiva e indisponibilidade assistencial.</p></div><button class="btn primary no-print" onclick="pmOpenMaintenance()">+ Nova manutenção</button></div>
 <div id="pm-maint-kpis" class="pm-health-kpis"></div>
 <div class="pm-health-toolbar no-print"><input id="pm-mq" placeholder="Buscar patrimônio, equipamento, OS ou fornecedor..." oninput="pmRenderMaintenance()"><select id="pm-ms" onchange="pmRenderMaintenance()"><option value="">Todos os status</option><option>ABERTA</option><option>EM_ANDAMENTO</option><option>AGUARDANDO_PECA</option><option>CONCLUIDA</option><option>CANCELADA</option></select><select id="pm-mt" onchange="pmRenderMaintenance()"><option value="">Todos os tipos</option><option>CORRETIVA</option><option>PREVENTIVA</option><option>CALIBRACAO</option><option>INSPECAO</option><option>QUALIFICACAO</option></select></div>
 <div id="pm-maint-table" class="pm-health-table"></div>`;
 main.appendChild(maint);
 const rep=document.createElement('section');rep.className='page';rep.id='p-relatorios';rep.innerHTML=`
 <div class="pm-health-section-title"><div><div class="pm-health-mark">${ICON.shield} Gestão</div><h1 style="margin-top:8px">Relatórios patrimoniais em saúde</h1><p>Indicadores gerenciais, criticidade, conformidade técnica, custos e riscos por unidade.</p></div><div class="actions no-print"><button class="btn" onclick="pmExportHealthCSV()">Exportar CSV</button><button class="btn primary" onclick="window.print()">Imprimir / PDF</button></div></div>
 <div class="pm-report-print"><b>TDNGo — Gestão Patrimonial em Saúde</b><div>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</div></div>
 <div id="pm-report-kpis" class="pm-health-kpis"></div>
 <div class="pm-health-grid"><div class="pm-health-card"><h3>Distribuição por criticidade assistencial</h3><div id="pm-report-critical"></div></div><div class="pm-health-card"><h3>Classificação dos ativos em saúde</h3><div id="pm-report-class"></div></div></div>
 <div class="section"><div class="pm-health-card"><h3>Conformidade técnica e vencimentos</h3><div id="pm-report-due" class="pm-health-table"></div></div></div>
 <div class="section"><div class="pm-health-card"><h3>Custos de manutenção por unidade</h3><div id="pm-report-cost"></div></div></div>`;
 main.appendChild(rep);
}

function addNav(){
 const nav=document.querySelector('.nav'); if(!nav||nav.querySelector('[data-page="manutencao"]'))return;
 const inv=nav.querySelector('[data-page="inventario"]'), b1=document.createElement('button'),b2=document.createElement('button');
 b1.dataset.page='manutencao';b1.className='pm-health-nav';b1.innerHTML=`<span class="pm-ico">${ICON.wrench}</span><span class="pm-label">Manutenção clínica</span>`;b1.onclick=()=>pmShow('manutencao',b1);
 b2.dataset.page='relatorios';b2.className='pm-health-nav';b2.innerHTML=`<span class="pm-ico">${ICON.chart}</span><span class="pm-label">Relatórios</span>`;b2.onclick=()=>pmShow('relatorios',b2);
 inv?.insertAdjacentElement('afterend',b1);b1.insertAdjacentElement('afterend',b2);
 const brand=document.querySelector('.brand'); if(brand){const b=brand.querySelector('b'),sp=brand.querySelector('span');if(b)b.textContent='Patrimônio Saúde';if(sp)sp.textContent='TDNGo · Gestão Patrimonial em Saúde'}
 const dash=document.querySelector('#p-dashboard .top h1');if(dash)dash.textContent='Gestão Patrimonial em Saúde';
 const sub=document.querySelector('#p-dashboard .top p');if(sub)sub.textContent='Ativos, equipamentos assistenciais, inventário, conformidade técnica e custo patrimonial.';
}

window.pmShow=async function(id,btn){
 document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById('p-'+id)?.classList.add('active');
 document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b===btn));
 if(id==='manutencao'){await pmRefreshHealth();pmRenderMaintenance()}
 if(id==='relatorios'){await pmRefreshHealth();pmRenderReports()}
 window.scrollTo({top:0,behavior:'smooth'});
};

function modals(){
 if(document.getElementById('pm-health-modal'))return;
 document.body.insertAdjacentHTML('beforeend',`
 <div class="modal-bg" id="pm-health-modal"><div class="modal" style="width:min(820px,97vw)"><div class="modal-h"><b>Ficha técnica do equipamento</b><span style="flex:1"></span><button class="btn sm" onclick="closeModal('pm-health-modal')">Fechar</button></div><div class="modal-b">
 <input type="hidden" id="pm-h-id"><div class="pm-health-callout" id="pm-h-title"></div><div class="pm-health-form" style="margin-top:13px">
 <div><label>Classificação em saúde</label><select id="pm-h-class"><option value="">Não classificado</option><option>EQUIPAMENTO_MEDICO_ASSISTENCIAL</option><option>INFRAESTRUTURA_HOSPITALAR</option><option>TI_ASSISTENCIAL</option><option>MOBILIARIO_HOSPITALAR</option><option>APOIO_DIAGNOSTICO</option><option>LABORATORIO</option><option>TRANSPORTE_ASSISTENCIAL</option><option>OUTROS</option></select></div>
 <div><label>Criticidade assistencial</label><select id="pm-h-crit"><option value="">Não definida</option><option value="A">A — Crítico</option><option value="B">B — Importante</option><option value="C">C — Baixo risco</option></select></div>
 <div><label>Status técnico</label><select id="pm-h-status"><option>OPERACIONAL</option><option>EM_MANUTENCAO</option><option>INDISPONIVEL</option><option>RESTRICAO_DE_USO</option><option>AGUARDANDO_LAUDO</option></select></div>
 <div><label>Registro ANVISA</label><input id="pm-h-anvisa" placeholder="Quando aplicável"></div><div><label>Centro de custo</label><input id="pm-h-cc"></div><div></div>
 <div><label><input type="checkbox" id="pm-h-cal" style="width:auto;min-height:auto"> Exige calibração</label><input type="number" min="1" id="pm-h-cal-m" placeholder="Periodicidade em meses"></div><div><label>Última calibração</label><input type="date" id="pm-h-cal-u"></div><div><label>Próxima calibração</label><input type="date" id="pm-h-cal-p"></div>
 <div><label><input type="checkbox" id="pm-h-prev" style="width:auto;min-height:auto"> Exige preventiva</label><input type="number" min="1" id="pm-h-prev-m" placeholder="Periodicidade em meses"></div><div><label>Última preventiva</label><input type="date" id="pm-h-prev-u"></div><div><label>Próxima preventiva</label><input type="date" id="pm-h-prev-p"></div>
 </div></div><div class="modal-f"><button class="btn" onclick="closeModal('pm-health-modal')">Cancelar</button><button class="btn primary" onclick="pmSaveHealth()">Salvar ficha técnica</button></div></div></div>
 <div class="modal-bg" id="pm-maint-modal"><div class="modal" style="width:min(760px,97vw)"><div class="modal-h"><b>Registro de manutenção</b><span style="flex:1"></span><button class="btn sm" onclick="closeModal('pm-maint-modal')">Fechar</button></div><div class="modal-b">
 <input type="hidden" id="pm-m-id"><div class="pm-health-form">
 <div class="full"><label>Equipamento / patrimônio</label><select id="pm-m-pat"></select></div><div><label>Tipo</label><select id="pm-m-type"><option>CORRETIVA</option><option>PREVENTIVA</option><option>CALIBRACAO</option><option>INSPECAO</option><option>QUALIFICACAO</option></select></div><div><label>Status</label><select id="pm-m-status"><option>ABERTA</option><option>EM_ANDAMENTO</option><option>AGUARDANDO_PECA</option><option>CONCLUIDA</option><option>CANCELADA</option></select></div><div><label>Prioridade</label><select id="pm-m-prio"><option>BAIXA</option><option selected>NORMAL</option><option>ALTA</option><option>CRITICA</option></select></div>
 <div class="full"><label>Descrição / problema identificado</label><textarea id="pm-m-desc" rows="3"></textarea></div><div><label>Fornecedor / engenharia clínica</label><input id="pm-m-forn"></div><div><label>Ordem de serviço</label><input id="pm-m-os"></div><div><label>Custo</label><input type="number" step="0.01" id="pm-m-cost"></div><div><label>Data prevista</label><input type="date" id="pm-m-date"></div><div class="full"><label>Observações</label><textarea id="pm-m-obs" rows="2"></textarea></div>
 </div></div><div class="modal-f"><button class="btn" onclick="closeModal('pm-maint-modal')">Cancelar</button><button class="btn primary" onclick="pmSaveMaintenance()">Salvar manutenção</button></div></div></div>`);
}

window.pmRefreshHealth=async function(){
 try{const r=await api('bootstrap');HS.items=r.items||[];HS.manutencoes=r.manutencoes||[];HS.loaded=true;pmRenderHealthDashboard();return HS}catch(e){if(window.toast)toast(e.message,'err');throw e}
};

window.pmOpenHealth=function(id){
 const x=item(id);if(!x)return;
 document.getElementById('pm-h-id').value=id;document.getElementById('pm-h-title').innerHTML=`<b>${esc(x.codigo_patrimonio)} — ${esc(x.descricao)}</b><br>${esc(unitName(x.unidade_id))}`;
 const set=(id,v)=>document.getElementById(id).value=v||'';
 set('pm-h-class',x.classificacao_saude);set('pm-h-crit',x.criticidade_assistencial);set('pm-h-status',x.status_tecnico||'OPERACIONAL');set('pm-h-anvisa',x.numero_anvisa);set('pm-h-cc',x.centro_custo);
 document.getElementById('pm-h-cal').checked=!!x.exige_calibracao;set('pm-h-cal-m',x.periodicidade_calibracao_meses);set('pm-h-cal-u',x.ultima_calibracao);set('pm-h-cal-p',x.proxima_calibracao);
 document.getElementById('pm-h-prev').checked=!!x.exige_preventiva;set('pm-h-prev-m',x.periodicidade_preventiva_meses);set('pm-h-prev-u',x.ultima_preventiva);set('pm-h-prev-p',x.proxima_preventiva);openModal('pm-health-modal');
};
window.pmSaveHealth=async function(){
 const g=id=>document.getElementById(id),id=g('pm-h-id').value;
 try{await api('save_health',{id,classificacao_saude:g('pm-h-class').value,criticidade_assistencial:g('pm-h-crit').value,status_tecnico:g('pm-h-status').value,numero_anvisa:g('pm-h-anvisa').value,centro_custo:g('pm-h-cc').value,exige_calibracao:g('pm-h-cal').checked,periodicidade_calibracao_meses:g('pm-h-cal-m').value,ultima_calibracao:g('pm-h-cal-u').value,proxima_calibracao:g('pm-h-cal-p').value,exige_preventiva:g('pm-h-prev').checked,periodicidade_preventiva_meses:g('pm-h-prev-m').value,ultima_preventiva:g('pm-h-prev-u').value,proxima_preventiva:g('pm-h-prev-p').value});closeModal('pm-health-modal');if(window.toast)toast('Ficha técnica atualizada.');await pmRefreshHealth();pmRenderReports();pmRenderMaintenance()}catch(e){toast(e.message,'err')}
};
window.pmOpenMaintenance=function(id='',mid=''){
 const m=HS.manutencoes.find(x=>x.id===mid),sel=document.getElementById('pm-m-pat');sel.innerHTML=HS.items.filter(x=>x.situacao!=='BAIXADO').map(x=>`<option value="${x.id}">${esc(x.codigo_patrimonio)} — ${esc(x.descricao)} · ${esc(unitName(x.unidade_id))}</option>`).join('');
 const set=(n,v)=>document.getElementById(n).value=v??'';
 set('pm-m-id',m?.id||'');set('pm-m-pat',m?.patrimonio_id||id||HS.items[0]?.id||'');set('pm-m-type',m?.tipo||'CORRETIVA');set('pm-m-status',m?.status||'ABERTA');set('pm-m-prio',m?.prioridade||'NORMAL');set('pm-m-desc',m?.descricao||'');set('pm-m-forn',m?.fornecedor||'');set('pm-m-os',m?.ordem_servico||'');set('pm-m-cost',m?.custo||'');set('pm-m-date',m?.data_prevista||'');set('pm-m-obs',m?.observacoes||'');openModal('pm-maint-modal');
};
window.pmSaveMaintenance=async function(){
 const g=id=>document.getElementById(id);
 try{await api('maintenance_save',{id:g('pm-m-id').value,patrimonio_id:g('pm-m-pat').value,tipo:g('pm-m-type').value,status:g('pm-m-status').value,prioridade:g('pm-m-prio').value,descricao:g('pm-m-desc').value,fornecedor:g('pm-m-forn').value,ordem_servico:g('pm-m-os').value,custo:g('pm-m-cost').value,data_prevista:g('pm-m-date').value,observacoes:g('pm-m-obs').value});closeModal('pm-maint-modal');toast('Manutenção registrada.');await pmRefreshHealth();pmRenderMaintenance();if(typeof reload==='function')reload()}catch(e){toast(e.message,'err')}
};

window.pmRenderMaintenance=function(){
 const q=(document.getElementById('pm-mq')?.value||'').toLowerCase(),st=document.getElementById('pm-ms')?.value||'',tp=document.getElementById('pm-mt')?.value||'';
 const ms=HS.manutencoes.filter(m=>{const p=item(m.patrimonio_id)||{};return(!st||m.status===st)&&(!tp||m.tipo===tp)&&(!q||JSON.stringify({...m,p}).toLowerCase().includes(q))});
 const abertas=HS.manutencoes.filter(x=>!['CONCLUIDA','CANCELADA'].includes(x.status)),crit=abertas.filter(x=>x.prioridade==='CRITICA').length,custo=HS.manutencoes.reduce((s,x)=>s+Number(x.custo||0),0),ind=HS.items.filter(x=>x.status_tecnico==='INDISPONIVEL').length;
 document.getElementById('pm-maint-kpis').innerHTML=`<div class="pm-hk"><b>${abertas.length}</b><span>Manutenções abertas</span></div><div class="pm-hk bad"><b>${crit}</b><span>Prioridade crítica</span></div><div class="pm-hk bad"><b>${ind}</b><span>Equipamentos indisponíveis</span></div><div class="pm-hk"><b style="font-size:18px">${brl(custo)}</b><span>Custo registrado</span></div>`;
 document.getElementById('pm-maint-table').innerHTML=`<table><thead><tr><th>Patrimônio</th><th>Tipo</th><th>Status</th><th>Prioridade</th><th>OS / fornecedor</th><th>Previsão</th><th>Custo</th><th></th></tr></thead><tbody>${ms.map(m=>{const p=item(m.patrimonio_id)||{};return`<tr><td><b>${esc(p.codigo_patrimonio||'')}</b><div class="muted">${esc(p.descricao||'')} · ${esc(unitName(p.unidade_id))}</div></td><td>${esc(m.tipo)}</td><td>${statusPill(m.status)}</td><td>${esc(m.prioridade)}</td><td>${esc(m.ordem_servico||'—')}<div class="muted">${esc(m.fornecedor||'')}</div></td><td>${dbr(m.data_prevista)}</td><td>${brl(m.custo)}</td><td><div class="pm-health-actions"><button class="pm-health-mini" title="Ficha técnica" onclick="pmOpenHealth('${m.patrimonio_id}')">${ICON.file}</button><button class="pm-health-mini" title="Editar manutenção" onclick="pmOpenMaintenance('${m.patrimonio_id}','${m.id}')">${ICON.wrench}</button></div></td></tr>`}).join('')||'<tr><td colspan="8" class="empty">Nenhuma manutenção encontrada.</td></tr>'}</tbody></table>`;
};

function bars(el,data){
 const entries=Object.entries(data),mx=Math.max(1,...entries.map(x=>x[1]));document.getElementById(el).innerHTML=entries.length?entries.sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="pm-bar-row"><span>${esc(k||'Não definido')}</span><div class="pm-bar-track"><i style="width:${Math.round(v/mx*100)}%"></i></div><b>${v}</b></div>`).join(''):'<div class="empty">Sem dados classificados.</div>';
}
window.pmRenderReports=function(){
 const a=HS.items.filter(x=>x.situacao!=='BAIXADO'),critA=a.filter(x=>x.criticidade_assistencial==='A').length,ind=a.filter(x=>x.status_tecnico==='INDISPONIVEL').length;
 const overdueCal=a.filter(x=>x.exige_calibracao&&x.proxima_calibracao&&days(x.proxima_calibracao)<0),overduePrev=a.filter(x=>x.exige_preventiva&&x.proxima_preventiva&&days(x.proxima_preventiva)<0),cost=HS.manutencoes.reduce((s,x)=>s+Number(x.custo||0),0);
 document.getElementById('pm-report-kpis').innerHTML=`<div class="pm-hk"><b>${a.length}</b><span>Ativos em carga</span></div><div class="pm-hk bad"><b>${critA}</b><span>Criticidade A</span></div><div class="pm-hk bad"><b>${overdueCal.length+overduePrev.length}</b><span>Conformidades vencidas</span></div><div class="pm-hk"><b style="font-size:18px">${brl(cost)}</b><span>Custo de manutenção</span></div>`;
 const c1={},c2={};a.forEach(x=>{c1[x.criticidade_assistencial||'Não definida']=(c1[x.criticidade_assistencial||'Não definida']||0)+1;c2[(x.classificacao_saude||'Não classificado').replaceAll('_',' ')]=(c2[(x.classificacao_saude||'Não classificado').replaceAll('_',' ')]||0)+1});bars('pm-report-critical',c1);bars('pm-report-class',c2);
 const due=a.filter(x=>x.exige_calibracao||x.exige_preventiva).sort((x,y)=>String(x.proxima_calibracao||x.proxima_preventiva||'9999').localeCompare(String(y.proxima_calibracao||y.proxima_preventiva||'9999')));
 document.getElementById('pm-report-due').innerHTML=`<table><thead><tr><th>Patrimônio</th><th>Unidade</th><th>Criticidade</th><th>Calibração</th><th>Preventiva</th><th>Status técnico</th></tr></thead><tbody>${due.map(x=>{const dc=days(x.proxima_calibracao),dp=days(x.proxima_preventiva),cls=n=>n===null?'':n<0?'over':n<=30?'soon':'ok';return`<tr><td><b>${esc(x.codigo_patrimonio)}</b><div class="muted">${esc(x.descricao)}</div></td><td>${esc(unitName(x.unidade_id))}</td><td>${esc(x.criticidade_assistencial||'—')}</td><td class="pm-due ${cls(dc)}">${x.exige_calibracao?dbr(x.proxima_calibracao):'N/A'}</td><td class="pm-due ${cls(dp)}">${x.exige_preventiva?dbr(x.proxima_preventiva):'N/A'}</td><td>${statusPill(x.status_tecnico)}</td></tr>`}).join('')||'<tr><td colspan="6" class="empty">Nenhum equipamento com rotina técnica cadastrada.</td></tr>'}</tbody></table>`;
 const costs={};HS.manutencoes.forEach(m=>{const p=item(m.patrimonio_id)||{},u=unitName(p.unidade_id)||'Não definida';costs[u]=(costs[u]||0)+Number(m.custo||0)});const mx=Math.max(1,...Object.values(costs));document.getElementById('pm-report-cost').innerHTML=Object.entries(costs).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="pm-bar-row"><span>${esc(k)}</span><div class="pm-bar-track"><i style="width:${Math.round(v/mx*100)}%"></i></div><b style="width:100px;text-align:right">${brl(v)}</b></div>`).join('')||'<div class="empty">Sem custos registrados.</div>';
};
window.pmExportHealthCSV=function(){
 const rows=[['Patrimonio','Descricao','Unidade','ClassificacaoSaude','Criticidade','StatusTecnico','RegistroANVISA','ProximaCalibracao','ProximaPreventiva','CentroCusto']].concat(HS.items.map(x=>[x.codigo_patrimonio,x.descricao,unitName(x.unidade_id),x.classificacao_saude,x.criticidade_assistencial,x.status_tecnico,x.numero_anvisa,x.proxima_calibracao,x.proxima_preventiva,x.centro_custo]));
 const csv='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(';')).join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='patrimonio_saude_'+new Date().toISOString().slice(0,10)+'.csv';a.click();
};
function pmRenderHealthDashboard(){
 const host=document.getElementById('p-dashboard');if(!host)return;let box=document.getElementById('pm-health-dashboard');if(!box){box=document.createElement('div');box.id='pm-health-dashboard';box.className='section';const grid=host.querySelector('.grid4');grid?.insertAdjacentElement('afterend',box)}
 const a=HS.items.filter(x=>x.situacao!=='BAIXADO'),crit=a.filter(x=>x.criticidade_assistencial==='A').length,ind=a.filter(x=>x.status_tecnico==='INDISPONIVEL').length,due=a.filter(x=>(x.exige_calibracao&&x.proxima_calibracao&&days(x.proxima_calibracao)<=30)||(x.exige_preventiva&&x.proxima_preventiva&&days(x.proxima_preventiva)<=30)).length,open=HS.manutencoes.filter(x=>!['CONCLUIDA','CANCELADA'].includes(x.status)).length;
 box.innerHTML=`<div class="section-head"><h2>Segurança e disponibilidade assistencial</h2><span class="pm-health-mark">${ICON.heart} Gestão em saúde</span></div><div class="pm-health-kpis"><div class="pm-hk bad"><b>${crit}</b><span>Equipamentos críticos (A)</span></div><div class="pm-hk bad"><b>${ind}</b><span>Indisponíveis</span></div><div class="pm-hk alert"><b>${due}</b><span>Calibração/preventiva em até 30 dias</span></div><div class="pm-hk"><b>${open}</b><span>Manutenções abertas</span></div></div>`;
}
function moreMobile(){
 const list=document.querySelector('.pm-more-list');if(!list||list.querySelector('[data-health="maintenance"]'))return;
 const b=document.createElement('button');b.className='pm-more-item';b.dataset.health='maintenance';b.innerHTML=`<span class="pm-more-icon">${ICON.wrench}</span><span><b>Manutenção clínica</b><small>Preventiva, corretiva e calibração</small></span><span class="pm-more-arrow">›</span>`;b.onclick=()=>{document.querySelector('.pm-more-bg')?.classList.remove('open');pmShow('manutencao')};list.appendChild(b);
 const c=document.createElement('button');c.className='pm-more-item';c.dataset.health='reports';c.innerHTML=`<span class="pm-more-icon">${ICON.chart}</span><span><b>Relatórios</b><small>Criticidade, conformidade e custos</small></span><span class="pm-more-arrow">›</span>`;c.onclick=()=>{document.querySelector('.pm-more-bg')?.classList.remove('open');pmShow('relatorios')};list.appendChild(c);
}
async function init(){
 css();addPages();addNav();modals();moreMobile();
 try{await pmRefreshHealth()}catch(e){}
 setTimeout(moreMobile,900);
 const mo=new MutationObserver(()=>moreMobile());mo.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,500));else setTimeout(init,500);
})();