(()=>{
'use strict';
const SIX=/^\d{6}$/;
let currentCode='', seen=new Set(), installed=false;

function css(){
 if(document.getElementById('pat-scan-feedback-v11'))return;
 const s=document.createElement('style');s.id='pat-scan-feedback-v11';s.textContent=`
 .pm-clear-scan{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;margin-top:10px;min-height:42px;border-radius:11px;border:1px solid var(--pm-border,#26313d);background:var(--pm-surface2,#18212c);color:var(--pm-text,#edf2f7);font:700 11px system-ui;cursor:pointer}.pm-clear-scan svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round}.pm-clear-scan:hover{background:var(--pm-surface,#121922)}
 .pm-scan-result-tools{display:flex;gap:7px;margin-top:10px}.pm-scan-result-tools .pm-clear-scan{margin:0;flex:1}.pm-scan-ready{padding:10px 12px;border:1px solid rgba(59,130,246,.22);background:rgba(59,130,246,.07);border-radius:11px;color:var(--pm-muted,#8b99aa);font-size:10px;text-align:center;margin-top:10px}
 @media(max-width:760px){.pm-clear-scan{min-height:46px;font-size:12px}.pm-scan-result-tools{position:sticky;bottom:calc(70px + env(safe-area-inset-bottom));z-index:5}}
 `;document.head.appendChild(s);
}
function codeFrom(el){const t=(el?.textContent||'');const m=t.match(/\b\d{6}\b/);return m?m[0]:''}
function scannerResult(){return document.getElementById('scan-result')}
function addClear(){
 const out=scannerResult();if(!out||!out.classList.contains('show')||!out.querySelector('.asset-code'))return;
 const code=(out.querySelector('.asset-code')?.textContent||'').trim();if(!SIX.test(code))return;
 currentCode=code;
 if(out.querySelector('.pm-scan-result-tools'))return;
 const wrap=document.createElement('div');wrap.className='pm-scan-result-tools';wrap.innerHTML=`<button type="button" class="pm-clear-scan" onclick="pmClearQrResult()"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/></svg>Limpar leitura e escanear outro</button>`;out.appendChild(wrap);
}
window.pmClearQrResult=function(){
 currentCode='';seen.clear();
 document.querySelectorAll('.pm-alert').forEach(x=>x.remove());
 const inp=document.getElementById('scan-code');if(inp)inp.value='';
 const out=scannerResult();if(out){out.classList.remove('show');out.innerHTML=''}
 const state=document.querySelector('#p-scanner .pm-fast-state span');if(state)state.textContent='Leitor pronto · aponte para o próximo QR';
 try{window.startScanner?.()}catch(e){}
};
function dedupeAlerts(){
 const stack=document.querySelector('.pm-alert-stack');if(!stack)return;
 new MutationObserver(ms=>{
  for(const m of ms){for(const n of m.addedNodes){if(!(n instanceof HTMLElement)||!n.classList.contains('pm-alert'))continue;
   const code=codeFrom(n)||currentCode;if(!SIX.test(code))continue;
   const type=n.classList.contains('error')?'error':n.classList.contains('warn')?'warn':'success';
   const key=type+'|'+code;
   if(seen.has(key)){n.remove();continue}
   seen.add(key);
   if(type==='success')currentCode=code;
  }}
 }).observe(stack,{childList:true});
}
function watchResult(){const out=scannerResult();if(!out)return;new MutationObserver(()=>{const c=(out.querySelector('.asset-code')?.textContent||'').trim();if(SIX.test(c)&&c!==currentCode){currentCode=c;seen.clear()}addClear()}).observe(out,{childList:true,subtree:true,characterData:true});addClear()}
function ensureManualClear(){
 const box=document.querySelector('#p-scanner .scanner-box');if(!box||box.querySelector('.pm-clear-manual'))return;
 const b=document.createElement('button');b.type='button';b.className='pm-clear-scan pm-clear-manual';b.textContent='Limpar leitura';b.onclick=window.pmClearQrResult;
 const out=scannerResult();if(out)out.insertAdjacentElement('afterend',b);
}
function install(){if(installed)return;installed=true;css();watchResult();ensureManualClear();setTimeout(dedupeAlerts,200);new MutationObserver(()=>{ensureManualClear();addClear();if(document.querySelector('.pm-alert-stack')&&!document.querySelector('.pm-alert-stack').dataset.v11){document.querySelector('.pm-alert-stack').dataset.v11='1';dedupeAlerts()}}).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,1250));else setTimeout(install,1250);
})();