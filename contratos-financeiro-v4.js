(function(){
'use strict';
var PREFIX='TDNGO_ADITIVO:';
function el(id){return document.getElementById(id)}
function ordem(x){var n=parseInt(x&&x.ordemAditivo,10);return n>0?n:0}
function meta(x){var m={vigencia:false,valor:false,financeiro:'sem_alteracao'};if(!x||x.tipo!=='Termo Aditivo')return m;var s=String(x.prorrogacao||'');if(s.indexOf(PREFIX)===0){try{var j=JSON.parse(s.slice(PREFIX.length));m.vigencia=!!j.vigencia;m.valor=!!j.valor;m.financeiro=j.financeiro||x.tipoValor||(m.valor?'acrescimo':'sem_alteracao');return m}catch(e){}}m.valor=!!(x.tipoValor&&x.tipoValor!=='sem_alteracao');m.financeiro=x.tipoValor||'sem_alteracao';return m}
function adits(p){return contracts.filter(function(a){return a.tipo==='Termo Aditivo'&&a.contratoPai===p.id}).sort(function(a,b){return ordem(a)-ordem(b)})}
function ultimoQueProrroga(p){var l=adits(p).filter(function(a){return meta(a).vigencia&&a.vigenciaFim});return l.length?l[l.length-1]:null}

// A ordem define o instrumento mais recente; a vigência vem apenas do último TA que realmente prorrogou.
vigenciaEfetiva=function(x){if(x&&x.tipo==='Contrato'){var a=ultimoQueProrroga(x);if(a)return{fim:parseBR(a.vigenciaFim)||parseBR(x.vigenciaFim),fonte:a};}return{fim:parseBR(x&&x.vigenciaFim),fonte:x};};
window.tdngoUltimoAditivoQueProrroga=ultimoQueProrroga;
window.tdngoComportamentoFinanceiro=function(x){var m=meta(x),t=m.financeiro||x.tipoValor||'sem_alteracao';if(!m.valor||t==='sem_alteracao')return'sem_alteracao';if(t==='novototal')return'novototal';if(t==='supressao')return'supressao';return'acrescimo';};

function ensureHelp(){var group=el('tipovalor-group');if(!group)return;var sel=el('f-tipovalor');if(sel){Array.from(sel.options).forEach(function(o){if(o.value==='acrescimo')o.textContent='Acréscimo — soma ao valor vigente';if(o.value==='supressao')o.textContent='Supressão — subtrai do valor vigente';if(o.value==='novototal')o.textContent='Novo total do período — substitui o valor vigente';});}
if(!el('financeiro-help')){var d=document.createElement('div');d.id='financeiro-help';d.style.cssText='margin-top:7px;padding:9px 11px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);font-size:11px;line-height:1.45;color:var(--text2)';group.appendChild(d)}updateHelp()}
function updateHelp(){var d=el('financeiro-help');if(!d)return;var alt=!!el('f-alt-valor')?.checked,sel=el('f-tipovalor');if(sel)sel.disabled=!alt;if(!alt){d.innerHTML='<b>Sem alteração financeira:</b> herda integralmente unidades e valores vigentes do instrumento anterior. O valor eventualmente citado no termo é apenas o valor do período/instrumento e não será somado.';return}var t=sel&&sel.value||'acrescimo';if(t==='novototal')d.innerHTML='<b>Novo total do período:</b> substitui a composição financeira anterior. Nunca soma o novo total ao contrato anterior.';else if(t==='supressao')d.innerHTML='<b>Supressão:</b> subtrai somente a variação informada do valor vigente.';else d.innerHTML='<b>Acréscimo:</b> soma somente a variação informada ao valor vigente. Use apenas quando o termo efetivamente acrescentar postos, unidades ou valores.'}

function addBehaviorBadge(){document.querySelectorAll('#modal-body [data-financial-v4]').forEach(function(x){x.remove()});var body=el('modal-body');if(!body)return;var title=body.closest('.modal')?.querySelector('h2,h3,strong');var txt=title&&title.textContent||'';var m=txt.match(/(?:Nº|nº)?\s*([0-9]+\/[0-9]{4})/);if(!m)return;var x=contracts.find(function(c){return c.numero===m[1]&&c.tipo==='Termo Aditivo'});if(!x)return;var t=window.tdngoComportamentoFinanceiro(x),label=t==='novototal'?'NOVO TOTAL — substitui o anterior':t==='acrescimo'?'ACRÉSCIMO — soma ao vigente':t==='supressao'?'SUPRESSÃO — subtrai do vigente':'SEM ALTERAÇÃO — herda o anterior';var d=document.createElement('div');d.dataset.financialV4='1';d.style.cssText='margin:0 0 12px;padding:9px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);font-size:11px';d.innerHTML='<b>Comportamento financeiro:</b> '+label;body.prepend(d)}

ensureHelp();el('f-alt-valor')?.addEventListener('change',updateHelp);el('f-tipovalor')?.addEventListener('change',updateHelp);
var oldType=typeof onTipoChange==='function'?onTipoChange:null;onTipoChange=function(){if(oldType)oldType();setTimeout(function(){ensureHelp();updateHelp()},0)};
var oldFill=typeof fillForm==='function'?fillForm:null;fillForm=function(x){if(oldFill)oldFill(x);setTimeout(function(){ensureHelp();updateHelp()},0)};
var oldShow=typeof showDetail==='function'?showDetail:null;showDetail=function(id){if(oldShow)oldShow(id);setTimeout(addBehaviorBadge,0)};
try{renderLista()}catch(e){}
})();
