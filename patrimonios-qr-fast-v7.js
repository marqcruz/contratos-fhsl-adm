(()=>{
'use strict';
const SIX=/^\d{6}$/;
let reader=null,busy=false,last='';

function css(){if(document.getElementById('pat-qr-fast-v7'))return;const s=document.createElement('style');s.id='pat-qr-fast-v7';s.textContent=`
#p-scanner .scanner-box{max-width:860px!important}.scan-frame{min-height:430px!important;position:relative!important}.scan-frame:after{left:12%!important;right:12%!important;top:18%!important;bottom:18%!important;border-radius:16px!important}.pm-fast-state{display:flex;align-items:center;justify-content:center;gap:7px;margin:8px 0 0;font-size:10px;color:var(--pm-muted)}.pm-fast-state i{width:7px;height:7px;border-radius:99px;background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.10)}.pm-fast-state.off i{background:#94a3b8;box-shadow:none}.pm-fast-hint{font-size:11px!important}.scan-manual input,#is-code{font-size:20px!important;text-align:center!important;letter-spacing:.18em!important}.scan-manual input::placeholder,#is-code::placeholder{letter-spacing:.18em!important}.pm-scan-auto{display:none!important}@media(max-width:760px){#p-scanner .scanner-box{max-width:none!important}.scan-frame{min-height:calc(100dvh - 245px)!important;max-height:560px!important}.scan-frame:after{left:8%!important;right:8%!important;top:16%!important;bottom:16%!important}.scanner-box>.actions{display:none!important}.pm-fast-state{font-size:11px!important}.scan-manual{margin-top:10px!important}}
`;
document.head.appendChild(s)}

function tuneLibrary(){
 if(typeof window.Html5Qrcode==='undefined'||window.Html5Qrcode.__tdngoFast)return;
 const Original=window.Html5Qrcode;
 const start=Original.prototype.start;
 Original.prototype.start=async function(cam,config,ok,err){
   const cfg={...(config||{})};
   cfg.fps=Math.max(24,Number(cfg.fps||0));
   cfg.disableFlip=false;
   cfg.qrbox=(vw,vh)=>{const m=Math.min(vw,vh);const side=Math.max(220,Math.floor(m*.74));return{width:side,height:side}};
   const wrapped=(raw,res)=>{const value=String(raw||'').trim();if(!SIX.test(value))return;ok&&ok(value,res)};
   const out=await start.call(this,cam,cfg,wrapped,err);
   try{if(this.applyVideoConstraints)await this.applyVideoConstraints({advanced:[{focusMode:'continuous'}]})}catch(e){}
   return out;
 };
 Original.__tdngoFast=true;
}

function state(on,text){const box=document.querySelector('#p-scanner .scanner-box');if(!box)return;let el=box.querySelector('.pm-fast-state');if(!el){el=document.createElement('div');el.className='pm-fast-state';const help=box.querySelector('.scan-help');(help||box).insertAdjacentElement('afterend',el)}el.classList.toggle('off',!on);el.innerHTML=`<i></i><span>${text|| (on?'Leitor rápido ativo · aponte para o QR de 6 dígitos':'Câmera parada')}</span>`}
async function stop(){if(reader){try{await reader.stop()}catch(e){}try{await reader.clear()}catch(e){}reader=null}state(false,'Câmera parada')}
async function lookup(code){const input=document.getElementById('scan-code');if(input)input.value=code;if(navigator.vibrate)navigator.vibrate(55);try{window.scanManual&&window.scanManual()}catch(e){}}
async function startFast(){
 const host=document.getElementById('qr-reader');if(!host||reader)return;
 if(typeof Html5Qrcode==='undefined'){state(false,'Leitor indisponível');return}
 try{
   host.innerHTML='';
   reader=new Html5Qrcode('qr-reader');
   let camera={facingMode:'environment'};
   try{const cams=await Html5Qrcode.getCameras();const back=cams.find(x=>/back|traseira|rear|environment/i.test(x.label));if(back)camera=back.id;else if(cams[0])camera=cams[0].id}catch(e){}
   state(true);
   await reader.start(camera,{fps:30,qrbox:(w,h)=>{const m=Math.min(w,h);const q=Math.max(230,Math.floor(m*.78));return{width:q,height:q}},disableFlip:false},async raw=>{
     const code=String(raw||'').trim();
     if(!SIX.test(code)||busy)return;
     const now=Date.now();if(last===code&&now-(window.__pmLastQrAt||0)<650)return;
     busy=true;last=code;window.__pmLastQrAt=now;
     await lookup(code);
     setTimeout(()=>busy=false,220);
   },()=>{});
   try{if(reader.applyVideoConstraints)await reader.applyVideoConstraints({advanced:[{focusMode:'continuous'}]})}catch(e){}
 }catch(e){reader=null;state(false,'Não foi possível iniciar a câmera');if(typeof toast==='function')toast(e.message||String(e),'err')}
}
function autoStart(){const p=document.getElementById('p-scanner');if(p?.classList.contains('active'))setTimeout(startFast,60);else if(reader)stop()}
function install(){
 css();tuneLibrary();
 window.startScanner=startFast;window.stopScanner=stop;
 const input=document.getElementById('scan-code');if(input){input.inputMode='numeric';input.maxLength=6;input.placeholder='999999';input.addEventListener('input',()=>input.value=input.value.replace(/\D/g,'').slice(0,6))}
 document.querySelectorAll('[data-page="scanner"]').forEach(b=>b.addEventListener('click',()=>setTimeout(startFast,80)));
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const t=(b.textContent||'').trim().toLowerCase();if(t==='escanear'||t.includes('scan')){setTimeout(autoStart,100)}});
 const p=document.getElementById('p-scanner');if(p)new MutationObserver(autoStart).observe(p,{attributes:true,attributeFilter:['class']});
 const inv=document.getElementById('invscan-modal');if(inv)new MutationObserver(()=>{if(inv.classList.contains('open'))setTimeout(tuneLibrary,0)}).observe(inv,{attributes:true,attributeFilter:['class']});
 autoStart();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,700));else setTimeout(install,700);
})();