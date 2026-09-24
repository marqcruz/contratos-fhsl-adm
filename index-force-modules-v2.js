(()=>{
'use strict';
if(window.__TDNGO_INDEX_FORCE_MODULES_V3__)return;window.__TDNGO_INDEX_FORCE_MODULES_V3__=true;
function mark(href){try{sessionStorage.setItem('tdngo_explicit_nav',Date.now()+'|'+href)}catch(e){}}
function currentRole(){try{const raw=sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session')||'{}';const u=JSON.parse(raw);return String(u?.role||u?.Role||'').toLowerCase()}catch(e){return''}}
function isAdmin(){return currentRole()==='admin'}
const defs=[
 {mod:'admin',href:'admin.html',ico:'⚙️',title:'Administração',desc:'Usuários, permissões, unidades, listas e auditoria.',cat:'gestao',search:'administracao administração admin usuarios usuários acessos permissões unidades auditoria',before:'[data-mod="contratos"]'}
];
function showCard(a,d){
 a.className='hub-card';a.dataset.mod=d.mod;a.dataset.cat=d.cat;a.dataset.search=((a.dataset.search||'')+' '+d.search).trim();a.href=d.href;a.hidden=false;
 a.removeAttribute('aria-hidden');a.style.display='grid';a.style.visibility='visible';a.style.opacity='1';
 a.onpointerdown=()=>mark(d.href);a.onkeydown=e=>{if(e.key==='Enter')mark(d.href)};
 a.innerHTML='<span class="hub-ico">'+d.ico+'</span><h3>'+d.title+'</h3><p>'+d.desc+'</p><span class="hub-tag ativo">Disponível</span>';
}
function ensure(d){const grid=document.getElementById('hub-grid');if(!grid)return;let a=grid.querySelector('[data-mod="'+d.mod+'"]');if(d.mod==='admin'&&!isAdmin()){if(a)a.remove();return}if(!a){a=document.createElement('a');const ref=grid.querySelector(d.before);if(ref)grid.insertBefore(a,ref);else grid.appendChild(a)}showCard(a,d)}
function removeWrongCards(){document.querySelectorAll('#hub-grid [data-mod="risco"],#hub-grid a[href="risco.html"]').forEach(x=>x.remove())}
function count(){const grid=document.getElementById('hub-grid');if(!grid)return;const n=[...grid.querySelectorAll('.hub-card')].filter(x=>x.dataset.mod!=='conta'&&getComputedStyle(x).display!=='none').length;document.querySelectorAll('.hub-section-sub').forEach(e=>{if(/módulos disponíveis|modulos disponiveis/i.test(e.textContent||''))e.textContent=n+' módulos disponíveis'})}
function run(){removeWrongCards();if(!isAdmin())document.querySelectorAll('#hub-grid [data-mod="admin"],#hub-grid a[href^="admin.html"]').forEach(x=>x.remove());defs.forEach(ensure);count()}
run();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});setTimeout(run,100);setTimeout(run,700);
})();