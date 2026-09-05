(function(){
'use strict';
const AUTO_THRESHOLD=5*1024*1024;
const HARD_LIMIT=15*1024*1024;
const PDFJS_URLS=[
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js'
];
const PDFJS_WORKERS=[
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
];
const JSPDF_URLS=[
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
  'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js'
];
const $=id=>document.getElementById(id);
const fmtBytes=n=>{n=Number(n)||0;if(n<1024)return n+' B';if(n<1048576)return(n/1024).toFixed(1)+' KB';return(n/1048576).toFixed(1)+' MB'};
function loadOne(src,test){return new Promise((resolve,reject)=>{if(test())return resolve(src);const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.referrerPolicy='no-referrer';const done=(ok)=>{s.onload=null;s.onerror=null;if(ok&&test())resolve(src);else{try{s.remove()}catch(e){}reject(new Error('Falha em '+src))}};s.onload=()=>done(true);s.onerror=()=>done(false);document.head.appendChild(s)})}
async function loadAny(urls,test,label){if(test())return'';let last=null;for(const u of urls){try{return await loadOne(u,test)}catch(e){last=e;console.warn('[TDNGo PDF] '+label+' indisponível:',u)}}throw new Error('Falha ao carregar '+label+' em todas as fontes disponíveis'+(last?' — '+last.message:''))}
async function libs(){
  await loadAny(PDFJS_URLS,()=>!!window.pdfjsLib,'PDF.js');
  try{window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS_WORKERS[0]}catch(e){}
  await loadAny(JSPDF_URLS,()=>!!(window.jspdf&&window.jspdf.jsPDF),'jsPDF');
}
async function openPdf(bytes){
  try{return await window.pdfjsLib.getDocument({data:bytes}).promise}
  catch(first){
    console.warn('[TDNGo PDF] worker principal falhou; tentando worker alternativo',first);
    for(let i=1;i<PDFJS_WORKERS.length;i++){
      try{window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS_WORKERS[i];return await window.pdfjsLib.getDocument({data:bytes}).promise}catch(e){}
    }
    try{return await window.pdfjsLib.getDocument({data:bytes,disableWorker:true}).promise}catch(e){throw first}
  }
}
async function compressRaster(file,scale,quality){
  await libs();
  const bytes=new Uint8Array(await file.arrayBuffer());
  const doc=await openPdf(bytes);
  let out=null;
  for(let i=1;i<=doc.numPages;i++){
    const page=await doc.getPage(i);
    const viewport=page.getViewport({scale});
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.floor(viewport.width));canvas.height=Math.max(1,Math.floor(viewport.height));
    const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas indisponível para compressão.');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
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
  if(!out)throw new Error('O PDF não contém páginas processáveis.');
  const blob=out.output('blob');
  try{await doc.destroy()}catch(e){}
  return new File([blob],file.name.replace(/\.pdf$/i,'')+'-otimizado.pdf',{type:'application/pdf',lastModified:Date.now()});
}
async function optimize(file){
  if(file.size<=AUTO_THRESHOLD)return{file,compressed:false,original:file.size,final:file.size};
  if(typeof showLoading==='function')showLoading('Otimizando PDF automaticamente…');
  let first=await compressRaster(file,1.55,.70);
  if(first.size<=HARD_LIMIT&&first.size<file.size)return{file:first,compressed:true,original:file.size,final:first.size};
  if(typeof showLoading==='function')showLoading('Aplicando compressão mais forte…');
  let second=await compressRaster(file,1.12,.52);
  const best=[file,first,second].sort((a,b)=>a.size-b.size)[0];
  return{file:best,compressed:best!==file,original:file.size,final:best.size};
}
function install(){
  const input=$('ai-pdf-input');if(!input||input.dataset.autoCompress==='2')return false;
  const original=input.onchange;if(typeof original!=='function')return false;
  input.dataset.autoCompress='2';
  input.onchange=async function(e){
    const file=e.target.files&&e.target.files[0];if(!file)return;
    try{
      const r=await optimize(file);
      if(r.final>HARD_LIMIT){if(typeof hideLoading==='function')hideLoading();if(typeof showNotif==='function')showNotif('O PDF continuou acima de 15 MB após a compressão automática ('+fmtBytes(r.final)+'). Divida o documento e tente novamente.','err');input.value='';return;}
      if(r.compressed&&typeof showNotif==='function'){const pct=Math.max(0,Math.round((1-r.final/r.original)*100));showNotif('PDF otimizado: '+fmtBytes(r.original)+' → '+fmtBytes(r.final)+' ('+pct+'% menor).','ok')}
      if(typeof hideLoading==='function')hideLoading();
      return original.call(input,{target:{files:[r.file]}});
    }catch(err){
      console.error('[TDNGo PDF] compressão automática',err);
      if(typeof hideLoading==='function')hideLoading();
      if(file.size<=HARD_LIMIT){if(typeof showNotif==='function')showNotif('A compressão automática não ficou disponível, mas o PDF está dentro de 15 MB e será analisado no tamanho original.','warn');return original.call(input,{target:{files:[file]}})}
      if(typeof showNotif==='function')showNotif('Não foi possível comprimir o PDF automaticamente. As bibliotecas de compressão não puderam ser carregadas e o arquivo está acima de 15 MB.','err');input.value='';
    }
  };
  const info=document.querySelector('#ai-pdf-card .ai-pdf-info span');if(info)info.textContent='Selecione um PDF. Acima de 5 MB, ele é comprimido automaticamente em memória antes da análise. Se a compressão não estiver disponível e o arquivo tiver até 15 MB, a análise usa o original. Nada é salvo.';
  return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>100)clearInterval(timer)},100);
})();
