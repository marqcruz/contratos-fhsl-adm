(()=>{
'use strict';
if(window.__TDNGO_ADMIN_MASTER_V1__)return;window.__TDNGO_ADMIN_MASTER_V1__=true;
const DEV_ROLES=new Set(['desenvolvedor','developer','master']);
function normalizeSession(){
  for(const store of [sessionStorage,localStorage]){try{const raw=store.getItem('fhsl_session');if(!raw)continue;const s=JSON.parse(raw);if(DEV_ROLES.has(String(s?.role||s?.Role||'').toLowerCase())){s.role='admin';if('Role'in s)s.Role='admin';store.setItem('fhsl_session',JSON.stringify(s));}}catch{}}
  try{if(typeof me!=='undefined'&&me&&DEV_ROLES.has(String(me.role||me.Role||'').toLowerCase())){me.role='admin';if('Role'in me)me.Role='admin';}}catch{}
}
function forceLight(){
  try{localStorage.setItem('tdngo_theme','light')}catch{}
  if(document.body){document.body.dataset.theme='light';document.body.classList.remove('dark','theme-dark')}
  document.documentElement.style.colorScheme='light';
  document.querySelectorAll('[onclick="theme()"],[onclick*="toggleTheme"],.theme,.theme-toggle,.theme-btn').forEach(x=>x.remove());
}
function patchProfiles(){
  const sel=document.getElementById('uperfil');
  if(sel){[...sel.options].forEach(o=>{if(DEV_ROLES.has(String(o.value||'').toLowerCase()))o.remove()});const adm=[...sel.options].find(o=>o.value==='admin');if(adm)adm.textContent='Administrador';}
  document.querySelectorAll('.ua-guide-item').forEach(card=>{const b=card.querySelector('b');if(/desenvolvedor/i.test(b?.textContent||''))card.remove()});
  const guide=[...document.querySelectorAll('.ua-guide-item')].find(card=>/administrador/i.test(card.querySelector('b')?.textContent||''));
  if(guide){const span=guide.querySelector('span'),txt='Perfil master do TDNGo. Possui acesso total aos módulos, unidades, usuários, auditoria, segurança e configurações globais do sistema.';if(span&&span.textContent!==txt)span.textContent=txt;}
  const intro=document.querySelector('.ua-intro'),introTxt='Marque os módulos e unidades dos perfis que possuem acesso limitado. O Administrador é o perfil master e possui acesso total ao TDNGo.';if(intro&&intro.textContent!==introTxt)intro.textContent=introTxt;
  const roleGuide=document.getElementById('ua-profile-guide');if(roleGuide&&String(sel?.value||'').toLowerCase()==='admin')roleGuide.innerHTML='<b>Administrador</b>Perfil master do TDNGo. Possui acesso total aos módulos, unidades, usuários, auditoria, segurança e configurações globais do sistema.';
  const modbox=document.getElementById('modbox'),info=document.getElementById('ua-admin-info');
  if(String(sel?.value||'').toLowerCase()==='admin'){
    if(modbox)modbox.style.display='none';
    if(info){info.style.display='block';const h='<div class="ua-admin"><b>Administrador:</b> perfil master do TDNGo. O acesso é total e não depende da seleção de módulos ou unidades.</div>';if(info.innerHTML!==h)info.innerHTML=h;}
  }else{
    if(modbox)modbox.style.display='block';
    if(info)info.style.display='none';
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
window.theme=function(){forceLight()};

const oldOpenUser=window.openUser;
if(typeof oldOpenUser==='function')window.openUser=function(){
  const r=oldOpenUser.apply(this,arguments);
  queueMicrotask(patchDom);
  return r;
};
const oldRenderMods=window.renderMods;
if(typeof oldRenderMods==='function')window.renderMods=function(){
  const r=oldRenderMods.apply(this,arguments);
  queueMicrotask(patchProfiles);
  return r;
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchDom,{once:true});else patchDom();
setTimeout(patchDom,200);setTimeout(patchDom,800);
})();