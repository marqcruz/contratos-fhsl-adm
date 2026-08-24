(function(){
  const FHSL_CNPJ='13.370.183/0001-89';
  const CNES_ACCESS_API='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-cnes-access-api';
  const CNES_LISTS_API='https://nsbhhmrhzkqkaoznaeif.supabase.co/functions/v1/tdngo-cnes-lists-api';

  cnesApi=async function(action,payload,autenticado=true){
    const headers={'Content-Type':'application/json'};
    const token=(currentUser&&(currentUser.tdngoToken||currentUser.cnesToken))||'';
    if(autenticado&&token) headers.Authorization='Bearer '+token;
    const r=await fetch(CNES_ACCESS_API,{method:'POST',headers,body:JSON.stringify(Object.assign({action},payload||{}))});
    const t=await r.text(); let j; try{j=JSON.parse(t)}catch(e){j={ok:false,message:t}}
    return j;
  };

  function instalarFiltros(){
    const tipo=document.getElementById('filtro-tipo');
    if(!tipo) return;
    if(!document.getElementById('filtro-cbo')){
      const cbo=document.createElement('select');
      cbo.id='filtro-cbo'; cbo.innerHTML='<option value="">Todos os CBOs</option>';
      cbo.onchange=function(){ pagina=1; renderTabela(); }; tipo.insertAdjacentElement('afterend',cbo);
      const ord=document.createElement('select'); ord.id='ordem-cadastro';
      ord.innerHTML='<option value="nome">Ordenar: nome</option><option value="cad_desc">Cadastro: mais recentes</option><option value="cad_asc">Cadastro: mais antigos</option>';
      ord.onchange=function(){ ordenarRapido(this.value); }; cbo.insertAdjacentElement('afterend',ord);
    }
  }

  function popularFiltroCbo(){
    instalarFiltros(); const sel=document.getElementById('filtro-cbo'); if(!sel) return;
    const atual=sel.value; const itens=(CBOS||[]).slice().sort(function(a,b){ return String(a[0]).localeCompare(String(b[0])); });
    sel.innerHTML='<option value="">Todos os CBOs</option>'+itens.map(function(c){ return '<option value="'+esc(c[0])+'">'+esc(c[0]+' - '+c[1])+'</option>'; }).join('');
    if(itens.some(function(c){ return String(c[0])===atual; })) sel.value=atual;
  }

  carregarListas=async function(){
    try{
      const token=(currentUser&&(currentUser.tdngoToken||currentUser.cnesToken))||'';
      if(!token) throw new Error('Sessão sem token');
      const rr=await fetch(CNES_LISTS_API,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({action:'getcneslistas',_ts:Date.now()})});
      const txt=await rr.text(); let r; try{r=JSON.parse(txt)}catch(e){r={ok:false,message:txt}}
      if(r&&r.ok&&r.listas){
        if(Array.isArray(r.listas.cbos)&&r.listas.cbos.length) CBOS=r.listas.cbos;
        if(Array.isArray(r.listas.conselhos)&&r.listas.conselhos.length) CONSELHOS=r.listas.conselhos;
        if(Array.isArray(r.listas.vinculos)&&r.listas.vinculos.length) VINCULOS=r.listas.vinculos;
      } else throw new Error(r&&r.message?r.message:'Erro ao carregar listas');
    }catch(e){ console.warn('CNES: usando listas locais por falha no Supabase',e); }
    preencherCbos(); preencherConselhos(); preencherVinculos(); popularFiltroCbo();
  };

  const tipoMudouOriginal=tipoMudou;
  tipoMudou=function(){
    tipoMudouOriginal(); const t=document.getElementById('cd-tipo')?.value; const cnpj=document.getElementById('cd-cnpj');
    if(cnpj&&(t==='1'||t==='2')&&!String(cnpj.value||'').trim()){ cnpj.value=FHSL_CNPJ; if(typeof validarCnpjVisual==='function') validarCnpjVisual(); }
  };

  document.addEventListener('input',function(ev){
    if(ev.target&&ev.target.id==='cd-nome'){ const ini=ev.target.selectionStart,fim=ev.target.selectionEnd; ev.target.value=String(ev.target.value||'').toLocaleUpperCase('pt-BR'); try{ev.target.setSelectionRange(ini,fim)}catch(e){} }
  });

  function normalizarCompetencia(valor){ const dig=String(valor||'').replace(/\D/g,'').slice(0,6); if(!dig)return''; if(dig.length<=2)return dig; return dig.slice(0,2)+'/'+dig.slice(2); }
  function competenciaValida(valor){ return /^(0[1-9]|1[0-2])\/(20\d{2})$/.test(String(valor||'')); }
  function instalarMascaraCompetencia(){
    const comp=document.getElementById('cd-comp'); if(!comp||comp.dataset.tdngoComp==='1')return;
    comp.dataset.tdngoComp='1'; comp.maxLength=7; comp.inputMode='numeric'; comp.placeholder='MM/AAAA (ex: 07/2026)'; comp.setAttribute('pattern','(0[1-9]|1[0-2])/20[0-9]{2}');
    comp.addEventListener('input',function(){this.value=normalizarCompetencia(this.value);try{this.setSelectionRange(this.value.length,this.value.length)}catch(e){}});
    comp.addEventListener('blur',function(){if(this.value&&!competenciaValida(this.value)){showNotif('Competência inválida. Use MM/AAAA, por exemplo 07/2026.','err');this.focus();}});
  }

  const salvarCadastroOriginal=salvarCadastro;
  salvarCadastro=async function(){
    const nome=document.getElementById('cd-nome'); if(nome)nome.value=String(nome.value||'').trim().toLocaleUpperCase('pt-BR');
    const comp=document.getElementById('cd-comp'); if(comp){comp.value=normalizarCompetencia(comp.value);if(!competenciaValida(comp.value)){showNotif('Informe a competência no padrão MM/AAAA, por exemplo 07/2026.','err');comp.focus();return;}}
    return salvarCadastroOriginal.apply(this,arguments);
  };

  const abrirCadastroOriginal=abrirCadastro;
  abrirCadastro=function(){ abrirCadastroOriginal(); instalarMascaraCompetencia(); tipoMudou(); carregarListas(); };
  const editarCadOriginal=editarCad;
  editarCad=function(){
    const id=arguments[0]; const c=cadastros.find(function(x){return String(x.ID)===String(id)});
    if(c&&/^EXCLU/i.test(String(c.Status||''))){ showNotif('Cadastro excluído está desabilitado.','err'); return; }
    editarCadOriginal.apply(this,arguments); instalarMascaraCompetencia(); const comp=document.getElementById('cd-comp'); if(comp)comp.value=fmtComp(comp.value)==='—'?'':fmtComp(comp.value);
  };

  const listaFiltradaOriginal=listaFiltrada;
  listaFiltrada=function(){ let lista=listaFiltradaOriginal(); const fcbo=document.getElementById('filtro-cbo')?.value||''; if(fcbo)lista=lista.filter(function(c){return String(c.CBO||'')===fcbo}); return lista; };

  parseData=function(v){ if(!v)return 0;const d=new Date(v);if(!isNaN(d.getTime()))return d.getTime();const m=String(v).match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);if(!m)return 0;return new Date(m[3],Number(m[2])-1,m[1],m[4]||0,m[5]||0).getTime(); };
  fmtDataHora=function(v){ if(!v)return'—';const s=String(v);if(/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/.test(s))return s;const d=new Date(s);if(isNaN(d.getTime()))return s;return('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2); };
  ordenarRapido=function(v){ if(v==='cad_desc'){ordCampo='CriadoEm';ordDir=-1}else if(v==='cad_asc'){ordCampo='CriadoEm';ordDir=1}else{ordCampo='Nome';ordDir=1}pagina=1;renderTabela(); };
  const montarFiltroCompOriginal=montarFiltroComp; montarFiltroComp=function(){ montarFiltroCompOriginal(); popularFiltroCbo(); };

  const renderTabelaOriginal=renderTabela;
  renderTabela=function(){
    renderTabelaOriginal();
    document.querySelectorAll('.ck-linha').forEach(function(ck){
      const c=cadastros.find(function(x){return String(x.ID)===String(ck.value)}); if(!c||!/^EXCLU/i.test(String(c.Status||'')))return;
      const tr=ck.closest('tr'); if(!tr)return; tr.style.opacity='.48'; tr.style.filter='grayscale(.55)'; tr.title='Cadastro excluído — desabilitado'; ck.disabled=true;
      tr.querySelectorAll('button').forEach(function(b){b.disabled=true;b.title='Cadastro excluído — desabilitado'});
    });
  };

  function excelTexto(v){ const limpo=String(v==null?'':v).replace(/"/g,''); return '="'+limpo+'"'; }
  exportarCsv=function(){
    if(!cadastros.length){showNotif('Nada para exportar.','err');return} const lista=listaFiltrada(); if(!lista.length){showNotif('Nenhum registro nos filtros atuais.','err');return}
    const cab=['CPF','NOME','CBO','CNPJ','TIPO','CH','OE','UF','REG']; let csv=cab.join(';')+'\n';
    lista.forEach(function(c){const cpf=padCPF(c.CPF),nome=String(c.Nome||'').trim().toLocaleUpperCase('pt-BR'),cbo=String(c.CBO||'').replace(/\D/g,''),cnpj=String(c.CNPJ||'').replace(/\D/g,''),tipo=String(c.Tipo||''),ch=(parseInt(c.CHAmbulatorial||0,10)||0)+(parseInt(c.CHHospitalar||0,10)||0)+(parseInt(c.CHOutros||0,10)||0),oe=String(c.Conselho||'').trim(),uf=String(c.UF||'SP').trim().toUpperCase(),reg=String(c.NumConselho||'').trim();csv+=[excelTexto(cpf),nome,cbo,excelTexto(cnpj),tipo,ch,oe,uf,reg].map(function(v){return String(v).replace(/;/g,',')}).join(';')+'\n'});
    const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='CNES_'+(unidadeAtual||'unidade').replace(/[^a-zA-Z0-9]/g,'_')+'.csv';a.click();setTimeout(function(){try{URL.revokeObjectURL(a.href)}catch(e){}},1000);showNotif('Exportado no padrão CNES ('+lista.length+' registros).','ok');
  };

  instalarFiltros(); popularFiltroCbo(); instalarMascaraCompetencia(); if(currentUser)carregarListas();
  window.addEventListener('focus',function(){if(currentUser)carregarListas()}); document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&currentUser)carregarListas()}); setInterval(function(){if(document.visibilityState==='visible'&&currentUser)carregarListas()},60000);
})();