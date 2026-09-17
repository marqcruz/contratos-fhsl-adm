(()=>{
'use strict';
if(window.__TDNGO_PUBLIC_SUBMIT_V2__)return;window.__TDNGO_PUBLIC_SUBMIT_V2__=true;
const API='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-manutencao-scope-api';
const STARTED=Date.now();
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const digits=v=>String(v||'').replace(/\D/g,'');
function validCpf(v){const c=digits(v);if(c.length!==11||/^(\d)\1{10}$/.test(c))return false;let s=0;for(let i=0;i<9;i++)s+=Number(c[i])*(10-i);let d=(s*10)%11;if(d===10)d=0;if(d!==Number(c[9]))return false;s=0;for(let i=0;i<10;i++)s+=Number(c[i])*(11-i);d=(s*10)%11;if(d===10)d=0;return d===Number(c[10])}
function statusBox(){let e=$('public-submit-status');if(e)return e;e=document.createElement('div');e.id='public-submit-status';e.style.cssText='display:none;margin:12px 0 0;padding:11px 13px;border-radius:9px;font-size:12px;font-weight:700;line-height:1.45';const row=document.querySelector('#public-form .submit-row');row?.parentNode?.insertBefore(e,row);return e}
function showStatus(msg,type='err'){const e=statusBox();if(!e)return;e.textContent=msg;e.style.display='block';e.style.background=type==='ok'?'#edf9f1':'#fff3f2';e.style.border='1px solid '+(type==='ok'?'#9fd5ad':'#efb6b2');e.style.color=type==='ok'?'#1f6f3c':'#a12d28';e.scrollIntoView({behavior:'smooth',block:'nearest'})}
function clearStatus(){const e=statusBox();if(e)e.style.display='none'}
function getPhotos(){return [...document.querySelectorAll('#p-photo-grid img')].map((img,i)=>({data:String(img.src||''),name:'foto-'+(i+1)+'.jpg'})).filter(x=>x.data.startsWith('data:image/')).slice(0,5)}
function field(id,label,min=1){const e=$(id),v=String(e?.value||'').trim();if(v.length<min){e?.focus();throw new Error('Preencha corretamente: '+label+'.')}return v}
async function post(payload){const c=new AbortController(),tm=setTimeout(()=>c.abort(),60000);try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'public_create',...payload}),cache:'no-store',signal:c.signal});const t=await r.text();let d;try{d=JSON.parse(t)}catch{d={ok:false,message:t||'Resposta inválida do servidor.'}}if(!r.ok||d.ok===false)throw new Error(d.message||('Erro HTTP '+r.status));return d}finally{clearTimeout(tm)}}
function success(d){try{localStorage.setItem('manut_recent_ticket',JSON.stringify({protocolo:d.protocolo,token:d.token,ts:Date.now()}))}catch{}
 $('public-form')?.classList.add('hide');const box=$('public-success');if(box){box.classList.remove('hide');box.innerHTML=`<div class="pill ${d.modo_atendimento==='SOBREAVISO'?'warn':'ok'}">${d.modo_atendimento==='SOBREAVISO'?'Operação de sobreaviso':'Horário regular'}</div><h2>Chamado registrado</h2><div class="success-code">${esc(d.protocolo)}</div><p class="muted">Guarde o código abaixo junto com o protocolo para acompanhar o chamado.</p><div class="token-box">${esc(d.token)}</div><div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn" type="button" onclick="navigator.clipboard?.writeText('Protocolo: ${esc(d.protocolo)}\\nCódigo: ${esc(d.token)}')">Copiar dados</button><button class="btn primary" type="button" onclick="pubTab('track');document.getElementById('track-protocol').value='${esc(d.protocolo)}';document.getElementById('track-token').value='${esc(d.token)}';trackPublic()">Acompanhar</button></div><p class="small muted" style="margin-top:12px">Prioridade inicial: <b>${esc(d.prioridade)}</b>. ${esc(d.message||'')}</p>`}window.scrollTo({top:0,behavior:'smooth'})}
async function submit(ev){ev.preventDefault();ev.stopImmediatePropagation();clearStatus();const b=$('p-submit');if(b?.disabled)return;
 try{
  const nome=field('p-name','nome completo',3),cpf=field('p-cpf','CPF',11),telefone=field('p-phone','telefone',10),unidade_id=field('p-unit','unidade'),categoria_id=field('p-category','categoria'),local_problema=field('p-local','local exato do problema',3),titulo=field('p-title','resumo do problema',5),descricao=field('p-desc','descrição detalhada',10);
  if(!validCpf(cpf)){ $('p-cpf')?.focus(); throw new Error('O CPF informado é inválido. Confira os 11 dígitos antes de registrar o chamado.') }
  if(digits(telefone).length<10){$('p-phone')?.focus();throw new Error('Informe um telefone/WhatsApp válido com DDD.')}
  if(!$('p-consent')?.checked)throw new Error('Marque a declaração de responsabilidade para registrar o chamado.');
  const fotos=getPhotos();if(!fotos.length)throw new Error('Adicione pelo menos uma foto do problema.');
  if(Date.now()-STARTED<1800)await new Promise(r=>setTimeout(r,1800-(Date.now()-STARTED)));
  if(b){b.disabled=true;b.textContent='Registrando chamado...'}showStatus('Enviando chamado e foto. Aguarde...','ok');
  const d=await post({website:$('website')?.value||'',form_started_at:STARTED,solicitante_nome:nome,cpf,telefone,unidade_id,setor_solicitante:$('p-sector')?.value||'',local_problema,categoria_id,impacto:$('p-impact')?.value||'SEM_IMPACTO',titulo,descricao,fotos,geo:null,termo_aceite:true});
  showStatus('Chamado registrado com sucesso.','ok');success(d);
 }catch(e){const m=e?.name==='AbortError'?'O servidor demorou mais de 60 segundos para responder. Tente novamente.':(e?.message||'Não foi possível registrar o chamado.');showStatus(m,'err');try{window.toast?.(m,'err')}catch{}}
 finally{if(b){b.disabled=false;b.textContent='Registrar chamado'}}
}
function install(){const f=$('public-form');if(!f||f.dataset.submitV2==='1')return;f.dataset.submitV2='1';f.addEventListener('submit',submit,true);statusBox()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();setTimeout(install,300);setTimeout(install,1200);
})();