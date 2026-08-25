(()=>{
function apply(){
  if(/(^|\/)index\.html$/i.test(location.pathname)||location.pathname.endsWith('/'))return;
  const anchors=[...document.querySelectorAll('a')];
  const buttons=[...document.querySelectorAll('button')];
  let found=false;
  for(const a of anchors){
    const href=(a.getAttribute('href')||'').trim();
    const text=(a.textContent||'').trim().toLowerCase();
    const legacy=/history\.back|javascript:\s*(window\.)?history/i.test(href);
    if(a.classList.contains('home')||legacy){a.setAttribute('href','index.html');a.removeAttribute('onclick');if(a.classList.contains('home'))a.textContent='← Voltar ao TDNGo';found=true;continue}
    if((href==='index.html'||href==='./index.html')&&(text.includes('tdngo')||text.includes('voltar'))){found=true}
  }
  for(const b of buttons){
    const oc=(b.getAttribute('onclick')||'');
    if(/history\.back\s*\(/i.test(oc)){b.removeAttribute('onclick');b.addEventListener('click',()=>location.href='index.html');if(/voltar/i.test(b.textContent||''))b.textContent='← Voltar ao TDNGo';found=true}
  }
  if(!found){
    const a=document.createElement('a');a.href='index.html';a.id='tdngo-global-back';a.textContent='← Voltar ao TDNGo';
    Object.assign(a.style,{position:'fixed',left:'12px',bottom:'12px',zIndex:'9998',textDecoration:'none',color:'#e6edf3',background:'#161b22',border:'1px solid #2a3140',borderRadius:'10px',padding:'8px 11px',font:'600 11px system-ui,-apple-system,"Segoe UI",sans-serif',boxShadow:'0 6px 24px rgba(0,0,0,.3)'});
    document.body.appendChild(a);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();