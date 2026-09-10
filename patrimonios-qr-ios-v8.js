(()=>{
'use strict';
const SIX=/^\d{6}$/;
let stream=null,raf=0,video=null,canvas=null,ctx=null,busy=false,lastCode='',lastAt=0,engineReady=null,startSeq=0;

function loadJsQR(){
 if(window.jsQR)return Promise.resolve(true);
 if(engineReady)return engineReady;
 engineReady=new Promise((resolve,reject)=>{
  const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
  s.async=true;s.onload=()=>resolve(true);s.onerror=()=>reject(new Error('Não foi possível carregar o leitor QR.'));
  document.head.appendChild(s);
 });
 return engineReady;
}
function state(text,ok=true){
 const box=document.querySelector('#p-scanner .scanner-box');if(!box)return;
 let el=box.querySelector('.pm-fast-state');if(!el){el=document.createElement('div');el.className='pm-fast-state';const help=box.querySelector('.scan-help');(help||box).insertAdjacentElement('afterend',el)}
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
 const now=Date.now();if(!SIX.test(code)||busy||(code===lastCode&&now-lastAt<900))return;
 busy=true;lastCode=code;lastAt=now;
 const input=document.getElementById('scan-code');if(input)input.value=code;
 try{
  const local=(window.items||[]).find(x=>String(x.codigo_patrimonio)===code);
  if(local)renderResultLocal(local);
  else if(window.post){const r=await window.post({action:'scan',codigo:code});renderResultLocal(r.data)}
  if(navigator.vibrate)navigator.vibrate(45);
  state(`QR ${code} lido`,true);
 }catch(e){
  const out=document.getElementById('scan-result');if(out){out.classList.add('show');out.innerHTML=`<div class="empty">${window.esc?esc(e.message):e.message}</div>`}
 }finally{setTimeout(()=>busy=false,90)}
}
function scanFrame(){
 if(!video||video.readyState<2||!ctx||!window.jsQR){raf=requestAnimationFrame(scanFrame);return}
 const vw=video.videoWidth,vh=video.videoHeight;
 if(vw&&vh){
  const maxW=960,scale=Math.min(1,maxW/vw),w=Math.max(1,Math.floor(vw*scale)),h=Math.max(1,Math.floor(vh*scale));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  ctx.drawImage(video,0,0,w,h);
  try{
   const img=ctx.getImageData(0,0,w,h);
   const qr=window.jsQR(img.data,w,h,{inversionAttempts:'attemptBoth'});
   if(qr&&SIX.test(String(qr.data||'').trim()))onCode(String(qr.data).trim());
  }catch(e){}
 }
 raf=requestAnimationFrame(scanFrame);
}
async function stop(){
 startSeq++;
 if(raf){cancelAnimationFrame(raf);raf=0}
 const s=stream;stream=null;
 if(s&&typeof s.getTracks==='function'){try{s.getTracks().forEach(t=>t.stop())}catch(e){}}
 if(video){try{video.srcObject=null}catch(e){}try{video.remove()}catch(e){}video=null}
 canvas=null;ctx=null;
 const host=document.getElementById('qr-reader');if(host)host.innerHTML='<div class="muted">Câmera parada</div>';
 state('Câmera parada',false);
}
async function start(){
 const host=document.getElementById('qr-reader');if(!host||stream)return;
 const seq=++startSeq;
 let localStream=null,localVideo=null;
 try{
  await loadJsQR();
  if(seq!==startSeq)return;
  host.innerHTML='';
  localVideo=document.createElement('video');localVideo.setAttribute('playsinline','');localVideo.setAttribute('muted','');localVideo.autoplay=true;localVideo.muted=true;localVideo.style.cssText='width:100%;height:100%;object-fit:cover;display:block';host.appendChild(localVideo);
  const constraints={audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30,max:60}}};
  localStream=await navigator.mediaDevices.getUserMedia(constraints);
  if(seq!==startSeq){try{localStream.getTracks().forEach(t=>t.stop())}catch(e){}return}
  stream=localStream;video=localVideo;video.srcObject=localStream;await video.play();
  if(seq!==startSeq||stream!==localStream){try{localStream.getTracks().forEach(t=>t.stop())}catch(e){}return}
  try{const track=localStream.getVideoTracks?.()[0];if(track){const caps=track.getCapabilities?.()||{};const adv={};if(Array.isArray(caps.focusMode)&&caps.focusMode.includes('continuous'))adv.focusMode='continuous';if(caps.exposureMode&&caps.exposureMode.includes?.('continuous'))adv.exposureMode='continuous';if(Object.keys(adv).length)await track.applyConstraints({advanced:[adv]})}}catch(e){}
  if(seq!==startSeq||stream!==localStream)return;
  canvas=document.createElement('canvas');ctx=canvas.getContext('2d',{willReadFrequently:true});
  state('Leitor rápido ativo · aproxime o QR da área central',true);
  scanFrame();
 }catch(e){
  if(localStream&&localStream!==stream){try{localStream.getTracks().forEach(t=>t.stop())}catch(_){}}
  if(seq!==startSeq)return;
  stream=null;
  const msg=String(e?.message||e||'');
  if(/abort|interrupted|cancel/i.test(msg))return;
  state('Falha ao iniciar a câmera',false);if(typeof toast==='function')toast(msg||'Não foi possível iniciar a câmera.','err');
 }
}
function active(){return document.getElementById('p-scanner')?.classList.contains('active')}
function install(){
 window.startScanner=start;window.stopScanner=stop;
 window.scanManual=function(){const i=document.getElementById('scan-code');const c=String(i?.value||'').replace(/\D/g,'').slice(0,6);if(!SIX.test(c)){if(typeof toast==='function')toast('Use exatamente 6 dígitos.','err');return}onCode(c)};
 document.querySelectorAll('[data-page="scanner"]').forEach(b=>b.addEventListener('click',()=>setTimeout(start,40)));
 const p=document.getElementById('p-scanner');if(p)new MutationObserver(()=>{if(active())setTimeout(start,40);else stop()}).observe(p,{attributes:true,attributeFilter:['class']});
 const nav=document.querySelector('.pm-bottom');if(nav)nav.addEventListener('click',()=>setTimeout(()=>{if(active())start()},50));
 if(active())setTimeout(start,60);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,850));else setTimeout(install,850);
})();