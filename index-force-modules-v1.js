(()=>{
'use strict';
if(window.__TDNGO_INDEX_FORCE_MODULES_V1__)return;window.__TDNGO_INDEX_FORCE_MODULES_V1__=true;
function navMark(href){try{sessionStorage.setItem('tdngo_explicit_nav',Date.now()+'|'+href)}catch(e){}}
function add(def,before){
  const grid=document.getElementById('hub-grid');if(!grid||grid.querySelector('[data-mod="'+def.mod+'"]'))return;
  const a=document.createElement('a');a.className='hub-card';a.dataset.mod=def.mod;a.dataset.cat=def.cat||'gestao';a.dataset.search=def.search||'';a.href=def.href;
  a.onpointerdown=()=>navMark(def.href);a.onkeydown=e=>{if(e.key==='Enter')navMark(def.href)};
  a.innerHTML='<span class="hub-ico">'+def.ico+'</span><h3>'+def.title+'</h3><p>'+def.desc+'</p><span class="hub-tag ativo">Disponível</span>';
  const ref=before?grid.querySelector(before):null;if(ref)grid.insertBefore(a,ref);else grid.appendChild(a);
}
function run(){
 add({mod:'admin',href:'admin.html',ico:'⚙️',title:'Administração',desc:'Usuários, permissões, unidades, listas e auditoria.',search:'administracao administração admin usuarios usuários acessos permissões unidades auditoria'},'[data-mod="contratos"]');
 add({mod:'risco',href:'risco.html',ico:'🏷️',title:'Classificação de Risco',desc:'Acompanhamento de risco, prioridade e tempos assistenciais.',cat:'assistencial',search:'risco classificacao classificação prioridade acolhimento tempos atendimento'},'[data-mod="manutencao"]');
 const grid=document.getElementById('hub-grid');if(grid){const total=[...grid.querySelectorAll('.hub-card')].filter(x=>x.dataset.mod!=='conta').length;document.querySelectorAll('.hub-section-sub').forEach(e=>{if(/módulos disponíveis|modulos disponiveis/i.test(e.textContent||''))e.textContent=total+' módulos disponíveis'});}
}
run();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});setTimeout(run,200);setTimeout(run,800);setTimeout(run,1800);
})();
