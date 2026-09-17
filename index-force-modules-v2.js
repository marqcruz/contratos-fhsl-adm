(()=>{
'use strict';
if(window.__TDNGO_INDEX_FORCE_MODULES_V4__)return;window.__TDNGO_INDEX_FORCE_MODULES_V4__=true;
const READY='tdngo-hub-ready';
function mark(href){try{sessionStorage.setItem('tdngo_explicit_nav',Date.now()+'|'+href)}catch(e){}}
function session(){try{return JSON.parse(sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session')||'null')}catch(e){return null}}
function roleOf(s){return String(s?.role||s?.Role||'').trim().toLowerCase()}
function modsOf(s){const v=s?.modulos??s?.Modulos??s?.modules??[];return (Array.isArray(v)?v:String(v||'').split(',')).map(x=>String(x).trim().toLowerCase()).filter(Boolean)}
function fullRole(r){return ['desenvolvedor','developer','master'].includes(r)}
function installCloak(){if(document.getElementById('tdngo-hub-stability-css'))return;const st=document.createElement('style');st.id='tdngo-hub-stability-css';st.textContent=`html:not(.${READY}) #hub-grid{visibility:hidden!important;opacity:0!important}html.${READY} #hub-grid{visibility:visible!important;opacity:1!important;transition:opacity .12s ease}.hub-card[hidden]{display:none!important}`;document.head.appendChild(st)}
installCloak();
const defs=[
 {mod:'admin',href:'admin.html',ico:'⚙️',title:'Administração',desc:'Usuários, permissões, unidades, listas e auditoria.',cat:'gestao',search:'administracao administração admin usuarios usuários acessos permissões unidades auditoria',before:'[data-mod="contratos"]'},
 {mod:'risco',href:'risco.html',ico:'🏷️',title:'Classificação de Risco',desc:'Acompanhamento de risco, prioridade e tempos assistenciais.',cat:'assistencial',search:'risco classificacao classificação prioridade acolhimento tempos atendimento',before:'[data-mod="manutencao"]'}
];
function allowed(d){const s=session();if(!s)return false;const r=roleOf(s),mods=modsOf(s);if(fullRole(r))return true;if(d.mod==='admin')return r==='admin';if(d.mod==='risco')return r==='admin'||mods.includes('risco');return mods.includes(d.mod)}
function showCard(a,d){a.className='hub-card';a.dataset.mod=d.mod;a.dataset.cat=d.cat;a.dataset.search=((a.dataset.search||'')+' '+d.search).trim();a.href=d.href;a.hidden=false;a.removeAttribute('aria-hidden');a.style.removeProperty('display');a.style.removeProperty('visibility');a.style.removeProperty('opacity');a.onpointerdown=()=>mark(d.href);a.onkeydown=e=>{if(e.key==='Enter')mark(d.href)};a.innerHTML='<span class="hub-ico">'+d.ico+'</span><h3>'+d.title+'</h3><p>'+d.desc+'</p><span class="hub-tag ativo">Disponível</span>'}
function hideCard(a){if(!a)return;a.hidden=true;a.setAttribute('aria-hidden','true')}
function ensure(d){const grid=document.getElementById('hub-grid');if(!grid)return;let a=grid.querySelector('[data-mod="'+d.mod+'"]');if(!allowed(d)){hideCard(a);return}if(!a){a=document.createElement('a');const ref=grid.querySelector(d.before);if(ref)grid.insertBefore(a,ref);else grid.appendChild(a)}showCard(a,d)}
function applyAllPermissions(){const s=session();if(!s)return;const r=roleOf(s),mods=modsOf(s);document.querySelectorAll('#hub-grid .hub-card[data-mod]').forEach(a=>{const m=String(a.dataset.mod||'').toLowerCase();if(m==='conta')return;let ok=fullRole(r)||r==='admin';if(!ok)ok=mods.includes(m);if(m==='admin'&&!fullRole(r))ok=r==='admin';if(m==='risco'&&!fullRole(r))ok=r==='admin'||mods.includes('risco');if(!ok)hideCard(a);else{a.hidden=false;a.removeAttribute('aria-hidden')}})}
function count(){const grid=document.getElementById('hub-grid');if(!grid)return;const n=[...grid.querySelectorAll('.hub-card')].filter(x=>x.dataset.mod!=='conta'&&!x.hidden).length;document.querySelectorAll('.hub-section-sub').forEach(e=>{if(/módulos disponíveis|modulos disponiveis/i.test(e.textContent||''))e.textContent=n+' módulos disponíveis'})}
function reveal(){requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.add(READY)))}
function showLogin(){document.documentElement.classList.remove(READY);const login=document.querySelector('.login-screen,#login-screen,.login-overlay');const app=document.querySelector('.app,.hub-wrap,#app,#hub-app');if(login){login.style.display='flex';login.style.visibility='visible';login.classList.remove('hide','hidden')}if(app){app.style.display='none';app.classList.add('hide')}}
function run(){const s=session();if(!s){showLogin();return}defs.forEach(ensure);applyAllPermissions();count();reveal()}
function hardLogout(){try{sessionStorage.removeItem('fhsl_session');localStorage.removeItem('fhsl_session');sessionStorage.removeItem('tdngo_explicit_nav');sessionStorage.removeItem('tdngo_session_message')}catch{}try{window.currentUser=null}catch{}showLogin();try{history.replaceState({tdngo:'logout'},'',location.pathname)}catch{}}
window.doLogout=hardLogout;window.logout=hardLogout;window.sair=hardLogout;
document.addEventListener('click',e=>{const b=e.target?.closest?.('.user-logout,.logout,.btn-logout,[data-logout],[title="Sair"],[aria-label="Sair"]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();hardLogout()},true);
window.addEventListener('pageshow',()=>{if(session())run();else showLogin()},{passive:true});
run();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});setTimeout(run,80);setTimeout(run,350);setTimeout(run,900);
})();
