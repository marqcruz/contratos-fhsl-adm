(()=>{
'use strict';
if(window.__TDNGO_PUBLIC_REAL_TEST_V2__)return;window.__TDNGO_PUBLIC_REAL_TEST_V2__=true;
const $=id=>document.getElementById(id);
function install(){
  const form=$('public-form');
  if(!form||$('public-real-test'))return;
  const row=form.querySelector('.submit-row');
  if(!row)return;
  const box=document.createElement('div');
  box.id='public-real-test';
  box.style.cssText='margin-top:14px;padding:12px 13px;border:1px dashed #ef9a9a;background:#fff7f7;border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap';
  box.innerHTML='<div style="flex:1;min-width:220px"><b style="display:block;color:#a61b1b;font-size:11px">TESTE REAL DO FLUXO</b><span style="display:block;margin-top:3px;color:#69798a;font-size:10px;line-height:1.45">CRIA UM CHAMADO REAL P1. ELE ENTRARÁ NO PAINEL, SLA E ALERTAS. USE DADOS REAIS DO SOLICITANTE E UMA FOTO DE TESTE.</span></div><button type="button" id="public-real-test-btn" class="btn" style="background:#c62828;border-color:#c62828;color:#fff;font-weight:850">GERAR CHAMADO REAL P1</button>';
  row.parentNode.insertBefore(box,row);
  $('public-real-test-btn').addEventListener('click',()=>{
    const b=$('public-real-test-btn');
    if(b?.disabled)return;
    const ok=window.confirm('Este teste criará um CHAMADO REAL no sistema, com protocolo, SLA e alertas. Deseja continuar?');
    if(!ok)return;
    const impact=$('p-impact');if(impact)impact.value='RISCO_ASSISTENCIAL';
    const title=$('p-title');if(title&&!String(title.value||'').trim())title.value='[TESTE REAL] Validação do fluxo de manutenção';else if(title&&!/^\[TESTE REAL\]/i.test(title.value))title.value='[TESTE REAL] '+title.value.trim();
    const desc=$('p-desc');if(desc&&!String(desc.value||'').trim())desc.value='Chamado real criado pelo botão provisório de teste para validar abertura pública, entrada no painel, SLA, notificações e alerta P1. Após a validação, o chamado poderá ser cancelado ou concluído pela equipe.';else if(desc&&!/^\[TESTE REAL\]/i.test(desc.value))desc.value='[TESTE REAL] '+desc.value.trim();
    const local=$('p-local');if(local&&!String(local.value||'').trim())local.value='TESTE DE SISTEMA';
    const sector=$('p-sector');if(sector&&!String(sector.value||'').trim())sector.value='TESTE DE SISTEMA';
    try{localStorage.setItem('tdngo_manut_sound_enabled_v8','1')}catch{}
    b.disabled=true;b.textContent='CRIANDO CHAMADO...';
    const reset=()=>{setTimeout(()=>{b.disabled=false;b.textContent='GERAR CHAMADO REAL P1'},1800)};
    try{
      if(typeof window.submitPublic==='function'){
        const ev={preventDefault(){},stopImmediatePropagation(){}};
        Promise.resolve(window.submitPublic(ev)).finally(reset);
      }else if(typeof form.requestSubmit==='function'){
        form.requestSubmit($('p-submit')||undefined);reset();
      }else{
        $('p-submit')?.click();reset();
      }
    }catch(e){reset();const msg=e?.message||'Não foi possível iniciar o chamado de teste.';if(typeof window.toast==='function')window.toast(msg,'err');else alert(msg)}
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setTimeout(install,400);setTimeout(install,1200);setTimeout(install,2500);
})();
