(function(){
  'use strict';

  function isManager(){
    try{return !!me && ['admin','gestor'].includes(String(me.role||'').toLowerCase());}catch(e){return false;}
  }
  function isExcluded(c){return /^EXCLU/i.test(String(c&&c.Status||''));}
  function findRow(id){
    try{return rows.find(function(x){return String(x.ID)===String(id);})||null;}catch(e){return null;}
  }
  function cboCode(v){
    var s=String(v==null?'':v);
    var m=s.match(/(?:^|\D)(\d{6})(?:\D|$)/);
    if(m)return m[1];
    m=s.match(/\d+/);
    return m?m[0]:'';
  }
  function copyCbo(v){
    var code=cboCode(v);
    if(!code){try{toast('CBO vazio.','err');}catch(e){}return;}
    try{if(typeof tdngoCopyCnes==='function')return tdngoCopyCnes(code,'CBO',false);}catch(e){}
    navigator.clipboard.writeText(code).then(function(){try{toast('CBO copiado: '+code,'ok');}catch(e){}}).catch(function(){try{toast('Não foi possível copiar o CBO.','err');}catch(e){}});
  }

  function patchCboCopyButtons(){
    document.querySelectorAll('button.tdngo-copy').forEach(function(b){
      var title=String(b.title||'').toLowerCase();if(title.indexOf('cbo')<0)return;
      b.dataset.tdngoCboOnly='1';b.title='Copiar somente o código CBO';
      b.onclick=function(ev){ev.preventDefault();ev.stopPropagation();var value='';var tr=b.closest('tr');if(tr){var ck=tr.querySelector('.rowck');var c=ck?findRow(ck.value):null;if(c)value=c.CBO||'';}if(!value){var field=document.getElementById('c-cbo');if(field&&b.parentElement===field.parentElement)value=field.value||'';}if(!value){var td=b.closest('td');value=td?td.textContent:'';}copyCbo(value);};
    });
  }

  window.editForm=function(id){
    var c=findRow(id);if(!c)return;
    if(isExcluded(c)&&!isManager()){try{toast('Apenas gestores e administradores podem editar cadastros excluídos.','err');}catch(e){}return;}
    openForm();
    $('form-title').textContent=isExcluded(c)?'Editar cadastro excluído':'Editar cadastro';
    $('c-id').value=c.ID||'';$('c-name').value=c.Nome||'';$('c-cpf').value=c.CPF||'';$('c-type').value=String(c.Tipo||'1');
    $('c-cbo').value=c.CBO||'';$('c-council').value=c.Conselho||'';$('c-reg').value=c.NumConselho||'';$('c-uf').value=c.UF||'SP';
    $('c-link').value=c.IndicadorVinculo||'';$('c-cnpj').value=c.CNPJ||'';$('c-comp').value=formatComp(c.Competencia)==='—'?'':formatComp(c.Competencia);
    $('c-cha').value=c.CHAmbulatorial||'';$('c-chh').value=c.CHHospitalar||'';$('c-cho').value=c.CHOutros||'';
    $('c-datein').value=normDate(c.DataInclusao);$('c-dateout').value=normDate(c.DataSaida);$('c-status').value=c.Status||'ATIVO';
    $('c-incnes').checked=String(c.CadastradoCNES)==='true'||c.CadastradoCNES===true;$('c-obs').value=c.Obs||'';typeChanged();
  };

  window.tdngoDeleteCnesPermanent=async function(id){
    if(!isManager()){try{toast('Apenas gestores e administradores podem excluir definitivamente.','err');}catch(e){}return;}
    var c=findRow(id);var nome=c&&c.Nome?(' de '+c.Nome):'';
    if(!confirm('Excluir DEFINITIVAMENTE o cadastro'+nome+'?\n\nEsta ação remove o vínculo do banco e não poderá ser desfeita.'))return;
    try{await post(API,{action:'delete',id:id});toast('Cadastro excluído definitivamente.','ok');await loadRows();}catch(e){toast(e.message||'Não foi possível excluir definitivamente.','err');}
  };

  function addExcludedAdminActions(){
    if(!isManager())return;
    var body=document.getElementById('tbody');if(!body)return;
    body.querySelectorAll('tr').forEach(function(tr){
      var ck=tr.querySelector('.rowck');if(!ck)return;
      var c=findRow(ck.value);if(!c||!isExcluded(c))return;
      var td=tr.lastElementChild;if(!td)return;
      if(!td.querySelector('.tdngo-edit-excluded')){var edit=document.createElement('button');edit.type='button';edit.className='btn sm tdngo-edit-excluded';edit.title='Editar cadastro excluído';edit.textContent='✏️';edit.onclick=function(ev){ev.stopPropagation();window.editForm(c.ID);};td.appendChild(edit);}
      if(!td.querySelector('.tdngo-delete-permanent')){var del=document.createElement('button');del.type='button';del.className='btn sm red tdngo-delete-permanent';del.title='Excluir definitivamente do banco';del.textContent='🗑';del.style.marginLeft='5px';del.onclick=function(ev){ev.stopPropagation();window.tdngoDeleteCnesPermanent(c.ID);};td.appendChild(del);}
    });
  }

  function apply(){patchCboCopyButtons();addExcludedAdminActions();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  var body=document.getElementById('tbody');if(body)new MutationObserver(function(){setTimeout(apply,0);}).observe(body,{childList:true,subtree:true});
  var form=document.getElementById('form-bg');if(form)new MutationObserver(function(){setTimeout(patchCboCopyButtons,0);}).observe(form,{childList:true,subtree:true});
  setTimeout(apply,300);setTimeout(apply,1000);
})();
