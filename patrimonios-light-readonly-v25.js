(()=>{
'use strict';

function forceLight(){
  try{localStorage.setItem('tdngo_patrimonio_theme','light')}catch(e){}
  document.body?.setAttribute('data-theme','light');
  document.documentElement.style.colorScheme='light';
}

function addCss(){
  if(document.getElementById('pat-v25'))return;
  const s=document.createElement('style');
  s.id='pat-v25';
  s.textContent=`
  :root{
    color-scheme:light!important;
    --pm-bg:#f4f7fa!important;
    --pm-surface:#ffffff!important;
    --pm-surface2:#f7f9fb!important;
    --pm-border:#dde4eb!important;
    --pm-text:#18222d!important;
    --pm-muted:#667585!important;
    --pm-accent:#1769d2!important;
    --pm-accent2:#1769d2!important;
  }
  html,body{background:#f4f7fa!important;color:#18222d!important;color-scheme:light!important}
  button[onclick*="toggleTheme"]{display:none!important}
  .inv15-readonly .inv15-work{grid-template-columns:1fr!important}
  .inv15-readonly .inv15-scan-pane{display:none!important}
  .inv15-readonly-note{display:flex;align-items:center;gap:8px;margin:0 0 12px;padding:10px 12px;border:1px solid #dbe3eb;border-radius:11px;background:#fff;color:#536171;font-size:10px}
  .inv15-readonly-note b{color:#18222d;font-size:10.5px}
  .inv15-readonly-note .dot{width:8px;height:8px;border-radius:50%;background:#22a06b;flex:0 0 8px}
  .inv15-readonly #inv15-detail-list{max-height:58dvh}
  @media(max-width:760px){.inv15-readonly-note{margin:0 0 10px}.inv15-readonly #inv15-detail-list{max-height:none}}
  `;
  document.head.appendChild(s);
}

function inventoryStatus(id){
  const cards=[...document.querySelectorAll('#inv15-list .inv15-card')];
  const card=cards.find(c=>[...c.querySelectorAll('[onclick]')].some(el=>(el.getAttribute('onclick')||'').includes(`inv15Open('${id}')`)||(el.getAttribute('onclick')||'').includes(`inv15Open(\"${id}\")`)));
  return (card?.querySelector('.pill')?.textContent||'').trim().toUpperCase();
}

function applyInventoryMode(closed){
  const modal=document.getElementById('inv15-work-modal');
  if(!modal)return;
  const work=modal.querySelector('.inv15-work');
  const scanPane=work?.firstElementChild;
  if(scanPane)scanPane.classList.add('inv15-scan-pane');
  modal.classList.toggle('inv15-readonly',!!closed);
  let note=modal.querySelector('.inv15-readonly-note');
  if(closed){
    if(!note){
      note=document.createElement('div');
      note.className='inv15-readonly-note';
      note.innerHTML='<span class="dot"></span><div><b>Inventário encerrado</b><div>Modo consulta: câmera e leitura de códigos ficam desativadas.</div></div>';
      work?.insertAdjacentElement('beforebegin',note);
    }
  }else note?.remove();
}

function patchInventory(){
  if(typeof window.inv15Open!=='function'||window.inv15Open.__v25patched)return false;
  const original=window.inv15Open;
  const wrapped=async function(id){
    const closed=inventoryStatus(id)==='ENCERRADO';
    const result=await original.apply(this,arguments);
    applyInventoryMode(closed);
    return result;
  };
  wrapped.__v25patched=true;
  window.inv15Open=wrapped;
  return true;
}

function install(){
  forceLight();
  addCss();
  window.toggleTheme=forceLight;
  let tries=0;
  const t=setInterval(()=>{
    forceLight();
    if(patchInventory()||++tries>25)clearInterval(t);
  },250);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();