(()=>{'use strict';if(window.__TDNGO_ALERT_CONFIG_V25__)return;window.__TDNGO_ALERT_CONFIG_V25__=true;
const API='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-manutencao-config-api';let rows=[],canEdit=false;
function token(){try{return JSON.parse(sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session')||'{}').tdngoToken||''}catch{return''}}
async function post(action,p={}){const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify({action,...p}),cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw new Error(d.message||'Falha ao carregar alertas.');return d}
function cfg(pri){return rows.find(x=>x.prioridade===pri)||{prioridade:pri,atraso_inicial_seg:0,repetir_cada_seg:300,max_repeticoes:1,som:'PERSONALIZADO',volume_percent:100,ativo:true}}
window.tdngoGetAlertConfig=(pri='P3')=>cfg(pri);
function css(){if(document.getElementById('alert25-css'))return;const s=document.createElement('style');s.id='alert25-css';s.textContent='.alert25{grid-column:1/-1}.alert25-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.alert25-pri{border:1px solid var(--border);background:var(--surface2);border-radius:12px;padding:11px}.alert25-pri h4{margin:0 0 8px;font-size:13px}.alert25-pri label{display:block;font-size:9px;color:var(--muted);text-transform:uppercase;margin:8px 0 3px}.alert25-pri input,.alert25-pri select{width:100%}.alert25-note{font-size:10px;color:var(--muted);line-height:1.45;margin-top:8px}.alert25-actions{display:flex;justify-content:flex-end;align-items:center;gap:7px;margin-top:12px;flex-wrap:wrap}.alert25-save-status{margin-right:auto;font-size:10px;font-weight:800;color:var(--muted);padding:6px 9px;border-radius:8px;background:var(--surface2);border:1px solid var(--border)}.alert25-save-status.pending{color:#8a5b00;background:#fff8e8;border-color:#efd9a3}.alert25-save-status.ok{color:#1f6b44;background:#eff9f3;border-color:#cce8d7}.alert25-save-status.err{color:#a12e2e;background:#fff3f3;border-color:#efcaca}@media(max-width:1000px){.alert25-grid{grid-template-columns:1fr 1fr}}@media(max-width:640px){.alert25-grid{grid-template-columns:1fr}}';document.head.appendChild(s)}
function soundOpts(v){return [['PERSONALIZADO','Sirene atual'],['GRAVE','Alerta grave'],['DUPLO','Duplo toque'],['SUAVE','Alerta suave'],['SEM_SOM','Sem som']].map(([id,n])=>`<option value="${id}" ${id===v?'selected':''}>${n}</option>`).join('')}
function render(){const host=document.querySelector('#page-settings .settings-grid');if(!host)return;let card=document.getElementById('alert25-card');if(!card){card=document.createElement('div');card.id='alert25-card';card.className='card settings-card alert25';host.appendChild(card)}card.innerHTML=`<div class="section-title"><h3>Notificações e sirene</h3></div><p class="small muted">Defina quando cada prioridade toca, se haverá repetição e qual som será usado. A repetição só ocorre enquanto a Central estiver aberta; com o app fechado, vale a regra de notificação do sistema operacional.</p><div class="alert25-grid">${['P1','P2','P3','P4'].map(pr=>{const c=cfg(pr);return `<div class="alert25-pri"><h4>${pr}</h4><label><input type="checkbox" data-a="ativo" data-pr="${pr}" ${c.ativo!==false?'checked':''} ${canEdit?'':'disabled'}> Alertas sonoros ativos</label><label>Atraso inicial (segundos)</label><input type="number" min="0" max="3600" data-a="delay" data-pr="${pr}" value="${c.atraso_inicial_seg}" ${canEdit?'':'disabled'}><label>Repetir a cada (segundos)</label><input type="number" min="1" max="86400" data-a="repeat" data-pr="${pr}" value="${c.repetir_cada_seg}" ${canEdit?'':'disabled'}><label>Quantidade de toques</label><input type="number" min="1" max="10" data-a="max" data-pr="${pr}" value="${c.max_repeticoes}" ${canEdit?'':'disabled'}><label>Som</label><select data-a="som" data-pr="${pr}" ${canEdit?'':'disabled'}>${soundOpts(c.som)}</select><label>Volume (%)</label><input type="number" min="0" max="100" data-a="vol" data-pr="${pr}" value="${c.volume_percent}" ${canEdit?'':'disabled'}><div class="alert25-note">${c.max_repeticoes===1?'Um único toque.':'O primeiro toque respeita o atraso; os demais usam o intervalo.'}</div><button class="btn sm" type="button" style="margin-top:8px" onclick="tdngoTestConfiguredSiren('${pr}')">Testar ${pr}</button></div>`}).join('')}</div><div class="alert25-actions"><span id="alert25-save-status" class="alert25-save-status">Configuração carregada</span><button class="btn" type="button" onclick="tdngoReloadAlertConfig()">Atualizar</button>${canEdit?'<button class="btn primary" id="alert25-save" type="button" onclick="tdngoSaveAlertConfig()">Salvar alertas</button>':''}</div>`}
async function load(){try{const d=await post('alert_get');rows=d.data||[];canEdit=!!d.can_edit;window.tdngoAlertConfigs=rows;render()}catch(e){console.warn('[TDNGo alert config]',e)}}
window.tdngoReloadAlertConfig=load;
window.tdngoSaveAlertConfig=async function(){
 const btn=document.getElementById('alert25-save'),st=document.getElementById('alert25-save-status');
 try{
  if(btn){btn.disabled=true;btn.textContent='Salvando...'}
  if(st){st.textContent='Salvando alterações...';st.className='alert25-save-status'}
  const out=['P1','P2','P3','P4'].map(pr=>({
   prioridade:pr,
   ativo:document.querySelector('[data-a="ativo"][data-pr="'+pr+'"]')?.checked!==false,
   atraso_inicial_seg:Number(document.querySelector('[data-a="delay"][data-pr="'+pr+'"]')?.value||0),
   repetir_cada_seg:Number(document.querySelector('[data-a="repeat"][data-pr="'+pr+'"]')?.value||300),
   max_repeticoes:Number(document.querySelector('[data-a="max"][data-pr="'+pr+'"]')?.value||1),
   som:document.querySelector('[data-a="som"][data-pr="'+pr+'"]')?.value||'PERSONALIZADO',
   volume_percent:Number(document.querySelector('[data-a="vol"][data-pr="'+pr+'"]')?.value||100)
  }));
  const d=await post('alert_save',{rows:out});rows=d.data||out;window.tdngoAlertConfigs=rows;
  const hora=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});render();
  const st2=document.getElementById('alert25-save-status');if(st2){st2.textContent='Salvo às '+hora;st2.className='alert25-save-status ok'}
  window.toast?.('Configurações de alertas e SLA salvas com sucesso.','ok');
 }catch(e){const sx=document.getElementById('alert25-save-status');if(sx){sx.textContent='Falha ao salvar';sx.className='alert25-save-status err'}window.toast?.(e.message||'Não foi possível salvar as configurações.','err')}
 finally{const b=document.getElementById('alert25-save');if(b){b.disabled=false;b.textContent='Salvar alertas'}}
};
window.tdngoTestConfiguredSiren=async function(pr){
  const som=document.querySelector(`[data-a="som"][data-pr="${pr}"]`)?.value||cfg(pr).som||'PERSONALIZADO';
  const vol=Number(document.querySelector(`[data-a="vol"][data-pr="${pr}"]`)?.value??cfg(pr).volume_percent??100);
  if(som==='SEM_SOM'||vol<=0){window.toast?.('Selecione um som e volume acima de 0% para testar.','err');return}
  try{
    const ok=await window.tdngoPlaySirenPreset?.(som,vol);
    window.toast?.(ok===false?'O navegador bloqueou o áudio. Clique novamente em Testar.':`Teste ${pr} executado.`,ok===false?'err':'ok');
  }catch(e){window.toast?.('Não foi possível reproduzir o alerta.','err')}
}
function install(){css();load();document.addEventListener('input',e=>{const x=e.target;if(!(x instanceof HTMLInputElement||x instanceof HTMLSelectElement))return;if(!x.closest('#alert25-card'))return;const st=document.getElementById('alert25-save-status');if(st){st.textContent='Alterações pendentes';st.className='alert25-save-status pending'}});document.addEventListener('change',e=>{const x=e.target;if(!(x instanceof HTMLInputElement)||x.dataset.a!=='ativo'||!x.checked)return;const pr=x.dataset.pr;const som=document.querySelector(`[data-a="som"][data-pr="${pr}"]`),vol=document.querySelector(`[data-a="vol"][data-pr="${pr}"]`);if(som&&som.value==='SEM_SOM')som.value=pr==='P1'?'GRAVE':pr==='P2'?'DUPLO':'SUAVE';if(vol&&Number(vol.value)<=0)vol.value=pr==='P4'?'80':'100'});const mo=new MutationObserver(()=>{if(document.querySelector('#page-settings .settings-grid')&&!document.getElementById('alert25-card'))render()});mo.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();