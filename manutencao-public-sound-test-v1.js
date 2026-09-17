(()=>{
'use strict';
if(window.__TDNGO_PUBLIC_SOUND_TEST_V1__)return;window.__TDNGO_PUBLIC_SOUND_TEST_V1__=true;
function install(){
  const form=document.getElementById('public-form');
  if(!form||document.getElementById('public-sound-test'))return;
  const row=form.querySelector('.submit-row');
  if(!row)return;
  const box=document.createElement('div');
  box.id='public-sound-test';
  box.style.cssText='margin-top:14px;padding:12px 13px;border:1px dashed #ef9a9a;background:#fff7f7;border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap';
  box.innerHTML='<div><b style="display:block;color:#a61b1b;font-size:11px">TESTE PROVISÓRIO DE ALERTA</b><span style="display:block;margin-top:3px;color:#69798a;font-size:10px">NÃO REGISTRA CHAMADO. USE PARA VALIDAR O SOM DE P1 NESTE DISPOSITIVO.</span></div><button type="button" id="public-test-siren-btn" class="btn" style="background:#c62828;border-color:#c62828;color:#fff;font-weight:850">TESTAR SIRENE P1</button>';
  row.parentNode.insertBefore(box,row);
  document.getElementById('public-test-siren-btn').addEventListener('click',async()=>{
    const b=document.getElementById('public-test-siren-btn');
    const old=b.textContent;b.disabled=true;b.textContent='TESTANDO...';
    try{
      localStorage.setItem('tdngo_manut_sound_enabled_v8','1');
      let ok=false;
      if(typeof window.tdngoTestMaintenanceAlarm==='function')ok=(await window.tdngoTestMaintenanceAlarm())!==false;
      else if(typeof window.tdngoPlaySirenPreset==='function')ok=(await window.tdngoPlaySirenPreset('PERSONALIZADO',100))!==false;
      else if(typeof window.tdngoCustomSirenPlay==='function')ok=(await window.tdngoCustomSirenPlay(true))!==false;
      if(!ok)throw new Error('O navegador bloqueou o áudio ou a sirene ainda não carregou.');
      b.textContent='SIRENE EXECUTADA';
      setTimeout(()=>{b.textContent=old;b.disabled=false},1800);
      return;
    }catch(e){
      b.textContent='TENTAR NOVAMENTE';b.disabled=false;
      const msg=e?.message||'Não foi possível tocar a sirene.';
      if(typeof window.toast==='function')window.toast(msg,'err');else alert(msg);
    }
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setTimeout(install,400);setTimeout(install,1200);setTimeout(install,2500);
})();
