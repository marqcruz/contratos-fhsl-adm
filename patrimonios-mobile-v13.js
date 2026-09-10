(()=>{
'use strict';
const SIX=/^\d{6}$/;
let ac=null,lastSoundKey='',lastSoundAt=0,deferredInstall=null;

function css(){
 if(document.getElementById('pat-mobile-v13'))return;
 const s=document.createElement('style');s.id='pat-mobile-v13';s.textContent=`
 .pm-scan-clear{display:none;width:100%;min-height:50px;margin-top:12px;border:1px solid rgba(96,165,250,.34);border-radius:14px;background:rgba(37,99,235,.14);color:var(--pm-accent2,#78adff);font:800 12px system-ui;align-items:center;justify-content:center;gap:8px;cursor:pointer}.pm-scan-clear.show{display:flex}.pm-scan-clear svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
 .pm-result-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:-2px -2px 10px;padding:8px 9px;border-bottom:1px solid var(--pm-border,#26313d)}.pm-result-head span{font-size:10px;color:var(--pm-muted,#8b99aa);font-weight:750}.pm-result-x{width:34px;height:34px;border-radius:10px;border:1px solid var(--pm-border,#26313d);background:var(--pm-surface2,#18212c);color:var(--pm-text,#edf2f7);display:grid;place-items:center;padding:0}.pm-result-x svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2}
 .pm-focus-note{position:absolute;z-index:8;left:50%;bottom:12px;transform:translateX(-50%);padding:6px 9px;border-radius:999px;background:rgba(3,7,12,.66);color:#dce7f5;font-size:9px;backdrop-filter:blur(8px);pointer-events:none;white-space:nowrap}
 .pm-install-card{margin:12px 0;border-color:rgba(96,165,250,.28)!important}.pm-install-row{display:flex;gap:10px;align-items:flex-start}.pm-install-copy{flex:1}.pm-install-copy b{font-size:12px}.pm-install-copy div{font-size:10px;line-height:1.45;margin-top:3px;color:var(--pm-muted,#8b99aa)}
 @media(max-width:760px){html,body{width:100%;min-height:100dvh;overscroll-behavior-y:none}body{min-height:100dvh!important}.app,.main{min-height:100dvh!important}.main{padding-bottom:calc(84px + env(safe-area-inset-bottom))!important}#p-scanner .scanner-box{min-height:calc(100dvh - 160px)}#p-scanner .scan-frame{height:clamp(340px,52dvh,560px)!important;min-height:340px!important;max-height:none!important}.pm-scan-clear{position:sticky;bottom:calc(78px + env(safe-area-inset-bottom));z-index:35;box-shadow:0 10px 30px rgba(0,0,0,.26);background:color-mix(in srgb,var(--pm-accent,#2563eb) 18%,var(--pm-surface,#101720))}.pm-appbar,.pm-bottom{touch-action:manipulation}}
 @media(display-mode:standalone){html,body,.app,.main{min-height:100dvh!important}.main{padding-top:calc(58px + env(safe-area-inset-top))!important}.pm-appbar{padding-top:env(safe-area-inset-top)!important}.pm-bottom{padding-bottom:env(safe-area-inset-bottom)!important}}
 `;document.head.appendChild(s);
}
function result(){return document.getElementById('scan-result')}
function removeLegacyClear(){document.querySelectorAll('.pm-clear-scan,.pm-v12-clear,.pm-clear-manual,.pm-scan-result-tools,.pm-v12-resultbar').forEach(x=>x.remove())}
function ensureClear(){
 removeLegacyClear();
 const out=result(),box=document.querySelector('#p-scanner .scanner-box');if(!box)return null;
 let b=box.querySelector('.pm-scan-clear');
 if(!b){b=document.createElement('button');b.type='button';b.className='pm-scan-clear';b.innerHTML='<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/></svg><span>Limpar leitura e escanear outro</span>';b.onclick=clearScan;(out||box.lastElementChild).insertAdjacentElement('afterend',b)}
 return b;
}
function located(){const out=result();return !!(out&&out.classList.contains('show')&&SIX.test((out.querySelector('.asset-code')?.textContent||'').trim()))}
function decorate(){
 const out=result(),b=ensureClear();if(!out||!b)return;
 const has=located()||!!window.pmScannerGetLockedCode?.();b.classList.toggle('show',has);
 if(located()&&!out.querySelector('.pm-result-head')){const h=document.createElement('div');h.className='pm-result-head';h.innerHTML='<span>Patrimônio localizado</span><button type="button" class="pm-result-x" aria-label="Limpar leitura"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';h.querySelector('button').onclick=clearScan;out.prepend(h)}
}
function clearScan(){
 document.querySelectorAll('.pm-alert').forEach(x=>x.remove());
 try{window.pmScannerReset?.()}catch(e){}
 const out=result();if(out){out.classList.remove('show');out.innerHTML=''}
 const input=document.getElementById('scan-code');if(input)input.value='';
 const b=document.querySelector('.pm-scan-clear');if(b)b.classList.remove('show');
 setTimeout(()=>{decorate();tuneVideos()},120);
}
window.pmClearQrResult=clearScan;

function audio(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();return ac}catch(e){return null}}
function tone(freq,start,dur,gain,type='square'){
 const c=audio();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+.006);g.gain.exponentialRampToValueAtTime(.0001,start+dur);o.connect(g);g.connect(c.destination);o.start(start);o.stop(start+dur+.015)
}
function loudSuccess(){const c=audio();if(!c)return;const n=c.currentTime;tone(1050,n,.09,.38);tone(1450,n+.065,.11,.42);tone(1750,n+.135,.10,.38)}
function loudError(){const c=audio();if(!c)return;const n=c.currentTime;tone(430,n,.14,.42,'sawtooth');tone(260,n+.10,.20,.46,'sawtooth')}
function watchAlerts(){
 const root=document.body;new MutationObserver(ms=>{for(const m of ms){for(const n of m.addedNodes){if(!(n instanceof HTMLElement)||!n.classList.contains('pm-alert'))continue;const txt=n.textContent||'',code=(txt.match(/\b\d{6}\b/)||[])[0]||'',kind=n.classList.contains('error')?'error':n.classList.contains('warn')?'warn':'success',key=kind+'|'+code,now=Date.now();if(key===lastSoundKey&&now-lastSoundAt<1800)continue;lastSoundKey=key;lastSoundAt=now;if(kind==='success')loudSuccess();else if(kind==='error')loudError()}}}).observe(root,{childList:true,subtree:true})
}
async function tuneTrack(track){
 if(!track||track.__pmV13)return;track.__pmV13=true;
 try{track.contentHint='detail'}catch(e){}
 try{const caps=track.getCapabilities?.()||{},settings=track.getSettings?.()||{},a={};if(Array.isArray(caps.focusMode)&&caps.focusMode.includes('continuous'))a.focusMode='continuous';if(Array.isArray(caps.exposureMode)&&caps.exposureMode.includes('continuous'))a.exposureMode='continuous';if(Array.isArray(caps.whiteBalanceMode)&&caps.whiteBalanceMode.includes('continuous'))a.whiteBalanceMode='continuous';if(caps.zoom&&Number.isFinite(caps.zoom.min)&&Number.isFinite(caps.zoom.max)){const target=Math.min(caps.zoom.max,Math.max(caps.zoom.min,1.15));if(target>Number(settings.zoom||caps.zoom.min))a.zoom=target}if(Object.keys(a).length)await track.applyConstraints({advanced:[a]})}catch(e){}
}
function tuneVideos(){
 document.querySelectorAll('#p-scanner video,.pm-inv-camera video').forEach(v=>{const s=v.srcObject;if(s&&typeof s.getVideoTracks==='function')tuneTrack(s.getVideoTracks()[0]);v.setAttribute('playsinline','');v.style.objectFit='cover'});
 const frame=document.querySelector('#p-scanner .scan-frame');if(frame&&!frame.querySelector('.pm-focus-note')){const n=document.createElement('div');n.className='pm-focus-note';n.textContent='Foco contínuo · mantenha o QR nítido na área central';frame.appendChild(n)}
}
function setupPwa(){
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;renderInstallCard()});
 renderInstallCard();
}
function isStandalone(){return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true}
function renderInstallCard(){
 if(isStandalone()||localStorage.getItem('pm_pwa_tip')==='1')return;
 const home=document.getElementById('p-dashboard');if(!home||document.getElementById('pm-install-card'))return;
 const c=document.createElement('div');c.id='pm-install-card';c.className='card pm-install-card';
 const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent);
 c.innerHTML=`<div class="pm-install-row"><div style="font-size:20px">▣</div><div class="pm-install-copy"><b>Usar como aplicativo</b><div>${deferredInstall?'Instale o TDNGo Patrimônios para abrir em tela cheia e ter uma experiência mais próxima de um aplicativo.':ios?'No Safari, use Compartilhar → Adicionar à Tela de Início. Depois abra pelo ícone para usar em tela cheia.':'Adicione este site à tela inicial pelo menu do navegador para usar em modo aplicativo, quando suportado.'}</div></div><div class="actions"><button class="btn sm" id="pm-install-dismiss">Ocultar</button>${deferredInstall?'<button class="btn sm primary" id="pm-install-go">Instalar</button>':''}</div></div>`;
 home.querySelector('.grid4')?.insertAdjacentElement('beforebegin',c);
 c.querySelector('#pm-install-dismiss').onclick=()=>{localStorage.setItem('pm_pwa_tip','1');c.remove()};
 const go=c.querySelector('#pm-install-go');if(go)go.onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();try{await deferredInstall.userChoice}catch(e){}deferredInstall=null;c.remove()};
}
function install(){
 css();removeLegacyClear();ensureClear();decorate();watchAlerts();setupPwa();tuneVideos();
 const out=result();if(out)new MutationObserver(()=>{decorate();tuneVideos()}).observe(out,{childList:true,subtree:true,attributes:true});
 new MutationObserver(()=>{removeLegacyClear();ensureClear();decorate();tuneVideos()}).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('pointerdown',()=>audio(),{once:true,capture:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(tuneVideos,200)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,1150));else setTimeout(install,1150);
})();