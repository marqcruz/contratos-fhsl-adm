(()=>{
'use strict';

const QR_RE=/^\d{6}$/;
let pmQrReader=null, pmQrBusy=false;

function injectCss(){
 if(document.getElementById('pat-polish-v6'))return;
 const s=document.createElement('style');s.id='pat-polish-v6';s.textContent=`
:root{--pm-bg:#f6f8fb;--pm-surface:#ffffff;--pm-surface2:#f8fafc;--pm-border:#e5eaf0;--pm-text:#172033;--pm-muted:#718096;--pm-accent:#2367d1;--pm-accent2:#2f7ae5;--pm-success:#16885b;--pm-warn:#b7791f;--pm-danger:#c43d4b;--pm-shadow:0 8px 24px rgba(20,35,55,.055)}
body{background:var(--pm-bg)!important;color:var(--pm-text)!important;font-size:13px!important}
body:not([data-theme="dark"]){color-scheme:light}
body[data-theme="dark"]{--pm-bg:#0d1218;--pm-surface:#121922;--pm-surface2:#18212c;--pm-border:#26313d;--pm-text:#edf2f7;--pm-muted:#8b99aa;--pm-shadow:0 10px 28px rgba(0,0,0,.18)}
.app{background:var(--pm-bg)!important}
.side{width:224px!important;padding:16px 12px!important;background:var(--pm-surface)!important;border-right:1px solid var(--pm-border)!important;box-shadow:none!important}
.main{margin-left:224px!important;width:calc(100% - 224px)!important;max-width:1540px!important;padding:24px 28px 38px!important}
.brand{padding:2px 6px 14px!important;margin-bottom:12px!important;border-bottom:1px solid var(--pm-border)!important}
.brand .ico{width:36px!important;height:36px!important;border-radius:10px!important;background:#edf4ff!important;color:var(--pm-accent)!important;box-shadow:none!important}
body[data-theme="dark"] .brand .ico{background:#17263b!important}
.brand b{font-size:14px!important;letter-spacing:-.2px}.brand span{font-size:9px!important;color:var(--pm-muted)!important}
.nav{gap:2px!important}.nav button{min-height:38px!important;padding:8px 10px!important;border-radius:8px!important;color:var(--pm-muted)!important;font-size:12px!important;font-weight:650!important;transition:background .12s,color .12s!important}
.nav button:hover{background:var(--pm-surface2)!important;color:var(--pm-text)!important}.nav button.active{background:#edf4ff!important;color:var(--pm-accent)!important;box-shadow:none!important}
body[data-theme="dark"] .nav button.active{background:#17263b!important}.nav button .pm-ico{width:19px!important;height:19px!important;flex-basis:19px!important}.nav button .pm-ico svg{width:18px!important;height:18px!important}
.top,.pm-health-section-title{padding:0!important;margin-bottom:18px!important}.top h1,.pm-health-section-title h1{font-size:23px!important;letter-spacing:-.55px!important;font-weight:780!important}.top p,.pm-health-section-title p{font-size:11.5px!important;color:var(--pm-muted)!important;margin-top:4px!important}
.btn{min-height:36px!important;border-radius:8px!important;padding:7px 11px!important;border:1px solid var(--pm-border)!important;background:var(--pm-surface)!important;color:var(--pm-text)!important;font-weight:650!important;box-shadow:none!important}.btn:hover{background:var(--pm-surface2)!important}.btn.primary{background:var(--pm-accent)!important;border-color:var(--pm-accent)!important;color:#fff!important;box-shadow:none!important}
.grid4,.pm-health-kpis{gap:9px!important}.card,.pm-hk,.pm-health-card{background:var(--pm-surface)!important;border:1px solid var(--pm-border)!important;border-radius:11px!important;box-shadow:var(--pm-shadow)!important}.stat,.pm-hk{min-height:91px!important;padding:13px 14px!important}.stat:before,.pm-hk:after{display:none!important}.stat .num,.pm-hk b{font-size:21px!important;letter-spacing:-.45px!important;font-weight:760!important}.stat .lbl,.pm-hk span{font-size:9px!important;line-height:1.3!important;color:var(--pm-muted)!important;text-transform:none!important;letter-spacing:0!important;margin-top:6px!important}
.section{margin-top:17px!important}.section-head{margin-bottom:8px!important}.section-head h2{font-size:13px!important;font-weight:720!important;color:var(--pm-text)!important}
.toolbar,.pm-health-toolbar{gap:7px!important;margin-bottom:9px!important}.toolbar input,.toolbar select,.pm-health-toolbar input,.pm-health-toolbar select,input,select,textarea{border-radius:8px!important;border:1px solid var(--pm-border)!important;background:var(--pm-surface)!important;color:var(--pm-text)!important;min-height:36px!important;padding:8px 10px!important;box-shadow:none!important}.toolbar input:focus,.toolbar select:focus,input:focus,select:focus,textarea:focus{border-color:#8db6ef!important;box-shadow:0 0 0 3px rgba(35,103,209,.08)!important}
.table,.pm-health-table{border:1px solid var(--pm-border)!important;border-radius:10px!important;background:var(--pm-surface)!important;box-shadow:none!important}.table th,.pm-health-table th{background:#f8fafc!important;color:#7b8798!important;border-color:var(--pm-border)!important;padding:9px 10px!important;font-size:8.5px!important;letter-spacing:.035em!important}.table td,.pm-health-table td{border-color:#edf0f4!important;padding:9px 10px!important;font-size:10.5px!important}.table tbody tr:hover,.pm-health-table tbody tr:hover{background:#fafcff!important}body[data-theme="dark"] .table th,body[data-theme="dark"] .pm-health-table th{background:var(--pm-surface2)!important}body[data-theme="dark"] .table td,body[data-theme="dark"] .pm-health-table td{border-color:var(--pm-border)!important}body[data-theme="dark"] .table tbody tr:hover,body[data-theme="dark"] .pm-health-table tbody tr:hover{background:var(--pm-surface2)!important}
.code{font-size:11px!important;font-weight:750!important;color:var(--pm-accent)!important}.pill{padding:3px 7px!important;font-size:8.5px!important;font-weight:700!important;border-radius:999px!important}.link{color:var(--pm-accent)!important}
.pm-health-mark{background:#edf4ff!important;border-color:#dbe9ff!important;color:var(--pm-accent)!important;font-size:9px!important;padding:3px 7px!important}body[data-theme="dark"] .pm-health-mark{background:#17263b!important;border-color:#243a58!important}
.pm-health-grid{gap:10px!important}.pm-health-card{padding:13px!important}.pm-health-card h3{font-size:12px!important;font-weight:720!important}.pm-bar-row{grid-template-columns:145px 1fr 58px!important;font-size:10px!important;margin:7px 0!important}.pm-bar-track{height:5px!important;background:#edf1f5!important}body[data-theme="dark"] .pm-bar-track{background:#24303d!important}.pm-bar-track i{background:var(--pm-accent)!important}
.modal-bg{background:rgba(12,18,28,.55)!important;backdrop-filter:blur(5px)!important}.modal{background:var(--pm-surface)!important;border:1px solid var(--pm-border)!important;border-radius:14px!important;box-shadow:0 24px 70px rgba(15,25,40,.22)!important}.modal-h{padding:13px 15px!important;background:var(--pm-surface)!important;border-color:var(--pm-border)!important}.modal-h b{font-size:14px!important}.modal-b{padding:15px!important}.modal-f{padding:11px 15px!important;border-color:var(--pm-border)!important;background:var(--pm-surface)!important}.form-grid,.pm-health-form{gap:10px!important}.fg label,.pm-health-form label{font-size:8.5px!important;color:var(--pm-muted)!important;letter-spacing:.025em!important}.kv{background:var(--pm-surface2)!important;border:1px solid var(--pm-border)!important;border-radius:8px!important;padding:9px!important}.kv span{font-size:8px!important}.kv b{font-size:11px!important}.asset-code{font-size:19px!important;color:var(--pm-accent)!important}.asset-title{font-size:15px!important}.asset-photo,.photo{border-radius:9px!important;border-color:var(--pm-border)!important}
.scan-frame,.pm-inv-camera{background:#080b10!important;border:1px solid #202b38!important;border-radius:13px!important;box-shadow:none!important}.scan-frame:after{border:2px solid #ffffff!important;box-shadow:0 0 0 9999px rgba(0,0,0,.15)!important}.scan-help,.pm-inv-note{font-size:10px!important;color:var(--pm-muted)!important}.scan-manual input,#is-code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace!important;font-weight:750!important;letter-spacing:.14em!important}
.pm-qr-rule{margin-top:8px;padding:8px 10px;border-radius:8px;background:#edf4ff;color:#45617f;font-size:10px;border:1px solid #dbe9ff}body[data-theme="dark"] .pm-qr-rule{background:#17263b;border-color:#243a58;color:#9eb4ce}.pm-qr-invalid{border-color:#d85b67!important;box-shadow:0 0 0 3px rgba(196,61,75,.08)!important}
@media(max-width:1050px){.main{padding:20px!important}.grid4,.pm-health-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:760px){body{background:var(--pm-bg)!important}.main{margin:0!important;width:100%!important;padding:calc(64px + env(safe-area-inset-top)) 11px calc(82px + env(safe-area-inset-bottom))!important}.pm-appbar{height:calc(54px + env(safe-area-inset-top))!important;padding-left:11px!important;padding-right:11px!important}.pm-appbar-brand{width:32px!important;height:32px!important;border-radius:9px!important}.pm-appbar-title{font-size:15px!important}.pm-bottom{height:calc(64px + env(safe-area-inset-bottom))!important}.pm-bottom button{height:51px!important;font-size:9px!important}.pm-bottom .pm-scan{height:58px!important}.pm-bottom .pm-scan .pm-scan-orb{width:44px!important;height:44px!important;border-radius:14px!important}.grid4,.pm-health-kpis{gap:7px!important}.stat,.pm-hk{min-height:82px!important;padding:11px!important;border-radius:10px!important}.stat .num,.pm-hk b{font-size:18px!important}.card,.pm-health-card{border-radius:10px!important;box-shadow:none!important}.toolbar,.pm-health-toolbar{gap:6px!important}.toolbar input,.pm-health-toolbar input{min-height:42px!important}.toolbar select,.pm-health-toolbar select{min-height:40px!important}.table,.pm-health-table{border:0!important;background:transparent!important}.scan-frame,.pm-inv-camera{border-radius:11px!important}.modal{border-radius:15px 15px 0 0!important}.pm-health-section-title h1{font-size:19px!important}}
`;
 document.head.appendChild(s);
}

function findAssetCodeInput(){
 const modal=document.querySelector('.modal-bg.open')||document;
 const labels=[...modal.querySelectorAll('label')];
 for(const l of labels){
  const t=(l.textContent||'').toLowerCase();
  if(t.includes('código')&&t.includes('patrim')){
   const fg=l.closest('.fg,div');
   const inp=fg?.querySelector('input'); if(inp)return inp;
  }
 }
 return document.querySelector('#codigo_patrimonio,#codigo-patrimonio,#asset-code,#a-code,[name="codigo_patrimonio"]');
}
function clean6(v){return String(v||'').replace(/\D/g,'').slice(0,6)}
function enforceInput(inp){
 if(!inp||inp.dataset.qr6==='1')return;
 inp.dataset.qr6='1';inp.setAttribute('inputmode','numeric');inp.setAttribute('pattern','[0-9]{6}');inp.setAttribute('maxlength','6');inp.setAttribute('minlength','6');
 inp.addEventListener('input',()=>{inp.value=clean6(inp.value);inp.classList.toggle('pm-qr-invalid',inp.value.length>0&&!QR_RE.test(inp.value))});
}
function decorateQr(){
 const scan=document.getElementById('scan-code'); if(scan){enforceInput(scan);scan.placeholder='999999';}
 const inv=document.getElementById('is-code'); if(inv){enforceInput(inv);inv.placeholder='999999';}
 const asset=findAssetCodeInput(); if(asset)enforceInput(asset);
 const box=document.querySelector('#p-scanner .scanner-box');
 if(box&&!box.querySelector('.pm-qr-rule')){const d=document.createElement('div');d.className='pm-qr-rule';d.textContent='Padrão de leitura: QR Code contendo somente o número patrimonial com 6 dígitos. Exemplo: 999999.';const help=box.querySelector('.scan-help');help?.insertAdjacentElement('afterend',d)}
 const ib=document.querySelector('#pm-inv-reader .pm-inv-note');if(ib&&!document.querySelector('#pm-inv-reader .pm-qr-rule')){const d=document.createElement('div');d.className='pm-qr-rule';d.textContent='O QR Code deve conter exclusivamente 6 dígitos numéricos, sem texto, URL ou prefixo.';ib.insertAdjacentElement('afterend',d)}
}
function notifyInvalid(){if(typeof toast==='function')toast('QR/código inválido. Use exatamente 6 dígitos numéricos, por exemplo 999999.','err');}
function validateVisibleAsset(){const inp=findAssetCodeInput();if(!inp)return true;enforceInput(inp);const ok=QR_RE.test(inp.value);inp.classList.toggle('pm-qr-invalid',!ok);if(!ok){notifyInvalid();inp.focus()}return ok}

function installClickGuard(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const txt=(b.textContent||'').trim().toLowerCase();
  const modal=b.closest('.modal-bg');
  if(modal?.classList.contains('open')&&txt.includes('salvar')){
   const code=findAssetCodeInput();
   if(code&&modal.contains(code)&&!QR_RE.test(code.value)){e.preventDefault();e.stopImmediatePropagation();code.classList.add('pm-qr-invalid');notifyInvalid();code.focus()}
  }
 },true);
}

