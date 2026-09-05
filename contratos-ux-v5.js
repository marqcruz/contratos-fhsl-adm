(function(){
'use strict';
function parentOf(c){if(!c)return null;if(c.tipo==='Contrato')return c;if(!c.contratoPai)return null;return contracts.find(function(x){return x.id===c.contratoPai&&x.tipo==='Contrato'})||null}
function seedSearchAliases(){try{contracts.forEach(function(c){var p=parentOf(c);var bits=[c.numero,c.empresa,c.cnpj,c.objeto];if(p){bits.push(p.numero,'contrato '+p.numero,'contrato pai '+p.numero,p.empresa,p.cnpj)}if(c.tipo==='Termo Aditivo')bits.push((c.ordemAditivo||'')+' aditivo',(c.ordemAditivo||'')+'º aditivo');c.__buscaFamilia=bits.filter(Boolean).join(' ')})}catch(e){console.warn('Busca familiar',e)}}

var oldRenderLista=typeof renderLista==='function'?renderLista:null;
if(oldRenderLista){renderLista=function(){seedSearchAliases();return oldRenderLista()}}
var search=document.getElementById('search');if(search){search.setAttribute('placeholder','Buscar contrato, aditivo, empresa, CNPJ, objeto...');search.addEventListener('input',function(){window.listaPage=1})}

// Alertas passam a existir por contrato-pai. Termos substituídos ou históricos não contam isoladamente.
var baseGetVig=typeof getVigStatus==='function'?getVigStatus:null;
function ignoreAditivoNosAlertas(c){return !!(c&&c.tipo==='Termo Aditivo')}
function contratosEmAlerta(){if(!baseGetVig)return[];return contracts.filter(function(c){if(!c||c.tipo==='Termo Aditivo'||['Encerrado','Suspenso'].indexOf(c.statusContrato)>=0)return false;var s=baseGetVig(c);return s==='vencendo'||s==='vencido'})}
function correctAlertBadge(){var badge=document.getElementById('nav-alert-badge');if(!badge)return;var n=contratosEmAlerta().length;badge.textContent=n;badge.style.display=n?'inline':'none'}
var oldBuild=typeof buildNotifications==='function'?buildNotifications:null;
if(oldBuild){buildNotifications=function(){oldBuild();try{notifications=notifications.filter(function(n){var c=contracts.find(function(x){return x.id===n.cid});return c&&!ignoreAditivoNosAlertas(c)});if(typeof renderBell==='function')renderBell();correctAlertBadge()}catch(e){console.warn(e)}}}
var oldAlertas=typeof renderAlertas==='function'?renderAlertas:null;
if(oldAlertas&&baseGetVig){renderAlertas=function(){var original=getVigStatus;getVigStatus=function(c){if(ignoreAditivoNosAlertas(c))return'ativo';return original(c)};try{var r=oldAlertas();correctAlertBadge();return r}finally{getVigStatus=original}}}
var oldRefresh=typeof refreshAll==='function'?refreshAll:null;
if(oldRefresh){refreshAll=function(){var r=oldRefresh();correctAlertBadge();return r}}

// O sino é removido; a página Alertas permanece como a área oficial de acompanhamento.
var bell=document.querySelector('.bell-wrap');if(bell)bell.style.display='none';

function brDateFromDate(d){if(!d||isNaN(d.getTime()))return'';return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()}
function fiscalFor(c){var p=parentOf(c)||c;var email=(c&&c.fiscalEmail)||p.fiscalEmail||'';var nome=(c&&c.fiscalNome)||p.fiscalNome||'';return{email:String(email||'').trim(),nome:String(nome||'').trim(),contrato:p}}
function effectiveEnd(p){try{var v=vigenciaEfetiva(p);return v&&v.fim?v.fim:null}catch(e){return null}}
function addFiscalButton(id){var c=contracts.find(function(x){return x.id===String(id)}),footer=document.getElementById('modal-footer');if(!c||!footer)return;footer.querySelectorAll('[data-aviso-fiscal]').forEach(function(x){x.remove()});var f=fiscalFor(c);if(!f.email)return;var b=document.createElement('button');b.type='button';b.className='btn sm';b.dataset.avisoFiscal='1';b.textContent='✉ Avisar fiscal';b.title='Preparar aviso de vencimento para '+f.email;b.onclick=function(){window.tdngoAvisarFiscal(c.id)};footer.insertBefore(b,footer.firstChild)}
window.tdngoAvisarFiscal=async function(id){var c=contracts.find(function(x){return x.id===String(id)});if(!c)return;var f=fiscalFor(c),p=f.contrato;if(!f.email){showNotif('Fiscal sem e-mail cadastrado.','err');return}var fim=effectiveEnd(p),fimBR=brDateFromDate(fim),dias=fim?Math.ceil((fim-new Date())/86400000):null;var assunto='Aviso de vigência — Contrato '+(p.numero||'');var saudacao=f.nome?'Prezado(a) '+f.nome+',':'Prezado(a) Fiscal,';var situacao=dias==null?'possui vigência contratual cadastrada':dias<0?'encontra-se com a vigência encerrada em '+fimBR:dias===0?'possui vigência até hoje, '+fimBR:'possui vigência prevista até '+fimBR+' ('+dias+' dia'+(dias===1?'':'s')+' restante'+(dias===1?'':'s')+')';var corpo=saudacao+'\n\nInformamos que o Contrato nº '+(p.numero||'')+', firmado com '+(p.empresa||'a empresa contratada')+', '+situacao+'.\n\nSolicitamos o acompanhamento das providências cabíveis quanto à continuidade, prorrogação ou encerramento contratual.\n\nAtenciosamente,\nTDNGo — Gestão Operacional';try{if(typeof contratosApi==='function')contratosApi('logevent',{acao:'Preparou aviso ao fiscal',alvo:p.id,detalhe:'Contrato '+(p.numero||'')+' — '+f.email}).catch(function(){})}catch(e){}window.location.href='mailto:'+encodeURIComponent(f.email)+'?subject='+encodeURIComponent(assunto)+'&body='+encodeURIComponent(corpo)};

var oldShow=typeof showDetail==='function'?showDetail:null;
if(oldShow){showDetail=function(id){var r=oldShow(id);setTimeout(function(){addFiscalButton(id)},0);return r}}

seedSearchAliases();correctAlertBadge();
try{if(typeof buildNotifications==='function')buildNotifications()}catch(e){}
try{if(document.querySelector('#page-lista.active')&&typeof renderLista==='function')renderLista()}catch(e){}
})();
