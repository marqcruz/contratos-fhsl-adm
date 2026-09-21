(()=>{
'use strict';
const ACCESS_API='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-admin-access-api';
const PROFILE_INFO={
  desenvolvedor:{nome:'Desenvolvedor',texto:'Perfil máximo do TDNGo. Uso restrito ao responsável técnico do sistema. Acessa todos os módulos, todas as unidades, configurações globais, segurança, usuários, auditoria e ajustes técnicos.'},
  admin:{nome:'Administrador',texto:'Administração operacional do TDNGo. Pode gerenciar usuários, módulos e unidades conforme autorização institucional, mas não deve ser usado como perfil técnico máximo do sistema.'},
  gestor:{nome:'Gestor',texto:'Perfil de coordenação/gerência. Pode operar, consultar, incluir e alterar informações nos módulos e unidades liberados. Não acessa configurações globais restritas.'},
  cadastros:{nome:'Gestor de cadastros',texto:'Voltado à manutenção de cadastros e rotinas administrativas. Pode incluir e atualizar registros nos módulos permitidos, sem acesso administrativo total.'},
  visualizador:{nome:'Visualizador',texto:'Perfil de consulta. Visualiza informações dos módulos e unidades autorizados, sem incluir, editar, excluir ou configurar.'}
};
let accessData={usuarios:[],unidades:[],links:[],modulos:[]};
let accessLoaded=false;
function escU(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function myRole(){return String(me?.role||me?.Role||'').toLowerCase()}
function canManageAccess(){return ['desenvolvedor','developer','master','admin'].includes(myRole())}
function isFullRole(r){return ['desenvolvedor','developer','master'].includes(String(r||'').toLowerCase())}
function addStyle(){
  if(document.getElementById('tdngo-unified-access-style'))return;
  const s=document.createElement('style');s.id='tdngo-unified-access-style';s.textContent=`
  .ua-profile-guide{border:1px solid var(--border);background:var(--surface2);border-radius:10px;padding:11px 12px;font-size:12px;line-height:1.55}.ua-profile-guide b{display:block;margin-bottom:3px;color:var(--text)}
  .ua-guide{border:1px solid var(--border);background:var(--surface);border-radius:11px;padding:14px;margin-bottom:15px}.ua-guide-title{font-size:13px;font-weight:800;margin-bottom:9px}.ua-guide-grid{display:grid;grid-template-columns:repeat(5,minmax(150px,1fr));gap:8px}.ua-guide-item{background:var(--surface2);border-radius:8px;padding:9px 10px}.ua-guide-item b{display:block;font-size:11px;margin-bottom:3px}.ua-guide-item span{font-size:10px;color:var(--muted);line-height:1.4;display:block}
  .ua-intro{font-size:11px;color:var(--muted);line-height:1.5;margin:2px 0 9px}.ua-grid{display:flex;flex-direction:column;gap:8px}.ua-row{border:1px solid var(--border);border-radius:9px;background:var(--surface2);padding:9px 11px}.ua-row.off{opacity:.72}.ua-head{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:750}.ua-head input,.ua-units input{width:auto}.ua-units{display:flex;flex-wrap:wrap;gap:6px 11px;margin:8px 0 0 23px;padding-top:8px;border-top:1px dashed var(--border)}.ua-units label{margin:0;text-transform:none;font-size:11px;font-weight:550;display:flex;align-items:center;gap:5px;color:var(--muted)}.ua-row.off .ua-units{opacity:.42}.ua-admin{border:1px solid rgba(63,185,80,.35);background:rgba(63,185,80,.08);color:var(--green);border-radius:9px;padding:11px;font-size:12px;line-height:1.5}.ua-warning{border:1px solid rgba(210,153,34,.4);background:rgba(210,153,34,.08);color:var(--yellow);border-radius:8px;padding:8px 10px;font-size:11px;margin-bottom:8px}.ua-no-units{font-size:10px;color:var(--muted)}#mu .modal{width:min(900px,96vw)}
  @media(max-width:1150px){.ua-guide-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.ua-guide-grid{grid-template-columns:1fr}.ua-units{margin-left:0}}
  `;document.head.appendChild(s);
}
async function accessPost(body){return post(ACCESS_API,body)}
async function loadAccess(force=false){
  if(accessLoaded&&!force)return accessData;
  if(!canManageAccess()){
    accessData={usuarios:[],unidades:(units||[]).map(u=>({id:u.Uuid||u.ID,nome:u.Nome,tipo:u.Tipo})),links:[],modulos:(modules||[]).map(m=>m[0])};accessLoaded=true;return accessData;
  }
  const r=await accessPost({action:'accessOverview'});accessData=r.data||{usuarios:[],unidades:[],links:[],modulos:[]};accessLoaded=true;return accessData;
}
function currentAccessUser(u){
  if(!u)return null;
  return accessData.usuarios.find(x=>String(x.id)===String(u.Uuid||''))||accessData.usuarios.find(x=>String(x.legacy_id||'')===String(u.ID||''))||null;
}
function roleGuide(){
  const el=document.getElementById('ua-profile-guide');if(!el)return;
  const v=String(document.getElementById('uperfil')?.value||'visualizador').toLowerCase();
  const x=PROFILE_INFO[v]||PROFILE_INFO.visualizador;
  el.innerHTML='<b>'+escU(x.nome)+'</b>'+escU(x.texto);
}
function toggleModule(mod){
  const row=document.querySelector('[data-ua-row="'+CSS.escape(mod)+'"]');if(!row)return;
  const on=!!row.querySelector('.ua-mod')?.checked;row.classList.toggle('off',!on);
  row.querySelectorAll('.ua-unit').forEach(c=>c.disabled=!on||!canManageAccess());
}
function renderAccessMatrix(){
  roleGuide();
  const modbox=document.getElementById('modbox'),adminInfo=document.getElementById('ua-admin-info'),role=String(document.getElementById('uperfil')?.value||'visualizador').toLowerCase();
  const full=isFullRole(role);
  if(modbox)modbox.style.display=full?'none':'block';if(adminInfo)adminInfo.style.display=full?'block':'none';
  if(full)return;
  const u=(users||[]).find(x=>String(x.ID)===String(document.getElementById('uid')?.value||''));
  const au=currentAccessUser(u),uuid=au?.id||u?.Uuid||'';
  const selected=String(u?.Modulos||'').split(',').map(x=>x.trim()).filter(Boolean);
  const warning=document.getElementById('ua-warning');
  if(warning){const legacy=!!u&&!isFullRole(u.Role)&&!selected.length;warning.style.display=legacy?'block':'none';warning.textContent=legacy?'Atenção: este cadastro antigo não possui módulos explícitos. Antes de salvar, selecione ao menos um módulo para evitar permissão ambígua.':''}
  const list=(accessData.unidades?.length?accessData.unidades:(units||[]).map(x=>({id:x.Uuid||x.ID,nome:x.Nome,tipo:x.Tipo})));
  const modsEl=document.getElementById('mods');if(!modsEl)return;
  modsEl.className='ua-grid';
  modsEl.innerHTML=(modules||[]).map(m=>{
    const mod=m[0],enabled=selected.includes(mod);
    const linked=new Set((accessData.links||[]).filter(l=>String(l.usuario_id)===String(uuid)&&String(l.modulo)===String(mod)).map(l=>String(l.unidade_id)));
    const unitHtml=list.length?list.map(n=>'<label><input type="checkbox" class="ua-unit" data-mod="'+escU(mod)+'" value="'+escU(n.id)+'" '+(linked.has(String(n.id))?'checked':'')+' '+(enabled&&canManageAccess()?'':'disabled')+'>'+escU(n.nome)+'</label>').join(''):'<span class="ua-no-units">Nenhuma unidade ativa cadastrada.</span>';
    return '<div class="ua-row '+(enabled?'':'off')+'" data-ua-row="'+escU(mod)+'"><div class="ua-head"><input type="checkbox" class="mck ua-mod" value="'+escU(mod)+'" '+(enabled?'checked':'')+' '+(canManageAccess()?'':'disabled')+'><span>'+m[1]+'</span></div><div class="ua-units">'+unitHtml+'</div></div>';
  }).join('');
  modsEl.querySelectorAll('.ua-mod').forEach(c=>c.addEventListener('change',()=>toggleModule(c.value)));
}
function patchDom(){
  const qu=document.getElementById('qu');
  if(qu){
    qu.setAttribute('type','search');
    qu.setAttribute('name','tdngo_admin_user_search');
    qu.setAttribute('autocomplete','off');
    qu.setAttribute('data-lpignore','true');
    qu.setAttribute('data-1p-ignore','true');
  }
  addStyle();
  document.querySelectorAll('a[href="acessos.html"],a[href^="acessos.html?"]').forEach(a=>a.remove());
  const nav=document.querySelector('[data-page="usuarios"]');if(nav)nav.textContent='👤 Usuários e acessos';
  const page=document.getElementById('p-usuarios');
  if(page&&!document.getElementById('ua-guide')){
    const guide=document.createElement('div');guide.id='ua-guide';guide.className='ua-guide';guide.innerHTML='<div class="ua-guide-title">Perfis de acesso</div><div class="ua-guide-grid">'+Object.values(PROFILE_INFO).map(v=>'<div class="ua-guide-item"><b>'+escU(v.nome)+'</b><span>'+escU(v.texto)+'</span></div>').join('')+'</div>';
    const toolbar=page.querySelector('.toolbar');if(toolbar)page.insertBefore(guide,toolbar);
  }
  const prof=document.getElementById('uperfil');
  if(prof){
    if(![...prof.options].some(o=>o.value==='desenvolvedor')){const o=document.createElement('option');o.value='desenvolvedor';o.textContent='Desenvolvedor';prof.insertBefore(o,prof.firstChild)}
    const adm=[...prof.options].find(o=>o.value==='admin');if(adm)adm.textContent='Administrador';
    if(!prof.dataset.uaBound){prof.dataset.uaBound='1';prof.addEventListener('change',renderAccessMatrix)}
  }
  const modbox=document.getElementById('modbox');
  if(modbox&&!document.getElementById('ua-profile-guide')){
    const guideWrap=document.createElement('div');guideWrap.className='full';guideWrap.innerHTML='<label>O que este perfil pode fazer?</label><div class="ua-profile-guide" id="ua-profile-guide"></div>';
    modbox.parentNode.insertBefore(guideWrap,modbox);
    modbox.innerHTML='<label>Módulos e unidades permitidas</label><div class="ua-intro">Marque os módulos que o usuário poderá acessar e, dentro de cada módulo, as unidades autorizadas. O perfil Desenvolvedor dispensa marcação porque tem acesso total ao TDNGo.</div><div class="ua-warning" id="ua-warning" style="display:none"></div><div id="mods" class="ua-grid"></div>';
    const adminWrap=document.createElement('div');adminWrap.className='full';adminWrap.id='ua-admin-info';adminWrap.style.display='none';adminWrap.innerHTML='<div class="ua-admin"><b>Desenvolvedor:</b> acesso total ao TDNGo. Não é necessário selecionar módulos ou unidades.</div>';modbox.parentNode.insertBefore(adminWrap,modbox.nextSibling);
  }
  const ths=[...document.querySelectorAll('#p-usuarios th')];const th=ths.find(x=>x.textContent.trim()==='Módulos');if(th)th.textContent='Acessos';
}

window.openUser=async function(id=''){
  patchDom();
  const filtro=document.getElementById('qu');
  const filtroAtual=filtro?.value||'';
  const filtroManual=filtro?.dataset.userTyped||'';
  try{await loadAccess()}catch(e){toast('Não foi possível carregar unidades e módulos: '+e.message,'err');return}
  const u=(users||[]).find(x=>String(x.ID)===String(id));
  uid.value=id;unome.value=u?.Nome||'';uemail.value=u?.Email||'';upass.value='';uperfil.value=u?.Role||'visualizador';uativo.value=bool(u?.Ativo??true)?'true':'false';
  renderAccessMatrix();mu.classList.add('open');
  queueMicrotask(()=>{if(filtro){filtro.value=filtroAtual;if(filtroManual)filtro.dataset.userTyped=filtroManual}});
};
window.renderMods=renderAccessMatrix;

window.saveUser=async function(){
  const role=String(uperfil.value||'visualizador').toLowerCase();
  const old=(users||[]).find(x=>String(x.ID)===String(uid.value));
  const oldMods=String(old?.Modulos||'').split(',').map(x=>x.trim()).filter(Boolean);
  const selected=isFullRole(role)?[]:[...document.querySelectorAll('.ua-mod:checked')].map(x=>x.value);
  if(canManageAccess()&&!isFullRole(role)&&!selected.length){toast('Selecione ao menos um módulo para este usuário.','err');return}
  const p={ID:uid.value,Nome:unome.value.trim(),Email:uemail.value.trim(),Senha:upass.value,Role:role,Ativo:uativo.value==='true',Modulos:isFullRole(role)?'':(canManageAccess()?selected.join(','):(old?.Modulos||''))};
  try{
    const saved=await post(ADMIN,{action:'saveuser',...p});
    const internalId=saved.id||old?.Uuid||currentAccessUser(old)?.id||'';
    if(canManageAccess()&&internalId){
      const syncMods=[...new Set([...oldMods,...selected])];
      for(const mod of syncMods){
        const enabled=!isFullRole(role)&&selected.includes(mod);
        const ids=enabled?[...document.querySelectorAll('.ua-unit[data-mod="'+CSS.escape(mod)+'"]:checked')].map(x=>x.value):[];
        await accessPost({action:'saveModuleAccess',usuario_id:internalId,modulo:mod,habilitado:enabled,unidade_ids:ids});
      }
    }
    closeM('mu');toast('Usuário, perfil e acessos salvos.');accessLoaded=false;await loadAll();
  }catch(e){toast(e.message||'Falha ao salvar usuário e acessos.','err')}
};

const oldLoadAll=window.loadAll;
if(typeof oldLoadAll==='function')window.loadAll=async function(){await oldLoadAll();accessLoaded=false;try{await loadAccess()}catch(e){if(canManageAccess())toast('Falha ao atualizar acessos: '+e.message,'err')}patchDom()};

patchDom();
setTimeout(async()=>{patchDom();if(canManageAccess()){try{await loadAccess()}catch(e){}}},250);
})();