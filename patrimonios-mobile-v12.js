(()=>{
'use strict';
const SIX=/^\d{6}$/;
let focusTimer=0;

function addCss(){
 if(document.getElementById('pat-mobile-v12'))return;
 const s=document.createElement('style');s.id='pat-mobile-v12';s.textContent=`
 .pm-v12-clear{display:none;width:100%;min-height:50px;margin-top:10px;border:1px solid rgba(96,165,250,.34);border-radius:14px;background:rgba(37,99,235,.14);color:var(--pm-accent2,#78adff);font:800 12px system-ui;align-items:center;justify-content:center;gap:8px;cursor:pointer}.pm-v12-clear.show{display:flex}.pm-v12-clear svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
 .pm-v12-resultbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:-2px -2px 10px;padding:8px 9px;border-bottom:1px solid var(--pm-border,#26313d)}.pm-v12-resultbar span{font-size:10px;color:var(--pm-muted,#8b99aa);font-weight:700}.pm-v12-x{width:34px;height:34px;border-radius:10px;border:1px solid var(--pm-border,#26313d);background:var(--pm-surface2,#18212c);color:var(--pm-text,#edf2f7);display:grid;place-items:center;padding:0}.pm-v12-x svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2}
 .pm-focus-note{position:absolute;z-index:8;left:50%;bottom:12px;transform:translateX(-50%);padding:6px 9px;border-radius:999px;background:rgba(3,7,12,.64);color:#dce7f5;font-size:9px;backdrop-filter:blur(8px);pointer-events:none;white-space:nowrap;opacity:.85}
 @media(max-width:760px){html,body{height:100%;min-height:100dvh;overscroll-behavior:none}body{min-height:100dvh!important}.app{min-height:100dvh!important}.main{min-height:100dvh!important}.pm-v12-clear{position:sticky;bottom:calc(76px + env(safe-area-inset-bottom));z-index:30;box-shadow:0 10px 30px rgba(0,0,0,.28);background:color-mix(in srgb,var(--pm-accent,#2563eb) 18%,var(--pm-surface,#101720))}#p-scanner .scanner-box{min-height:calc(100dvh - 160px)}#p-scanner .scan-frame{height:calc(100dvh - 340px)!important;min-height:340px!important;max-height:none!important}.pm-appbar,.pm-bottom{touch-action:manipulation}}
 @media(display-mode:standalone){body{user-select:none;-webkit-user-select:none}.pm-appbar{padding-top:env(safe-area-inset-top)!important}.main{padding-top:calc(58px + env(safe-area-inset-top))!important}.pm-bottom{padding-bottom:env(safe-area-inset-bottom)!important}}
 `;document.head.appendChild(s);
}

function result(){return document.getElementById('scan-result')}
function clearButton(){
 const box=document.querySelector('#p-scanner .scanner-box');if(!box)return null;
 let b=box.querySelector('.pm-v12-clear');
 if(!b){b=document.createElement('button');b.type='button';b.className='pm-v12-clear';b.innerHTML='<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/></svg><span>Limpar leitura e ler outro patrimônio</span>';b.onclick=clearScan;const out=result();(out||box.lastElementChild)?.insertAdjacentElement('afterend',b)}
 return b;
}
function hasLocated(){const out=result();return !!(out&&out.classList.contains('show')&&SIX.test((out.querySelector('.asset-code')?.textContent||'').trim()))}
function decorateResult(){
 const out=result(),b=clearButton();if(!out||!b)return;
 const located=hasLocated();b.classList.toggle('show',located);
 if(located&&!out.querySelector('.pm-v12-resultbar')){const bar=document.createElement('div');bar.className='pm-v12-resultbar';bar.innerHTML='<span>Patrimônio localizado</span><button type="button" class="pm-v12-x" aria-label="Limpar leitura"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';bar.querySelector('button').onclick=clearScan;out.prepend(bar)}
}
function clearScan(){
 document.querySelectorAll('.pm-alert').forEach(x=>x.remove());
 const out=result();if(out){out.classList.remove('show');out.innerHTML=''}
 const input=document.getElementById('scan-code');if(input)input.value='';
 const b=clearButton();if(b)b.classList.remove('show');
 try{window.pmClearQrResult?.()}catch(e){}
 setTimeout(()=>{try{window.startScanner?.()}catch(e){};enhanceCamera()},100);
}
window.pmClearQrV12=clearScan;

async function tuneTrack(track){
 if(!track)return;
 try{track.contentHint='detail'}catch(e){}
 try{
  const caps=track.getCapabilities?.()||{},settings=track.getSettings?.()||{},advanced=[];
  const a={};
  if(Array.isArray(caps.focusMode)&&caps.focusMode.includes('continuous'))a.focusMode='continuous';
  if(Array.isArray(caps.exposureMode)&&caps.exposureMode.includes('continuous'))a.exposureMode='continuous';
  if(Array.isArray(caps.whiteBalanceMode)&&caps.whiteBalanceMode.includes('continuous'))a.whiteBalanceMode='continuous';
  if(caps.zoom&&Number.isFinite(caps.zoom.min)&&Number.isFinite(caps.zoom.max)){
    const target=Math.min(caps.zoom.max,Math.max(caps.zoom.min,1.25));
    if(target>Number(settings.zoom||caps.zoom.min))a.zoom=target;
  }
  if(Object.keys(a).length)advanced.push(a);
  if(advanced.length)await track.applyConstraints({advanced});
 }catch(e){}
}
function enhanceCamera(){
 document.querySelectorAll('#p-scanner video,.pm-inv-camera video').forEach(v=>{
  const st=v.srcObject;if(st&&typeof st.getVideoTracks==='function'){const t=st.getVideoTracks()[0];if(t&&!t.__tdngoFocusV12){t.__tdngoFocusV12=true;tuneTrack(t)}}
  v.setAttribute('playsinline','');v.style.objectFit='cover';
 });
 const frame=document.querySelector('#p-scanner .scan-frame');if(frame&&!frame.querySelector('.pm-focus-note')){const n=document.createElement('div');n.className='pm-focus-note';n.textContent='Foco contínuo · aproxime até o QR ficar nítido';frame.appendChild(n)}
}

function pwaHints(){
 if(!document.querySelector('meta[name="apple-mobile-web-app-capable"]')){const m=document.createElement('meta');m.name='apple-mobile-web-app-capable';m.content='yes';document.head.appendChild(m)}
 if(!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')){const m=document.createElement('meta');m.name='apple-mobile-web-app-status-bar-style';m.content='black-translucent';document.head.appendChild(m)}
 if(!document.querySelector('meta[name="apple-mobile-web-app-title"]')){const m=document.createElement('meta');m.name='apple-mobile-web-app-title';m.content='TDNGo Patrimônio';document.head.appendChild(m)}
 if(!document.querySelector('meta[name="theme-color"]')){const m=document.createElement('meta');m.name='theme-color';m.content='#0b1118';document.head.appendChild(m)}
}
function installPrompt(){
 if(!/iPhone|iPad|iPod/i.test(navigator.userAgent)||window.navigator.standalone===true||localStorage.getItem('pm_pwa_tip')==='1')return;
 const home=document.getElementById('p-dashboard');if(!home)return;
 let card=document.getElementById('pm-pwa-card');if(card)return;
 card=document.createElement('div');card.id='pm-pwa-card';card.className='card';card.style.cssText='margin:12px 0;border-color:rgba(96,165,250,.26)';card.innerHTML='<div style="display:flex;gap:10px;align-items:flex-start"><div style="font-size:20px">▣</div><div style="flex:1"><b style="font-size:12px">Usar como aplicativo no iPhone</b><div class="muted" style="font-size:10px;margin-top:3px;line-height:1.45">No Safari, toque em Compartilhar → Adicionar à Tela de Início. Depois abra pelo ícone: o Patrimônios funcionará em tela cheia, sem a barra do navegador.</div></div><button class="btn sm" id="pm-pwa-dismiss">Entendi</button></div>';const grid=home.querySelector('.grid4');grid?.insertAdjacentElement('beforebegin',card);card.querySelector('#pm-pwa-dismiss').onclick=()=>{localStorage.setItem('pm_pwa_tip','1');card.remove()};
}
function install(){addCss();pwaHints();clearButton();decorateResult();enhanceCamera();installPrompt();const out=result();if(out)new MutationObserver(decorateResult).observe(out,{childList:true,subtree:true,attributes:true});focusTimer=setInterval(enhanceCamera,900);document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(enhanceCamera,200)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,1450));else setTimeout(install,1450);
})();