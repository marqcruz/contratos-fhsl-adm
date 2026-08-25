(function(){
  'use strict';

  function onlyDigits(v){ return String(v==null?'':v).replace(/\D/g,''); }
  function notify(msg,type){
    try{ if(typeof toast==='function') return toast(msg,type||'ok'); }catch(e){}
    try{ if(typeof showNotif==='function') return showNotif(msg,type||'ok'); }catch(e){}
  }
  function validCPF(v){
    const c=onlyDigits(v);
    if(c.length!==11 || /^(\d)\1{10}$/.test(c)) return false;
    let s=0,r;
    for(let i=0;i<9;i++) s+=Number(c[i])*(10-i);
    r=(s*10)%11; if(r===10) r=0; if(r!==Number(c[9])) return false;
    s=0;
    for(let i=0;i<10;i++) s+=Number(c[i])*(11-i);
    r=(s*10)%11; if(r===10) r=0;
    return r===Number(c[10]);
  }
  async function copyText(v,label,digitsOnly){
    const txt=digitsOnly?onlyDigits(v):String(v==null?'':v).trim();
    if(!txt){ notify((label||'Valor')+' vazio.','err'); return; }
    try{
      await navigator.clipboard.writeText(txt);
      notify((label||'Valor')+' copiado: '+txt,'ok');
    }catch(e){
      const ta=document.createElement('textarea');
      ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); notify((label||'Valor')+' copiado: '+txt,'ok'); }
      catch(_){ notify('Não foi possível copiar.','err'); }
      ta.remove();
    }
  }
  window.tdngoCopyCnes=function(v,label,digitsOnly){ return copyText(v,label,digitsOnly); };

  function addCss(){
    if(document.getElementById('tdngo-cnes-ux-style')) return;
    const st=document.createElement('style'); st.id='tdngo-cnes-ux-style';
    st.textContent=`
      .tdngo-copy{margin-left:5px;border:1px solid var(--border);background:var(--surface2);color:var(--text);border-radius:6px;padding:2px 6px;cursor:pointer;font-size:11px;line-height:1.2;vertical-align:middle}
      .tdngo-copy:hover{border-color:var(--accent);color:var(--accent)}
      .tdngo-valid{font-size:11px;margin-top:4px;font-weight:700}.tdngo-valid.ok{color:var(--green)}.tdngo-valid.err{color:var(--red)}
      .tdngo-field-copy{display:flex;gap:6px;align-items:center}.tdngo-field-copy>input,.tdngo-field-copy>select{flex:1;min-width:0}
    `;
    document.head.appendChild(st);
  }

  function setupCpf(){
    const el=document.getElementById('c-cpf');
    if(!el || el.dataset.tdngoCpf==='1') return;
    el.dataset.tdngoCpf='1';
    let msg=document.getElementById('c-cpf-msg');
    if(!msg){ msg=document.createElement('div'); msg.id='c-cpf-msg'; msg.className='tdngo-valid'; el.parentElement.appendChild(msg); }
    const validate=()=>{
      const d=onlyDigits(el.value);
      if(!d){ msg.textContent=''; msg.className='tdngo-valid'; el.setCustomValidity(''); return true; }
      const ok=validCPF(d);
      msg.textContent=ok?'✔ CPF válido':'✕ CPF inválido';
      msg.className='tdngo-valid '+(ok?'ok':'err');
      el.setCustomValidity(ok?'':'CPF inválido');
      return ok;
    };
    el.addEventListener('input',validate);
    el.addEventListener('blur',validate);
    validate();

    if(!el.parentElement.querySelector('[data-copy="cpf"]')){
      const b=document.createElement('button'); b.type='button'; b.className='tdngo-copy'; b.dataset.copy='cpf'; b.title='Copiar CPF sem pontos'; b.textContent='📋 sem pontos';
      b.onclick=()=>copyText(el.value,'CPF',true);
      el.insertAdjacentElement('afterend',b);
    }
  }

  function addFormCopy(id,label,digitsOnly){
    const el=document.getElementById(id); if(!el) return;
    const p=el.parentElement; if(!p || p.querySelector('[data-copy="'+id+'"]')) return;
    const b=document.createElement('button'); b.type='button'; b.className='tdngo-copy'; b.dataset.copy=id; b.title='Copiar '+label+(digitsOnly?' sem pontuação':''); b.textContent='📋';
    b.onclick=()=>copyText(el.value,label,digitsOnly);
    el.insertAdjacentElement('afterend',b);
  }

  function setupFormCopies(){
    addFormCopy('c-cnpj','CNPJ',true);
    addFormCopy('c-cbo','CBO',false);
    addFormCopy('c-reg','Nº conselho',false);
  }

  function enhanceRows(){
    const body=document.getElementById('tbody'); if(!body) return;
    body.querySelectorAll('tr').forEach(tr=>{
      const c=tr.children; if(c.length<10) return;
      const configs=[
        [2,'CPF',true],
        [4,'CBO',false],
        [5,'CNPJ',true],
        [8,'Carga horária',false]
      ];
      configs.forEach(([idx,label,digitsOnly])=>{
        const td=c[idx]; if(!td || td.querySelector('.tdngo-copy')) return;
        const raw=td.textContent.trim(); if(!raw || raw==='—') return;
        const b=document.createElement('button'); b.type='button'; b.className='tdngo-copy'; b.title='Copiar '+label+(digitsOnly?' sem pontuação':''); b.textContent='📋';
        b.onclick=(ev)=>{ ev.stopPropagation(); copyText(raw,label,digitsOnly); };
        td.appendChild(b);
      });
    });
  }

  function guardSave(){
    if(typeof window.saveForm!=='function' || window.saveForm.__tdngoCpfGuard) return;
    const original=window.saveForm;
    const wrapped=async function(){
      const el=document.getElementById('c-cpf');
      if(el && !validCPF(el.value)){
        notify('CPF inválido. Corrija antes de salvar.','err');
        el.focus();
        return;
      }
      return original.apply(this,arguments);
    };
    wrapped.__tdngoCpfGuard=true;
    window.saveForm=wrapped;
  }

  function install(){
    addCss(); setupCpf(); setupFormCopies(); guardSave(); enhanceRows();
    const body=document.getElementById('tbody');
    if(body && !body.__tdngoObserver){
      const obs=new MutationObserver(()=>enhanceRows()); obs.observe(body,{childList:true,subtree:true}); body.__tdngoObserver=obs;
    }
    const form=document.getElementById('form-bg');
    if(form && !form.__tdngoObserver){
      const obs2=new MutationObserver(()=>{setupCpf();setupFormCopies();guardSave();}); obs2.observe(form,{childList:true,subtree:true}); form.__tdngoObserver=obs2;
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install); else install();
  setTimeout(install,300); setTimeout(install,1000);
})();
