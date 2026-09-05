(function(){
'use strict';
const AUTO_THRESHOLD=5*1024*1024;
const HARD_LIMIT=15*1024*1024;
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const JSPDF='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js';
const $=id=>document.getElementById(id);
const fmtBytes=n=>{n=Number(n)||0;if(n<1024)return n+' B';if(n<1048576)return(n/1024).toFixed(1)+' KB';return(n/1048576).toFixed(1)+' MB'};
function loadScript(src,test){return new Promise((resolve,reject)=>{if(test())return resolve();const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>test()?resolve():reject(new Error('Biblioteca não inicializada.'));s.onerror=()=>reject(new Error('Falha ao carregar biblioteca de compressão.'));document.head.appendChild(s)})}
async function libs(){await loadScript(PDFJS,()=>!!window.pdfjsLib);window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS_WORKER;await loadScript(JSPDF,()=>!!(window.jspdf&&window.jspdf.jsPDF));}
async function compressRaster(file,scale,quality){
  await libs();
  const bytes=new Uint8Array(await file.arrayBuffer());
  const doc=await window.pdfjsLib.getDocument({data:bytes}).promise;
  let out=null;
  for(let i=1;i<=doc.numPages;i++){
    const page=await doc.getPage(i);
    const viewport=page.getViewport({scale});
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.floor(viewport.width));canvas.height=Math.max(1,Math.floor(viewport.height));
    const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
    await page.render({canvasContext:ctx,viewport}).promise;
    const img=canvas.toDataURL('image/jpeg',quality);
    const orientation=viewport.width>viewport.height?'landscape':'portrait';
    if(!out)out=new window.jspdf.jsPDF({orientation,unit:'pt',format:[viewport.width,viewport.height],compress:true,putOnlyUsedFonts:true});
    else out.addPage([viewport.width,viewport.height],orientation);
    out.addImage(img,'JPEG',0,0,viewport.width,viewport.height,undefined,'FAST');
    canvas.width=1;canvas.height=1;page.cleanup&&page.cleanup();
    if(typeof showLoading==='function')showLoading('Comprimindo PDF… página '+i+' de '+doc.numPages);
    await new Promise(r=>setTimeout(r,0));
  }
  const blob=out.output('blob');
  try{await doc.destroy()}catch(e){}
  return new File([blob],file.name.replace(/\.pdf$/i,'')+'-otimizado.pdf',{type:'application/pdf',lastModified:Date.now()});
}
async function optimize(file){
  if(file.size<=AUTO_THRESHOLD)return{file,compressed:false,original:file.size,final:file.size};
  if(typeof showLoading==='function')showLoading('Otimizando PDF automaticamente…');
  let first=await compressRaster(file,1.6,.72);
  if(first.size<=HARD_LIMIT&&first.size<file.size)return{file:first,compressed:true,original:file.size,final:first.size};
  if(typeof showLoading==='function')showLoading('Aplicando compressão mais forte…');
  let second=await compressRaster(file,1.18,.56);
  const best=[file,first,second].sort((a,b)=>a.size-b.size)[0];
  return{file:best,compressed:best!==file,original:file.size,final:best.size};
}
function install(){
  const input=$('ai-pdf-input');if(!input||input.dataset.autoCompress==='1')return false;
  const original=input.onchange;if(typeof original!=='function')return false;
  input.dataset.autoCompress='1';
  input.onchange=async function(e){
    const file=e.target.files&&e.target.files[0];if(!file)return;
    try{
      const r=await optimize(file);
      if(r.final>HARD_LIMIT){if(typeof hideLoading==='function')hideLoading();if(typeof showNotif==='function')showNotif('O PDF continuou acima de 15 MB após a compressão automática ('+fmtBytes(r.final)+'). Divida o documento e tente novamente.','err');input.value='';return;}
      if(r.compressed&&typeof showNotif==='function'){const pct=Math.max(0,Math.round((1-r.final/r.original)*100));showNotif('PDF otimizado: '+fmtBytes(r.original)+' → '+fmtBytes(r.final)+' ('+pct+'% menor).','ok')}
      if(typeof hideLoading==='function')hideLoading();
      return original.call(input,{target:{files:[r.file]}});
    }catch(err){
      if(typeof hideLoading==='function')hideLoading();
      if(file.size<=HARD_LIMIT){if(typeof showNotif==='function')showNotif('Não foi possível comprimir este PDF; a análise seguirá com o arquivo original.','warn');return original.call(input,{target:{files:[file]}})}
      if(typeof showNotif==='function')showNotif('Não foi possível comprimir o PDF automaticamente: '+String(err&&err.message||err),'err');input.value='';
    }
  };
  const info=document.querySelector('#ai-pdf-card .ai-pdf-info span');if(info)info.textContent='Selecione um PDF. Acima de 5 MB, ele é comprimido automaticamente em memória antes da análise. O arquivo não é salvo no TDNGo.';
  return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>80)clearInterval(timer)},100);
})();
