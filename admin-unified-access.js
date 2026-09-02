(()=>{
'use strict';
const ACCESS_API='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-admin-access-api';
const PROFILE_INFO={
  admin:{nome:'Administrador',texto:'Acesso total ao TDNGo, incluindo Administração, configuração global, usuários e ações exclusivas de administrador. Não depende da seleção de módulos ou unidades.'},
  gestor:{nome:'Gestor',texto:'Pode operar, incluir e alterar informações nos módulos e unidades autorizados. Ações exclusivas de administrador, como gestão global de acessos e determinadas exclusões, permanecem bloqueadas.'},
  cadastros:{nome:'Gestor de cadastros',texto:'Voltado à manutenção de cadastros e rotinas administrativas permitidas. Pode incluir ou editar onde o módulo aceitar este perfil, mas não recebe automaticamente acesso total de administrador.'},
  visualizador:{nome:'Visualizador',texto:'Perfil de consulta. Pode visualizar as informações dos módulos e unidades autorizados, sem permissão operacional de inclusão ou alteração quando o módulo aplica controle de escrita.'}
};
let accessData={usuarios:[],unidades:[],links:[],modulos:[]};
let accessLoaded=false;

function escU(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function addStyle(){
  if(document.getElementById('tdngo-unified-access-style'))return;
  const s=document.createElement('style');s.id='tdngo-unified-access-style';s.textContent=`
  .ua-profile-guide{border:1px solid var(--border);background:var(--surface2);border-radius:10px;padding:11px 12px;font-size:12px;line-height:1.55}.ua-profile-guide b{display:block;margin-bottom:3px;color:var(--text)}
  .ua-guide{border:1px solid var(--border);background:var(--surface);border-radius:11px;padding:14px;margin-bottom:15px}.ua-guide-title{font-size:13px;font-weight:800;margin-bottom:9px}.ua-guide-grid{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:8px}.ua-guide-item{background:var(--surface2);border-radius:8px;padding:9px 10px}.ua-guide-item b{display:block;font-size:11px;margin-bottom:3px}.ua-guide-item span{font-size:10px;color:var(--muted);line-height:1.4;display:block}
  .ua-intro{font-size:11px;color:var(--muted);line-height:1.5;margin:2px 0 9px}.ua-grid{display:flex;flex-direction:column;gap:8px}.ua-row{border:1px solid var(--border);border-radius:9px;background:var(--surface2);padding:9px 11px}.ua-row.off{opacity:.72}.ua-head{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:750}.ua-head input,.ua-units input{width:auto}.ua-units{display:flex;flex-wrap:wrap;gap:6px 11px;margin:8px 0 0 23px;padding-top:8px;border-top:1px dashed var(--border)}.ua-units label{margin:0;text-transform:none;font-size:11px;font-weight:550;display:flex;align-items:center;gap:5px;color:var(--muted)}.ua-row.off .ua-units{opacity:.42}.ua-admin{border:1px solid rgba(63,185,80,.35);background:rgba(63,185,80,.08);color:var(--green);border-radius:9px;padding:11px;font-size:12px;line-height:1.5}.ua-warning{border:1px solid rgba(210,153,34,.4);background:rgba(210,153,34,.08);color:var(--yellow);border-radius:8px;padding:8px 10px;font-size:11px;margin-bottom:8px}.ua-no-units{font-size:10px;color:var(--muted)}#mu .modal{width:min(900px,96vw)}
  @media(max-width:900px){.ua-guide-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.ua-guide-grid{grid-template-columns:1fr}.ua-units{margin-left:0}}
  `;document.head.appendChild(s);
}
async function accessPost(body){return post(ACCESS_API,body)}
async function loadAccess(force=false){
  if(accessLoaded&&!force)return accessData;
  if(!me||me.role!=='admin'){
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
  const x=PROFILE_INFO[document.getElementById('uperfil')?.value]||PROFILE_INFO.visualizador;
  el.innerHTML='<b>'+escU(x.nome)+'</b>'+escU(x.texto);
}
function toggleModule(mod){
  const row=document.querySelector('[data-ua-row="'+CSS.escape(mod)+'"]');if(!row)return;
  const on=!!row.querySelector('.ua-mod')?.checked;row.classList.toggle('off',!on);
  row.querySelectorAll('.ua-unit').forEach(c=>c.disabled=!on||me.role!=='admin');
}
function renderAccessMatrix(){
  roleGuide();
  const modbox=document.getElementById('modbox'),adminInfo=document.getElementById('ua-admin-info'),role=document.getElementById('uperfil')?.value||'visualizador';
  if(modbox)modbox.style.display=role==='admin'?'none':'block';if(adminInfo)adminInfo.style.display=role==='admin'?'block':'none';
  if(role==='admin')return;
  const u=(users||[]).find(x=>String(x.ID)===String(document.getElementById('uid')?.value||''));
  const au=currentAccessUser(u),uuid=au?.id||u?.Uuid||'';
  const selected=String(u?.Modulos||'').split(',').map(x=>x.trim()).filter(Boolean);
  const warning=document.getElementById('ua-warning');
  if(warning){const legacy=!!u&&u.Role!=='admin'&&!selected.length;warning.style.display=legacy?'block':'none';warning.textContent=legacy?'Atenção: este cadastro antigo não possui módulos explícitos. Antes de salvar, selecione ao menos um módulo para evitar uma permissão ambígua.':''}
  const list=(accessData.unidades?.length?accessData.unidades:(units||[]).map(x=>({id:x.Uuid||x.ID,nome:x.Nome,tipo:x.Tipo})));
  const modsEl=document.getElementById('mods');if(!modsEl)return;
  modsEl.className='ua-grid';
  modsEl.innerHTML=(modules||[]).map(m=>{
    const mod=m[0],enabled=selected.includes(mod);
    const linked=new Set((accessData.links||[]).filter(l=>String(l.usuario_id)===String(uuid)&&String(l.modulo)===String(mod)).map(l=>String(l.unidade_id)));
    const unitHtml=list.length?list.map(n=>'<label><input type="checkbox" class="ua-unit" data-mod="'+escU(mod)+'" value="'+escU(n.id)+'" '+(linked.has(String(n.id))?'checked':'')+' '+(enabled&&me.role==='admin'?'':'disabled')+'>'+escU(n.nome)+'</label>').join(''):'<span class="ua-no-units">Nenhuma unidade ativa cadastrada.</span>';
    return '<div class="ua-row '+(enabled?'':'off')+'" data-ua-row="'+escU(mod)+'"><div class="ua-head"><input type="checkbox" class="mck ua-mod" value="'+escU(mod)+'" '+(enabled?'checked':'')+' '+(me.role==='admin'?'':'disabled')+'><span>'+m[1]+'</span></div><div class="ua-units">'+unitHtml+'</div></div>';
  }).join('');
  modsEl.querySelectorAll('.ua-mod').forEach(c=>c.addEventListener('change',()=>toggleModule(c.value)));
}
function patchDom(){
  addStyle();
  document.querySelectorAll('a[href="acessos.html"],a[href^="acessos.html?"]').forEach(a=>a.remove());
  const nav=document.querySelector('[data-page="usuarios"]');if(nav)nav.textContent='👤 Usuários e acessos';
  const page=document.getElementById('p-usuarios');
  if(page&&!document.getElementById('ua-guide')){
    const guide=document.createElement('div');guide.id='ua-guide';guide.className='ua-guide';guide.innerHTML='<div class="ua-guide-title">Perfis de acesso</div><div class="ua-guide-grid">'+Object.values(PROFILE_INFO).map(v=>'<div class="ua-guide-item"><b>'+escU(v.nome)+'</b><span>'+escU(v.texto)+'</span></div>').join('')+'</div>';
    const toolbar=page.querySelector('.toolbar');if(toolbar)page.insertBefore(guide,toolbar);
  }
  const modbox=document.getElementById('modbox');
  if(modbox&&!document.getElementById('ua-profile-guide')){
    const guideWrap=document.createElement('div');guideWrap.className='full';guideWrap.innerHTML='<label>O que este perfil pode fazer?</label><div class="ua-profile-guide" id="ua-profile-guide"></div>';
    modbox.parentNode.insertBefore(guideWrap,modbox);
    modbox.innerHTML='<label>Módulos e unidades permitidas</label><div class="ua-intro">Marque os módulos que o usuário poderá acessar e, dentro de cada módulo, as unidades autorizadas. As regras específicas de cada módulo continuam sendo aplicadas normalmente.</div><div class="ua-warning" id="ua-warning" style="display:none"></div><div id="mods" class="ua-grid"></div>';
    const adminWrap=document.createElement('div');adminWrap.className='full';adminWrap.id='ua-admin-info';adminWrap.style.display='none';adminWrap.innerHTML='<div class="ua-admin"><b>Administrador:</b> acesso global ao TDNGo. Não é necessário selecionar módulos ou unidades.</div>';modbox.parentNode.insertBefore(adminWrap,modbox.nextSibling);
  }
  const prof=document.getElementById('uperfil');if(prof&&!prof.dataset.uaBound){prof.dataset.uaBound='1';prof.addEventListener('change',renderAccessMatrix)}
  const ths=[...document.querySelectorAll('#p-usuarios th')];const th=ths.find(x=>x.textContent.trim()==='Módulos');if(th)th.textContent='Acessos';
}

window.openUser=async function(id=''){
  patchDom();
  try{await loadAccess()}catch(e){toast('Não foi possível carregar unidades e módulos: '+e.message,'err');return}
  const u=(users||[]).find(x=>String(x.ID)===String(id));
  uid.value=id;unome.value=u?.Nome||'';uemail.value=u?.Email||'';upass.value='';uperfil.value=u?.Role||'visualizador';uativo.value=bool(u?.Ativo??true)?'true':'false';
  renderAccessMatrix();mu.classList.add('open');
};
window.renderMods=renderAccessMatrix;

window.saveUser=async function(){
  const role=uperfil.value;
  const old=(users||[]).find(x=>String(x.ID)===String(uid.value));
  const oldMods=String(old?.Modulos||'').split(',').map(x=>x.trim()).filter(Boolean);
  const selected=role==='admin'?[]:[...document.querySelectorAll('.ua-mod:checked')].map(x=>x.value);
  if(me.role==='admin'&&role!=='admin'&&!selected.length){toast('Selecione ao menos um módulo para este usuário.','err');return}
  const p={ID:uid.value,Nome:unome.value.trim(),Email:uemail.value.trim(),Senha:upass.value,Role:role,Ativo:uativo.value==='true',Modulos:role==='admin'?'':(me.role==='admin'?selected.join(','):(old?.Modulos||''))};
  try{
    const saved=await post(ADMIN,{action:'saveuser',...p});
    const internalId=saved.id||old?.Uuid||currentAccessUser(old)?.id||'';
    if(me.role==='admin'&&internalId){
      const syncMods=[...new Set([...oldMods,...selected])];
      for(const mod of syncMods){
        const enabled=role!=='admin'&&selected.includes(mod);
        const ids=enabled?[...document.querySelectorAll('.ua-unit[data-mod="'+CSS.escape(mod)+'"]:checked')].map(x=>x.value):[];
        await accessPost({action:'saveModuleAccess',usuario_id:internalId,modulo:mod,habilitado:enabled,unidade_ids:ids});
      }
    }
    closeM('mu');toast('Usuário, perfil e acessos salvos.');accessLoaded=false;await loadAll();
  }catch(e){toast(e.message||'Falha ao salvar usuário e acessos.','err')}
};

const oldLoadAll=window.loadAll;
if(typeof oldLoadAll==='function')window.loadAll=async function(){await oldLoadAll();accessLoaded=false;try{await loadAccess()}catch(e){if(me?.role==='admin')toast('Falha ao atualizar acessos: '+e.message,'err')}patchDom()};

patchDom();
setTimeout(async()=>{patchDom();if(me?.role==='admin'){try{await loadAccess()}catch(e){}}},250);
})();