(()=>{
'use strict';
let ac=null,last=0;
function ctx(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();return ac}catch(e){return null}}
function loudBeep(){
 const c=ctx();if(!c)return;const now=c.currentTime;
 try{
  const master=c.createGain();master.gain.setValueAtTime(.0001,now);master.gain.exponentialRampToValueAtTime(.34,now+.008);master.gain.exponentialRampToValueAtTime(.0001,now+.18);master.connect(c.destination);
  [[1040,0,.095],[1420,.055,.125]].forEach(([f,delay,dur])=>{const o=c.createOscillator();const g=c.createGain();o.type='square';o.frequency.setValueAtTime(f,now+delay);g.gain.setValueAtTime(.32,now+delay);g.gain.exponentialRampToValueAtTime(.0001,now+delay+dur);o.connect(g);g.connect(master);o.start(now+delay);o.stop(now+delay+dur+.01)});
 }catch(e){}
}
function install(){
 document.addEventListener('pointerdown',()=>ctx(),{capture:true,once:true});
 const root=document.body;new MutationObserver(muts=>{
  for(const m of muts){for(const n of m.addedNodes){if(!(n instanceof HTMLElement))continue;const ok=n.matches?.('.pm-alert.success')?n:n.querySelector?.('.pm-alert.success');if(ok){const t=Date.now();if(t-last>350){last=t;loudBeep()}return}}}
 }).observe(root,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();