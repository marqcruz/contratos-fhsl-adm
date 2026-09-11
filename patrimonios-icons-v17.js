(()=>{
'use strict';

const I={
 dashboard:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
 bens:'<svg viewBox="0 0 24 24"><path d="M4 7.5h16v11H4z"/><path d="M8 7.5V5h8v2.5M9 12h6"/></svg>',
 scanner:'<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/><rect x="8" y="8" width="3" height="3"/><rect x="13" y="8" width="3" height="3"/><rect x="8" y="13" width="3" height="3"/><path d="M14 14h2v2h-2z"/></svg>',
 inventario:'<svg viewBox="0 0 24 24"><path d="M8 4h8l1 2h3v15H4V6h3z"/><path d="M9 4v3h6V4M8 11h8M8 15h5"/></svg>',
 manutencao:'<svg viewBox="0 0 24 24"><path d="M14.5 6.5a4.5 4.5 0 0 0-5.8 5.8L4 17l3 3 4.7-4.7a4.5 4.5 0 0 0 5.8-5.8l-3 3-3-3z"/></svg>',
 relatorios:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 config:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.5 1a8 8 0 0 0-1.7-1L14.3 3h-4.6l-.4 3a8 8 0 0 0-1.7 1l-2.5-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.5-1a8 8 0 0 0 1.7 1l.4 3h4.6l.4-3a8 8 0 0 0 1.7-1l2.5 1 2-3.4-2-1.6a7 7 0 0 0 .1-1z"/></svg>',
 importar:'<svg viewBox="0 0 24 24"><path d="M12 16V4M8 8l4-4 4 4"/><path d="M5 14v6h14v-6"/></svg>',
 plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
 play:'<svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z"/></svg>',
 eye:'<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/></svg>',
 pause:'<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>',
 file:'<svg viewBox="0 0 24 24"><path d="M6 3.5h8l4 4V20H6z"/><path d="M14 3.5v4h4M9 12h6M9 16h6"/></svg>',
 check:'<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
 alert:'<svg viewBox="0 0 24 24"><path d="M12 3 2.5 20h19z"/><path d="M12 9v5M12 17h.01"/></svg>',
 clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 list:'<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
 search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>',
 tag:'<svg viewBox="0 0 24 24"><path d="M20 13 13 20 4 11V4h7z"/><circle cx="8.5" cy="8.5" r="1"/></svg>'
};

function css(){
 if(document.getElementById('pm-icons-v17'))return;
 const s=document.createElement('style');s.id='pm-icons-v17';s.textContent=`
 .pm-svg-icon,.nav .pm-ico,.pm-bottom .pm-bottom-icon,.inv16-sum-ico,.btn .pm-btn-icon{display:inline-grid;place-items:center;flex:0 0 auto}
 .pm-svg-icon svg,.nav .pm-ico svg,.pm-bottom .pm-bottom-icon svg,.inv16-sum-ico svg,.btn .pm-btn-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
 .nav button{display:flex!important;align-items:center!important;gap:10px!important}.nav .pm-ico{width:20px;height:20px}.nav .pm-label{min-width:0}
 .brand .ico{display:grid!important;place-items:center!important}.brand .ico svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
 .pm-bottom button{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important}.pm-bottom .pm-bottom-icon svg{width:21px;height:21px}
 .btn.pm-iconized{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important}.btn.pm-iconized .pm-btn-icon svg{width:15px;height:15px}
 .inv16-sum-ico{font-size:0!important}.inv16-sum-ico svg{width:17px;height:17px}
 @media(max-width:760px){.nav button{flex-direction:column!important;gap:3px!important}.nav .pm-ico svg{width:18px;height:18px}.nav .pm-label{font-size:9px}.pm-bottom .pm-bottom-icon svg{width:20px;height:20px}}
 `;document.head.appendChild(s);
}

function iconForPage(page){
 const p=String(page||'').toLowerCase();
 if(p.includes('dashboard'))return I.dashboard;
 if(p.includes('bens')||p.includes('bem'))return I.bens;
 if(p.includes('scanner')||p.includes('qr'))return I.scanner;
 if(p.includes('inventario'))return I.inventario;
 if(p.includes('manutenc'))return I.manutencao;
 if(p.includes('relatorio'))return I.relatorios;
 if(p.includes('config'))return I.config;
 if(p.includes('import'))return I.importar;
 return I.list;
}

function labelFromButton(b){
 const label=b.querySelector('.pm-label');
 if(label)return label.textContent.trim();
 const clone=b.cloneNode(true);clone.querySelectorAll('svg,.pm-ico,.pm-bottom-icon').forEach(x=>x.remove());
 return clone.textContent.trim();
}

function decorateNav(){
 document.querySelectorAll('.nav button[data-page]').forEach(b=>{
  const page=b.dataset.page||'';
  let ico=b.querySelector('.pm-ico');
  if(!ico){ico=document.createElement('span');ico.className='pm-ico';b.prepend(ico)}
  ico.innerHTML=iconForPage(page);
  let label=b.querySelector('.pm-label');
  if(!label){label=document.createElement('span');label.className='pm-label';const text=labelFromButton(b);[...b.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());label.textContent=text;b.appendChild(label)}
 });
 const brand=document.querySelector('.brand .ico');if(brand)brand.innerHTML=I.tag;
}

function decorateBottom(){
 document.querySelectorAll('.pm-bottom button,[data-bottom-page]').forEach(b=>{
  const page=b.dataset.page||b.dataset.bottomPage||'';
  let ico=b.querySelector('.pm-bottom-icon,.pm-ico');
  if(!ico){ico=document.createElement('span');ico.className='pm-bottom-icon';b.prepend(ico)}
  ico.innerHTML=iconForPage(page||labelFromButton(b));
 });
}

function iconizeButton(btn,icon){
 if(!btn||btn.querySelector('.pm-btn-icon'))return;
 btn.classList.add('pm-iconized');const i=document.createElement('span');i.className='pm-btn-icon';i.innerHTML=icon;btn.prepend(i);
}

function decorateActions(){
 document.querySelectorAll('button').forEach(b=>{
  const t=(b.textContent||'').trim().toLowerCase();
  if(t.includes('novo inventário')||t.includes('nova manutenção'))iconizeButton(b,I.plus);
  else if(t==='continuar'||t.includes('retomar'))iconizeButton(b,I.play);
  else if(t==='visualizar'||t.includes('abrir ficha'))iconizeButton(b,I.eye);
  else if(t==='pausar')iconizeButton(b,I.pause);
  else if(t.includes('relatório')||t.includes('imprimir')||t.includes('pdf'))iconizeButton(b,I.file);
  else if(t.includes('finalizar')||t.includes('concluir'))iconizeButton(b,I.check);
  else if(t.includes('conferir'))iconizeButton(b,I.scanner);
  else if(t.includes('localizar')||t.includes('buscar'))iconizeButton(b,I.search);
 });
}

function decorateInventorySummary(){
 const boxes=document.querySelectorAll('.inv16-sum-ico');
 const icons=[I.inventario,I.play,I.clock,I.alert];
 boxes.forEach((x,i)=>x.innerHTML=icons[i]||I.list);
}

function run(){css();decorateNav();decorateBottom();decorateActions();decorateInventorySummary()}
function install(){run();let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;run()})}).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,1900));else setTimeout(install,1900);
})();