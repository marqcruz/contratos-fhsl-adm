(()=>{
'use strict';
let ac=null,lastOk=0,lastErr=0;
function ctx(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();return ac}catch(e){return null}}
function tone(freq,start,dur,type,gain,dest){const c=ctx();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+.006);g.gain.exponentialRampToValueAtTime(.0001,start+dur);o.connect(g);g.connect(dest);o.start(start);o.stop(start+dur+.015)}
function master(level=.82){const c=ctx();if(!c)return null;const comp=c.createDynamicsCompressor();comp.threshold.value=-10;comp.knee.value=4;comp.ratio.value=7;comp.attack.value=.002;comp.release.value=.08;const g=c.createGain();g.gain.value=level;g.connect(comp);comp.connect(c.destination);return g}
function success(){const c=ctx();if(!c)return;const now=c.currentTime,m=master(.95);tone(1180,now,.12,'square',.78,m);tone(1680,now+.07,.14,'square',.72,m);tone(2180,now+.125,.08,'sine',.48,m)}
function error(){const c=ctx();if(!c)return;const now=c.currentTime,m=master(.9);tone(360,now,.16,'sawtooth',.72,m);tone(245,now+.11,.23,'square',.68,m)}
function install(){
 document.addEventListener('pointerdown',()=>ctx(),{capture:true,once:true});
 new MutationObserver(muts=>{
  for(const m of muts){for(const n of m.addedNodes){if(!(n instanceof HTMLElement))continue;
   const ok=n.matches?.('.pm-alert.success')?n:n.querySelector?.('.pm-alert.success');
   const err=n.matches?.('.pm-alert.error')?n:n.querySelector?.('.pm-alert.error');
   const now=Date.now();
   if(err&&now-lastErr>450){lastErr=now;error();return}
   if(ok&&now-lastOk>450){lastOk=now;success();return}
  }}
 }).observe(document.body,{childList:true,subtree:true});
}
window.pmSoundSuccess=success;window.pmSoundError=error;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();