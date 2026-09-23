(()=>{
'use strict';
if(window.__TDNGO_MANUT_CLEANUP_V1__)return;
window.__TDNGO_MANUT_CLEANUP_V1__=true;

const API='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-manutencao-scope-api';
const ALLOWED_USER_ID='6fdf5483-8196-45e9-8f40-36be4574daad';

function sessionToken(){
  try{
    const raw=sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session');
    return raw?JSON.parse(raw)?.tdngoToken||'':'';
  }catch{return''}
}
function toast(msg,type=''){
  const e=document.getElementById('toast');
  if(!e)return;
  e.textContent=String(msg||'');
  e.className='toast '+type;
  e.style.display='block';
  clearTimeout(e._cleanup);
  e._cleanup=setTimeout(()=>e.style.display='none',4200);
}
async function call(action,payload={}){
  const token=sessionToken();
  if(!token)throw new Error('Sessão não encontrada.');
  const r=await fetch(API,{
    method:'POST',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
    body:JSON.stringify({action,...payload}),
    cache:'no-store'
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok||d.ok===false)throw new Error(d.message||'Falha na operação.');
  return d;
}
function mount(ctx){
  if(String(ctx?.user?.id||'')!==ALLOWED_USER_ID)return;
  if(document.getElementById('btn-clear-all-tickets'))return;
  const head=document.querySelector('#page-tickets .page-head');
  if(!head)return;

  let actions=head.querySelector('.actions');
  if(!actions){
    actions=document.createElement('div');
    actions.className='actions';
    head.appendChild(actions);
  }

  const b=document.createElement('button');
  b.id='btn-clear-all-tickets';
  b.type='button';
  b.className='btn red';
  b.textContent='Limpar chamados';
  b.title='Retira todos os chamados atuais da fila operacional, preservando o histórico no banco.';
  b.onclick=clearAllTickets;
  actions.appendChild(b);
}
async function clearAllTickets(){
  const typed=prompt('Esta ação retirará TODOS os chamados atuais da fila operacional. O histórico será preservado no banco.\n\nPara confirmar, digite LIMPAR:','');
  if(typed===null)return;
  if(String(typed).trim().toUpperCase()!=='LIMPAR'){
    toast('Limpeza cancelada: confirmação incorreta.','err');
    return;
  }
  if(!confirm('Confirma a limpeza da fila de chamados?'))return;

  const b=document.getElementById('btn-clear-all-tickets');
  try{
    if(b){b.disabled=true;b.textContent='Limpando...'}
    const d=await call('clear_all_tickets',{confirm:'LIMPAR'});
    toast(d.message||'Fila de chamados limpa.','ok');
    await window.refreshAll?.();
  }catch(e){
    toast(e.message||'Não foi possível limpar os chamados.','err');
  }finally{
    if(b){b.disabled=false;b.textContent='Limpar chamados'}
  }
}
window.addEventListener('tdngo:maintenance-ready',e=>mount(e.detail));
if(window.__TDNGO_MANUT_CONTEXT__)mount(window.__TDNGO_MANUT_CONTEXT__);
})();