function installManualOverrides(){
 const oldScan=window.scanManual;
 window.scanManual=function(){const i=document.getElementById('scan-code');if(!i||!QR_RE.test(i.value)){notifyInvalid();i?.focus();return}return oldScan?.apply(this,arguments)};
 const oldInv=window.inventoryScan;
 if(oldInv)window.inventoryScan=function(){const i=document.getElementById('is-code');if(!i||!QR_RE.test(i.value)){notifyInvalid();i?.focus();return}return oldInv.apply(this,arguments)};
}

async function stopScanner6(){
 if(pmQrReader){try{await pmQrReader.stop()}catch(e){}try{await pmQrReader.clear()}catch(e){}pmQrReader=null}
 const r=document.getElementById('qr-reader');if(r)r.innerHTML='<div class="muted">Câmera ainda não iniciada</div>';
}
async function startScanner6(){
 const host=document.getElementById('qr-reader');if(!host)return;
 if(typeof Html5Qrcode==='undefined'){if(typeof toast==='function')toast('Leitor de QR Code indisponível.','err');return}
 await stopScanner6();host.innerHTML='';
 try{
  pmQrReader=new Html5Qrcode('qr-reader');
  const cams=await Html5Qrcode.getCameras();if(!cams.length)throw new Error('Nenhuma câmera encontrada.');
  const cam=cams.find(x=>/back|traseira|environment/i.test(x.label))||cams[0];
  await pmQrReader.start(cam.id,{fps:12,qrbox:{width:230,height:230},aspectRatio:1.0},async raw=>{
   if(pmQrBusy)return;
   const code=String(raw||'').trim();
   if(!QR_RE.test(code))return;
   pmQrBusy=true;
   const inp=document.getElementById('scan-code');if(inp)inp.value=code;
   try{if(navigator.vibrate)navigator.vibrate(80);window.scanManual?.()}finally{setTimeout(()=>pmQrBusy=false,900)}
  });
 }catch(e){pmQrReader=null;host.innerHTML='<div class="muted">Não foi possível iniciar a câmera</div>';if(typeof toast==='function')toast(e.message||String(e),'err')}
}

function overrideScanner(){window.startScanner=startScanner6;window.stopScanner=stopScanner6}

function improveCopy(){
 const h=document.querySelector('#p-bens .top h1');if(h)h.textContent='Bens e equipamentos';
 const p=document.querySelector('#p-bens .top p');if(p)p.textContent='Localização, responsável, situação, valor, criticidade e histórico de cada ativo.';
 const sh=document.querySelector('#p-scanner .top h1');if(sh)sh.textContent='Localizar por QR Code';
 const sp=document.querySelector('#p-scanner .top p');if(sp)sp.textContent='Leia a etiqueta patrimonial de 6 dígitos para abrir o bem imediatamente.';
}

function init(){injectCss();decorateQr();installClickGuard();installManualOverrides();overrideScanner();improveCopy();
 const mo=new MutationObserver(()=>decorateQr());mo.observe(document.body,{childList:true,subtree:true});
 setInterval(decorateQr,1800);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,900));else setTimeout(init,900);
})();