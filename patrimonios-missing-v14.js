(()=>{
'use strict';
let ac=null,lastKey='',lastAt=0;
function audio(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();return ac}catch(e){return null}}
function tone(f,s,d,g){const c=audio();if(!c)return;const o=c.createOscillator(),v=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f,s);v.gain.setValueAtTime(.0001,s);v.gain.exponentialRampToValueAtTime(g,s+.006);v.gain.exponentialRampToValueAtTime(.0001,s+d);o.connect(v);v.connect(c.destination);o.start(s);o.stop(s+d+.02)}
function errorSound(){const c=audio();if(!c)return;const n=c.currentTime;tone(420,n,.13,.48);tone(260,n+.09,.19,.52)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function show(code,msg){
 const now=Date.now(),key=code+'|'+msg;if(key===lastKey&&now-lastAt<3500)return;lastKey=key;lastAt=now;
 errorSound();if(navigator.vibrate)navigator.vibrate([35,35,55]);
 let stack=document.querySelector('.pm-alert-stack');if(!stack){stack=document.createElement('div');stack.className='pm-alert-stack';document.body.appendChild(stack)}
 stack.querySelectorAll('.pm-alert.pm-missing-alert').forEach(x=>x.remove());
 const el=document.createElement('div');el.className='pm-alert error pm-missing-alert';el.innerHTML=`<div class="pm-alert-icon">×</div><div class="pm-alert-copy"><b>QR não cadastrado</b><span>${esc(code)} não foi localizado. O leitor continua ativo para o próximo QR.</span></div><div class="pm-alert-actions"><button class="ghost" type="button">Fechar</button><button type="button">Cadastrar</button></div>`;
 const [close,reg]=el.querySelectorAll('button');close.onclick=()=>el.remove();reg.onclick=()=>{el.remove();window.pmRegisterScanned?.(code,false)};stack.appendChild(el);setTimeout(()=>{if(el.isConnected)el.remove()},5500);
}
function install(){
 document.addEventListener('pointerdown',()=>audio(),{once:true,capture:true});
 document.addEventListener('pm:scan-missing',e=>show(String(e.detail?.code||''),String(e.detail?.message||'')));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();