(()=>{
'use strict';
if(window.__TDNGO_MANUT_AUDIO_V8__)return;window.__TDNGO_MANUT_AUDIO_V8__=true;
const KEY='tdngo_manut_sound_enabled_v8';
const TEST_KEY='tdngo_manut_sound_unlocked_v8';
let ctx=null,active=[],lastPlay=0,wrapped=false;
const enabled=()=>localStorage.getItem(KEY)!=='0';
function toast(msg,type=''){const e=document.getElementById('toast');if(!e)return;e.textContent=String(msg||'').toLocaleUpperCase('pt-BR');e.className='toast '+type;e.style.display='block';clearTimeout(e._audio);e._audio=setTimeout(()=>e.style.display='none',4200)}
async function unlock(){try{if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')await ctx.resume();localStorage.setItem(TEST_KEY,'1');return ctx.state==='running'}catch{return false}}
function stop(){for(const n of active){try{n.stop()}catch{}}active=[]}
function tone(at,f1,f2,dur,gain=.75,type='square'){
 if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f1,at);o.frequency.exponentialRampToValueAtTime(Math.max(30,f2),at+dur*.88);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(gain,at+.025);g.gain.setValueAtTime(gain,at+dur-.06);g.gain.exponentialRampToValueAtTime(.0001,at+dur);o.connect(g);g.connect(ctx.destination);o.start(at);o.stop(at+dur+.03);active.push(o)
}
async function alarm(kind='normal',force=false){
 if(!enabled()&&!force)return false;if(!force&&Date.now()-lastPlay<1800)return false;lastPlay=Date.now();if(!await unlock())return false;stop();const t=ctx.currentTime+.03;
 if(kind==='critical'){
   for(let cycle=0;cycle<3;cycle++){
     const base=t+cycle*2.15;
     tone(base,760,1280,.62,.86,'sawtooth');tone(base+.68,1280,760,.62,.86,'sawtooth');tone(base+1.36,880,1480,.62,.92,'square');
   }
   try{navigator.vibrate?.([350,110,350,110,500,180,350,110,650])}catch{}
 }else{
   tone(t,900,1350,.5,.82,'square');tone(t+.58,1350,900,.5,.82,'square');tone(t+1.16,900,1500,.65,.88,'sawtooth');
   try{navigator.vibrate?.([280,100,280,100,420])}catch{}
 }
 return true
}
function isCritical(title='',body=''){return /\bP1\b|\bP2\b|CR[IÍ]TIC|ESCALA|SOBREAVISO|ACEITE PENDENTE|SEM ACEITE/i.test(String(title)+' '+String(body))}
function decorate(){
 const actions=document.querySelector('#page-dashboard .page-head .actions');if(actions&&!actions.querySelector('.v8-sound-test')){const b=document.createElement('button');b.type='button';b.className='btn v8-sound-test';b.textContent='Testar sirene';b.onclick=async()=>{localStorage.setItem(KEY,'1');const ok=await alarm('critical',true);toast(ok?'TESTE DA SIRENE EXECUTADO. AUMENTE O VOLUME DO DISPOSITIVO SE NECESSÁRIO.':'O NAVEGADOR BLOQUEOU O ÁUDIO. TOQUE NOVAMENTE EM TESTAR SIRENE.',ok?'ok':'err')};actions.prepend(b)}
 const more=document.querySelector('#more-modal .list');if(more&&!more.querySelector('.v8-sound-toggle')){const b=document.createElement('button');b.type='button';b.className='btn v8-sound-toggle';const sync=()=>b.textContent=enabled()?'Som de alerta: ligado':'Som de alerta: desligado';b.onclick=async()=>{const on=!enabled();localStorage.setItem(KEY,on?'1':'0');sync();if(on){await unlock();alarm('normal',true)}else stop()};sync();more.prepend(b)}
}
function wrapNotification(){
 if(wrapped||!window.Notification)return;wrapped=true;const Base=window.Notification;
 function AudioNotification(title,options={}){alarm(isCritical(title,options?.body)?'critical':'normal');return new Base(title,options)}
 try{Object.defineProperty(AudioNotification,'permission',{get:()=>Base.permission});AudioNotification.requestPermission=(...a)=>Base.requestPermission(...a);window.Notification=AudioNotification}catch{}
}
function wrapEnable(){const old=window.enableNotifications;if(typeof old!=='function'||old.__v8)return;const fn=async function(...args){localStorage.setItem(KEY,'1');await unlock();const r=await old.apply(this,args);setTimeout(()=>{if(window.Notification?.permission==='granted')alarm('normal',true)},250);return r};fn.__v8=true;window.enableNotifications=fn}
function init(){
 if(localStorage.getItem(KEY)==null)localStorage.setItem(KEY,'1');
 document.addEventListener('pointerdown',()=>{if(enabled())unlock()},{once:true,capture:true});
 document.addEventListener('keydown',()=>{if(enabled())unlock()},{once:true,capture:true});
 wrapNotification();wrapEnable();decorate();
 navigator.serviceWorker?.addEventListener('message',ev=>{if(ev.data?.type!=='TDNGO_MANUT_PUSH_ALERT')return;const d=ev.data.data||{};alarm(isCritical(d.title,d.body)?'critical':'normal')});
 const mo=new MutationObserver(()=>{decorate();wrapEnable();if(!wrapped)wrapNotification()});mo.observe(document.body,{childList:true,subtree:true});
 window.tdngoTestMaintenanceAlarm=()=>alarm('critical',true);window.tdngoStopMaintenanceAlarm=stop;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
