(()=>{
'use strict';
if(window.__TDNGO_ADMIN_MASTER_V2__)return;window.__TDNGO_ADMIN_MASTER_V2__=true;
const DEV_ROLES=new Set(['desenvolvedor','developer','master']);
function normalizeSession(){
  for(const store of [sessionStorage,localStorage]){try{const raw=store.getItem('fhsl_session');if(!raw)continue;const s=JSON.parse(raw);if(DEV_ROLES.has(String(s?.role||s?.Role||'').toLowerCase())){s.role='admin';if('Role'in s)s.Role='admin';store.setItem('fhsl_session',JSON.stringify(s));}}catch{}}
  try{if(typeof me!=='undefined'&&me&&DEV_ROLES.has(String(me.role||me.Role||'').toLowerCase())){me.role='admin';if('Role'in me)me.Role='admin';}}catch{}
}
function forceLight(){
  try{localStorage.setItem('tdngo_theme','light')}catch{}
  if(document.body){if(document.body.dataset.theme!=='light')document.body.dataset.theme='light';document.body.classList.remove('dark','theme-dark')}
  if(document.documentElement.style.colorScheme!=='light')document.documentElement.style.colorScheme='light';
  document.querySelectorAll('[onclick="theme()"],[onclick*="toggleTheme"],.theme,.theme-toggle,.theme-btn').forEach(x=>x.remove());
}
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
function patchProfiles(){
  const sel=document.getElementById('uperfil');
  if(sel){
    [...sel.options].forEach(o=>{if(DEV_ROLES.has(String(o.value||'').toLowerCase()))o.remove()});
    const adm=[...sel.options].find(o=>o.value==='admin');if(adm&&adm.textContent!=='Administrador')adm.textContent='Administrador';
    if(!sel.dataset.adminMasterBound){sel.dataset.adminMasterBound='1';sel.addEventListener('change',()=>setTimeout(patchDom,0));}
  }
  document.querySelectorAll('.ua-guide-item').forEach(card=>{const b=card.querySelector('b');if(/desenvolvedor/i.test(b?.textContent||''))card.remove()});
  const guide=[...document.querySelectorAll('.ua-guide-item')].find(card=>/administrador/i.test(card.querySelector('b')?.textContent||''));
  if(guide){const span=guide.querySelector('span');setText(span,'Perfil master do TDNGo. Possui acesso total aos módulos, unidades, usuários, auditoria, segurança e configurações globais do sistema.');}
  const intro=document.querySelector('.ua-intro');setText(intro,'Marque os módulos e unidades dos perfis que possuem acesso limitado. O Administrador é o perfil master e possui acesso total ao TDNGo.');
  const role=String(sel?.value||'').toLowerCase(),roleGuide=document.getElementById('ua-profile-guide');
  if(roleGuide&&role==='admin'){
    const desired='<b>Administrador</b>Perfil master do TDNGo. Possui acesso total aos módulos, unidades, usuários, auditoria, segurança e configurações globais do sistema.';
    if(roleGuide.innerHTML!==desired)roleGuide.innerHTML=desired;
  }
  const modbox=document.getElementById('modbox'),info=document.getElementById('ua-admin-info');
  if(role==='admin'){
    if(modbox&&modbox.style.display!=='none')modbox.style.display='none';
    if(info){if(info.style.display!=='block')info.style.display='block';const desired='<div class="ua-admin"><b>Administrador:</b> perfil master do TDNGo. O acesso é total e não depende da seleção de módulos ou unidades.</div>';if(info.innerHTML!==desired)info.innerHTML=desired;}
  }else{
    if(modbox&&modbox.style.display==='none')modbox.style.display='block';
    if(info&&info.style.display!=='none')info.style.display='none';
  }
}
function patchDom(){normalizeSession();forceLight();patchProfiles();}
normalizeSession();
const oldSave=window.saveUser;
window.saveUser=async function(){
  try{
    const role=String(document.getElementById('uperfil')?.value||'visualizador').toLowerCase();
    if(role!=='admin')return typeof oldSave==='function'?oldSave():undefined;
    const allMods=(typeof modules!=='undefined'&&Array.isArray(modules)?modules.map(m=>m[0]):[]).join(',');
    const p={ID:uid.value,Nome:unome.value.trim(),Email:uemail.value.trim(),Senha:upass.value,Role:'admin',Ativo:uativo.value==='true',Modulos:allMods};
    await post(ADMIN,{action:'saveuser',...p});
    closeM('mu');toast('Usuário salvo como Administrador (master).');
    if(typeof loadAll==='function')await loadAll();
  }catch(e){toast(e.message||'Falha ao salvar usuário.','err')}
};
const oldOpenUser=window.openUser;
if(typeof oldOpenUser==='function')window.openUser=async function(...args){const r=await oldOpenUser(...args);patchDom();setTimeout(patchDom,30);return r};
window.theme=function(){forceLight()};
function init(){patchDom();setTimeout(patchDom,200);setTimeout(patchDom,900);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
