(()=>{
'use strict';
const SIX=/^\d{6}$/;
let stream=null,raf=0,video=null,canvas=null,ctx=null,engineReady=null;
let cameraState='idle',startPromise=null,stopPromise=null,seq=0,lockedCode='';
let processingCode='',missCode='',missUntil=0;

function loadJsQR(){
 if(window.jsQR)return Promise.resolve(true);
 if(engineReady)return engineReady;
 engineReady=new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';s.async=true;
  s.onload=()=>resolve(true);s.onerror=()=>reject(new Error('Não foi possível carregar o leitor QR.'));
  document.head.appendChild(s);
 });
 return engineReady;
}
function state(text,ok=true){
 const box=document.querySelector('#p-scanner .scanner-box');if(!box)return;
 let el=box.querySelector('.pm-fast-state');
 if(!el){el=document.createElement('div');el.className='pm-fast-state';const help=box.querySelector('.scan-help');(help||box).insertAdjacentElement('afterend',el)}
 el.classList.toggle('off',!ok);el.innerHTML=`<i></i><span>${text}</span>`;
}
function renderResultLocal(x){
 const out=document.getElementById('scan-result');if(!out)return;
 out.classList.add('show');
 const moneyFn=window.money||((v)=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}));
 const escFn=window.esc||((v)=>String(v??''));
 out.innerHTML=`<div class="asset-head"><div class="asset-photo">🏷️</div><div><div class="asset-code">${escFn(x.codigo_patrimonio)}</div><div class="asset-title">${escFn(x.descricao)}</div><div class="muted">${escFn(x.unidade_nome||'')} · ${escFn(x.local_nome||'Sem local definido')}</div></div><button class="btn primary" onclick="openDetail('${x.id}')">Abrir ficha</button></div><div class="detail-grid"><div class="kv"><span>Responsável</span><b>${escFn(x.responsavel||'—')}</b></div><div class="kv"><span>Situação</span><b>${escFn(x.situacao||'—')}</b></div><div class="kv"><span>Valor atual</span><b>${moneyFn(x.depreciacao?.valor_atual)}</b></div></div>`;
}
async function onCode(code){
 code=String(code||'').trim();
 const now=Date.now();
 if(!SIX.test(code)||lockedCode||processingCode)return;
 if(code===missCode&&now<missUntil)return;
 processingCode=code;
 const input=document.getElementById('scan-code');if(input)input.value=code;
 try{
  const local=(window.items||[]).find(x=>String(x.codigo_patrimonio)===code);
  let found=local;
  if(!found&&window.post){const r=await window.post({action:'scan',codigo:code});found=r.data}
  if(!found)throw new Error('Patrimônio não encontrado.');
  lockedCode=code;missCode='';missUntil=0;
  renderResultLocal(found);
  if(navigator.vibrate)navigator.vibrate(45);
  state(`QR ${code} lido · limpe para nova leitura`,true);
 }catch(e){
  const msg=String(e?.message||e||'Falha na consulta.');
  const missing=/não.*(localiz|cadastr|encontr)|nao.*(localiz|cadastr|encontr)|not found|404/i.test(msg);
  missCode=code;missUntil=Date.now()+4000;
  const out=document.getElementById('scan-result');
  if(out){
   out.classList.add('show');
   out.innerHTML=missing?`<div class="empty">Código ${code} sem cadastro na base.<br><span class="muted">O leitor continua ativo para o próximo QR.</span></div>`:`<div class="empty">${window.esc?esc(msg):msg}</div>`;
  }
  if(missing){
   document.dispatchEvent(new CustomEvent('pm:scan-missing',{detail:{code,message:msg}}));
   state(`QR ${code} sem cadastro · procurando outro...`,false);
  }else{
   document.dispatchEvent(new CustomEvent('pm:scan-error',{detail:{code,message:msg}}));
   state('Falha na consulta · leitor continua ativo',false);
  }
  setTimeout(()=>{if(!lockedCode&&cameraState==='running')state('Leitor pronto · aponte para outro QR',true)},900);
 }finally{
  processingCode='';
 }
}
function scanFrame(){
 if(cameraState!=='running')return;
 if(!video||video.readyState<2||!ctx||!window.jsQR){raf=requestAnimationFrame(scanFrame);return}
 const vw=video.videoWidth,vh=video.videoHeight;
 if(vw&&vh){
  const maxW=960,scale=Math.min(1,maxW/vw),w=Math.max(1,Math.floor(vw*scale)),h=Math.max(1,Math.floor(vh*scale));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  ctx.drawImage(video,0,0,w,h);
  try{const img=ctx.getImageData(0,0,w,h),qr=window.jsQR(img.data,w,h,{inversionAttempts:'attemptBoth'});if(qr)onCode(String(qr.data||'').trim())}catch(e){}
 }
 raf=requestAnimationFrame(scanFrame);
}
async function stop(){
 if(stopPromise)return stopPromise;
 stopPromise=(async()=>{
  seq++;cameraState='stopping';processingCode='';
  if(startPromise){try{await startPromise}catch(e){}}
  if(raf){cancelAnimationFrame(raf);raf=0}
  const s=stream;stream=null;
  if(s&&typeof s.getTracks==='function'){try{s.getTracks().forEach(t=>t.stop())}catch(e){}}
  if(video){try{video.pause()}catch(e){}try{video.srcObject=null}catch(e){}try{video.remove()}catch(e){}video=null}
  canvas=null;ctx=null;cameraState='idle';
  const host=document.getElementById('qr-reader');if(host)host.innerHTML='<div class="muted">Câmera parada</div>';
  state('Câmera parada',false);
 })().finally(()=>{stopPromise=null});
 return stopPromise;
}
async function tuneTrack(track){
 if(!track)return;
 try{track.contentHint='detail'}catch(e){}
 try{
  const caps=track.getCapabilities?.()||{},settings=track.getSettings?.()||{},a={};
  if(Array.isArray(caps.focusMode)&&caps.focusMode.includes('continuous'))a.focusMode='continuous';
  if(Array.isArray(caps.exposureMode)&&caps.exposureMode.includes('continuous'))a.exposureMode='continuous';
  if(Array.isArray(caps.whiteBalanceMode)&&caps.whiteBalanceMode.includes('continuous'))a.whiteBalanceMode='continuous';
  if(caps.zoom&&Number.isFinite(caps.zoom.min)&&Number.isFinite(caps.zoom.max)){const target=Math.min(caps.zoom.max,Math.max(caps.zoom.min,1.18));if(target>Number(settings.zoom||caps.zoom.min))a.zoom=target}
  if(Object.keys(a).length)await track.applyConstraints({advanced:[a]});
 }catch(e){}
}
async function start(){
 if(cameraState==='running'&&stream)return;
 if(startPromise)return startPromise;
 startPromise=(async()=>{
  if(stopPromise){try{await stopPromise}catch(e){}}
  const host=document.getElementById('qr-reader');if(!host)return;
  cameraState='starting';const mySeq=++seq;
  let localStream=null,localVideo=null;
  try{
   await loadJsQR();if(mySeq!==seq)return;
   host.innerHTML='';
   localVideo=document.createElement('video');localVideo.setAttribute('playsinline','');localVideo.setAttribute('muted','');localVideo.autoplay=true;localVideo.muted=true;localVideo.style.cssText='width:100%;height:100%;object-fit:cover;display:block';host.appendChild(localVideo);
   localStream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30,max:60}}});
   if(mySeq!==seq){try{localStream.getTracks().forEach(t=>t.stop())}catch(e){}return}
   stream=localStream;video=localVideo;video.srcObject=localStream;await video.play();
   if(mySeq!==seq||stream!==localStream){try{localStream.getTracks().forEach(t=>t.stop())}catch(e){}return}
   await tuneTrack(localStream.getVideoTracks?.()[0]);
   canvas=document.createElement('canvas');ctx=canvas.getContext('2d',{willReadFrequently:true});cameraState='running';
   state(lockedCode?`QR ${lockedCode} aguardando limpeza`:'Leitor pronto · aponte para o QR',true);scanFrame();
  }catch(e){
   if(localStream&&localStream!==stream){try{localStream.getTracks().forEach(t=>t.stop())}catch(_) {}}
   if(mySeq!==seq)return;
   stream=null;cameraState='idle';
   const msg=String(e?.message||e||'');if(/abort|interrupted|cancel|transition/i.test(msg))return;
   state('Não foi possível iniciar a câmera',false);if(typeof toast==='function')toast(msg||'Não foi possível iniciar a câmera.','err');
  }
 })().finally(()=>{startPromise=null});
 return startPromise;
}
window.pmScannerReset=function(){lockedCode='';processingCode='';missCode='';missUntil=0;const out=document.getElementById('scan-result');if(out){out.classList.remove('show');out.innerHTML=''}const input=document.getElementById('scan-code');if(input)input.value='';state('Leitor pronto · aponte para o próximo QR',true);if(cameraState!=='running')start()};
window.pmScannerGetLockedCode=()=>lockedCode;
function active(){return document.getElementById('p-scanner')?.classList.contains('active')}
function install(){
 window.startScanner=start;window.stopScanner=stop;
 window.scanManual=function(){const i=document.getElementById('scan-code');const c=String(i?.value||'').replace(/\D/g,'').slice(0,6);if(!SIX.test(c)){if(typeof toast==='function')toast('Use exatamente 6 dígitos.','err');return}onCode(c)};
 document.querySelectorAll('[data-page="scanner"]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{if(active())start()},80)));
 const p=document.getElementById('p-scanner');if(p)new MutationObserver(()=>{if(active())setTimeout(start,80);else stop()}).observe(p,{attributes:true,attributeFilter:['class']});
 if(active())setTimeout(start,100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,850));else setTimeout(install,850);
})();