(()=>{
'use strict';
if(window.__TDNGO_SOUND_MODERN_V10__)return;window.__TDNGO_SOUND_MODERN_V10__=true;
const NativeCtx=window.AudioContext||window.webkitAudioContext;
let last=0;
function modernAlarm(){const now=Date.now();if(now-last<1500)return;last=now;try{const p=window.tdngoPlaySirenPreset?.('PERSONALIZADO',100);if(p&&typeof p.catch==='function')p.catch(()=>{});else window.tdngoCustomSirenPlay?.(true)}catch{try{window.tdngoCustomSirenPlay?.(true)}catch{}}try{navigator.vibrate?.([220,80,220,80,420])}catch{}}
function dummyParam(){return{setValueAtTime(){},exponentialRampToValueAtTime(){}}}
function dummyNode(){return{type:'sine',frequency:dummyParam(),gain:dummyParam(),connect(){return this},start(){modernAlarm()},stop(){}}}
class TDNGOAudioContext{
 constructor(){this.state='running';this.destination={};this.currentTime=0}
 async resume(){this.state='running'}
 createOscillator(){return dummyNode()}
 createGain(){return dummyNode()}
 close(){return Promise.resolve()}
}
if(NativeCtx){window.__TDNGO_NATIVE_AUDIO_CONTEXT__=NativeCtx;window.AudioContext=TDNGOAudioContext;window.webkitAudioContext=TDNGOAudioContext}
window.TDNGOModernAlarm=modernAlarm;
})();
