(function(){
'use strict';
function parentOf(c){if(!c)return null;if(c.tipo==='Contrato')return c;if(!c.contratoPai)return null;return contracts.find(function(x){return x.id===c.contratoPai&&x.tipo==='Contrato'})||null}
function seedSearchAliases(){try{contracts.forEach(function(c){var p=parentOf(c);var bits=[c.numero,c.empresa,c.cnpj,c.objeto];if(p){bits.push(p.numero,'contrato '+p.numero,'contrato pai '+p.numero,p.empresa,p.cnpj)}if(c.tipo==='Termo Aditivo')bits.push((c.ordemAditivo||'')+' aditivo',(c.ordemAditivo||'')+'º aditivo');c.__buscaFamilia=bits.filter(Boolean).join(' ')})}catch(e){console.warn('Busca familiar',e)}}

var oldRenderLista=typeof renderLista==='function'?renderLista:null;
if(oldRenderLista){renderLista=function(){seedSearchAliases();return oldRenderLista()}}
var search=document.getElementById('search');if(search){search.setAttribute('placeholder','Buscar contrato, aditivo, empresa, CNPJ, objeto...');search.addEventListener('input',function(){window.listaPage=1})}

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

var bell=document.querySelector('.bell-wrap');if(bell)bell.style.display='none';

function brDateFromDate(d){if(!d||isNaN(d.getTime()))return'';return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()}
function fiscalFor(c){var p=parentOf(c)||c;var email=(c&&c.fiscalEmail)||p.fiscalEmail||'';var nome=(c&&c.fiscalNome)||p.fiscalNome||'';return{email:String(email||'').trim(),nome:String(nome||'').trim(),contrato:p}}
function effectiveEnd(p){try{var v=vigenciaEfetiva(p);return v&&v.fim?v.fim:null}catch(e){return null}}
function parseBrSafe(v){if(!v)return null;try{if(typeof parseBR==='function')return parseBR(v)}catch(e){}var m=String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(!m)return null;var d=new Date(+m[3],+m[2]-1,+m[1]);return isNaN(d.getTime())?null:d}
function tempoTotalVigencia(c){var p=parentOf(c)||c,start=parseBrSafe(p.vigenciaInicio),end=effectiveEnd(p)||parseBrSafe(p.vigenciaFim);if(!start||!end||end<start)return'';var meses=(end.getFullYear()-start.getFullYear())*12+(end.getMonth()-start.getMonth());if(end.getDate()<start.getDate())meses--;meses=Math.max(0,meses);var anos=Math.floor(meses/12),rest=meses%12,partes=[];if(anos)partes.push(anos+' ano'+(anos===1?'':'s'));if(rest)partes.push(rest+' '+(rest===1?'mês':'meses'));if(!partes.length)partes.push('menos de 1 mês');return partes.join(' e ')}
function addTempoVigencia(id){var c=contracts.find(function(x){return x.id===String(id)});if(!c)return;var tempo=tempoTotalVigencia(c);if(!tempo)return;var body=document.getElementById('modal-body');if(!body)return;var sec=[].slice.call(body.querySelectorAll('.dsec')).find(function(s){var t=s.querySelector('.dsec-title');return t&&String(t.textContent||'').trim().toLowerCase()==='vigência'});if(!sec)return;var grid=sec.querySelector('.dgrid');if(!grid)return;var antigo=grid.querySelector('[data-tempo-vigencia]');if(antigo)antigo.remove();var box=document.createElement('div');box.className='di';box.dataset.tempoVigencia='1';box.innerHTML='<label>Tempo total de vigência</label><p><strong>'+tempo+'</strong></p>';grid.appendChild(box)}
function addFiscalButton(id){var c=contracts.find(function(x){return x.id===String(id)}),footer=document.getElementById('modal-footer');if(!c||!footer)return;footer.querySelectorAll('[data-aviso-fiscal]').forEach(function(x){x.remove()});var f=fiscalFor(c);if(!f.email)return;var b=document.createElement('button');b.type='button';b.className='btn sm';b.dataset.avisoFiscal='1';b.textContent='✉ Avisar fiscal';b.title='Preparar aviso de vencimento para '+f.email;b.onclick=function(){window.tdngoAvisarFiscal(c.id)};footer.insertBefore(b,footer.firstChild)}
window.tdngoAvisarFiscal=async function(id){var c=contracts.find(function(x){return x.id===String(id)});if(!c)return;var f=fiscalFor(c),p=f.contrato;if(!f.email){showNotif('Fiscal sem e-mail cadastrado.','err');return}var fim=effectiveEnd(p),fimBR=brDateFromDate(fim),dias=fim?Math.ceil((fim-new Date())/86400000):null;var assunto='Aviso de vigência — Contrato '+(p.numero||'');var saudacao=f.nome?'Prezado(a) '+f.nome+',':'Prezado(a) Fiscal,';var situacao=dias==null?'possui vigência contratual cadastrada':dias<0?'encontra-se com a vigência encerrada em '+fimBR:dias===0?'possui vigência até hoje, '+fimBR:'possui vigência prevista até '+fimBR+' ('+dias+' dia'+(dias===1?'':'s')+' restante'+(dias===1?'':'s')+')';var corpo=saudacao+'\n\nInformamos que o Contrato nº '+(p.numero||'')+', firmado com '+(p.empresa||'a empresa contratada')+', '+situacao+'.\n\nSolicitamos o acompanhamento das providências cabíveis quanto à continuidade, prorrogação ou encerramento contratual.\n\nAtenciosamente,\nTDNGo — Gestão Operacional';try{if(typeof contratosApi==='function')contratosApi('logevent',{acao:'Preparou aviso ao fiscal',alvo:p.id,detalhe:'Contrato '+(p.numero||'')+' — '+f.email}).catch(function(){})}catch(e){}window.location.href='mailto:'+encodeURIComponent(f.email)+'?subject='+encodeURIComponent(assunto)+'&body='+encodeURIComponent(corpo)};

function canManage(){try{return currentUser&&['admin','gestor'].includes(String(currentUser.role||'').toLowerCase())}catch(e){return false}}
window.deleteFromModal=async function(){if(!canManage()){showNotif('Apenas gestores e administradores podem excluir.','err');return}if(!confirm('Confirma a exclusão definitiva deste contrato?'))return;var id=currentDetailId;showLoading('Excluindo do Supabase...');closeModal();try{var r=await contratosApi('delete',{id:id});if(!r.ok)throw new Error(r.message||'Falha ao excluir');contracts=contracts.filter(function(x){return x.id!==id&&x.contratoPai!==id});try{localStorage.setItem('fhsl_local',JSON.stringify(contracts))}catch(e){}showNotif('Contrato excluído.','ok');refreshAll()}catch(e){showNotif('Erro ao excluir: '+String(e.message||e),'err')}finally{hideLoading()}};
function addGestorDelete(id){if(!canManage())return;var footer=document.getElementById('modal-footer');if(!footer)return;var existing=footer.querySelector('.btn.danger');if(existing)return;var b=document.createElement('button');b.type='button';b.className='btn danger sm';b.textContent='🗑 Excluir';b.onclick=function(){currentDetailId=String(id);deleteFromModal()};footer.appendChild(b)}

function removeDashboardUI(){var nav=document.querySelector('[data-page="dashboard"]');if(nav)nav.style.display='none';var page=document.getElementById('page-dashboard');if(page)page.style.display='none';var lista=document.querySelector('[data-page="lista"]');var ativa=document.querySelector('.page.active');if((ativa&&ativa.id==='page-dashboard')||!ativa){try{if(typeof showPage==='function')showPage('lista',lista)}catch(e){}}}

var oldShow=typeof showDetail==='function'?showDetail:null;
if(oldShow){showDetail=function(id){var r=oldShow(id);setTimeout(function(){addFiscalButton(id);addGestorDelete(id);addTempoVigencia(id)},0);return r}}

seedSearchAliases();correctAlertBadge();removeDashboardUI();
try{if(typeof buildNotifications==='function')buildNotifications()}catch(e){}
try{if(document.querySelector('#page-lista.active')&&typeof renderLista==='function')renderLista()}catch(e){}
})();
