(()=>{
'use strict';
if(window.__TDNGO_INDEX_FORCE_MODULES_V2__)return;window.__TDNGO_INDEX_FORCE_MODULES_V2__=true;
function mark(href){try{sessionStorage.setItem('tdngo_explicit_nav',Date.now()+'|'+href)}catch(e){}}
function session(){try{return JSON.parse(sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session')||'null')}catch(e){return null}}
function roleOf(s){return String(s?.role||s?.Role||'').trim().toLowerCase()}
function modsOf(s){const v=s?.modulos??s?.Modulos??s?.modules??[];return (Array.isArray(v)?v:String(v||'').split(',')).map(x=>String(x).trim().toLowerCase()).filter(Boolean)}
function fullRole(r){return ['desenvolvedor','developer','master'].includes(r)}
const defs=[
 {mod:'admin',href:'admin.html',ico:'⚙️',title:'Administração',desc:'Usuários, permissões, unidades, listas e auditoria.',cat:'gestao',search:'administracao administração admin usuarios usuários acessos permissões unidades auditoria',before:'[data-mod="contratos"]'},
 {mod:'risco',href:'risco.html',ico:'🏷️',title:'Classificação de Risco',desc:'Acompanhamento de risco, prioridade e tempos assistenciais.',cat:'assistencial',search:'risco classificacao classificação prioridade acolhimento tempos atendimento',before:'[data-mod="manutencao"]'}
];
function allowed(d){const s=session();if(!s)return false;const r=roleOf(s),mods=modsOf(s);if(fullRole(r))return true;if(d.mod==='admin')return r==='admin';if(d.mod==='risco')return r==='admin'||mods.includes('risco');return mods.includes(d.mod)}
function showCard(a,d){
 a.className='hub-card';a.dataset.mod=d.mod;a.dataset.cat=d.cat;a.dataset.search=((a.dataset.search||'')+' '+d.search).trim();a.href=d.href;a.hidden=false;
 a.removeAttribute('aria-hidden');a.style.display='grid';a.style.visibility='visible';a.style.opacity='1';
 a.onpointerdown=()=>mark(d.href);a.onkeydown=e=>{if(e.key==='Enter')mark(d.href)};
 a.innerHTML='<span class="hub-ico">'+d.ico+'</span><h3>'+d.title+'</h3><p>'+d.desc+'</p><span class="hub-tag ativo">Disponível</span>';
}
function hideCard(a){if(!a)return;a.hidden=true;a.setAttribute('aria-hidden','true');a.style.display='none';a.style.visibility='hidden';a.style.opacity='0'}
function ensure(d){const grid=document.getElementById('hub-grid');if(!grid)return;let a=grid.querySelector('[data-mod="'+d.mod+'"]');if(!allowed(d)){hideCard(a);return}if(!a){a=document.createElement('a');const ref=grid.querySelector(d.before);if(ref)grid.insertBefore(a,ref);else grid.appendChild(a)}showCard(a,d)}
function count(){const grid=document.getElementById('hub-grid');if(!grid)return;const n=[...grid.querySelectorAll('.hub-card')].filter(x=>x.dataset.mod!=='conta'&&!x.hidden&&getComputedStyle(x).display!=='none').length;document.querySelectorAll('.hub-section-sub').forEach(e=>{if(/módulos disponíveis|modulos disponiveis/i.test(e.textContent||''))e.textContent=n+' módulos disponíveis'})}
function run(){defs.forEach(ensure);count()}
run();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});setTimeout(run,100);setTimeout(run,700);setTimeout(run,1500);setInterval(run,3000);
})();
