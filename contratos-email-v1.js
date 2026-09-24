(function(){
  'use strict';
  if(window.__TDNGO_CONTRATOS_EMAIL_V1__)return;
  window.__TDNGO_CONTRATOS_EMAIL_V1__=true;

  var BASE=new URL('api/email/',location.href).toString();

  function sess(){try{return JSON.parse(sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session')||'null')}catch(e){return null}}
  function token(){var s=sess();return s&&s.tdngoToken?s.tdngoToken:''}
  function role(){var s=sess();return String((s&&s.role)||'').toLowerCase()}
  function canSend(){return ['admin','gestor','desenvolvedor','developer','master'].indexOf(role())>=0}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
  function contract(id){try{return contracts.find(function(x){return String(x.id)===String(id)})||null}catch(e){return null}}
  async function api(path,options){
    options=options||{};
    var h=Object.assign({'Content-Type':'application/json'},options.headers||{});
    h.Authorization='Bearer '+token();
    var r=await fetch(BASE+path,{method:options.method||'GET',headers:h,body:options.body?JSON.stringify(options.body):undefined,cache:'no-store'});
    var t=await r.text(),j;
    try{j=JSON.parse(t)}catch(e){j={ok:false,message:t||('HTTP '+r.status)}}
    if(!r.ok||!j.ok)throw new Error(j.message||('HTTP '+r.status));
    return j;
  }
  function emails(value){
    var seen={},out=[];
    String(value||'').replace(/;/g,',').split(',').forEach(function(x){x=x.trim().toLowerCase();if(x&&x.indexOf('@')>0&&!seen[x]){seen[x]=1;out.push(x)}});
    return out;
  }
  function recipients(c){
    var arr=[];
    [c&&c.fiscalEmail,c&&c.gestorEmail].forEach(function(x){arr=arr.concat(emails(x))});
    if(c&&c.tipo==='Termo Aditivo'&&c.contratoPai){
      var p=contract(c.contratoPai);
      if(p)[p.fiscalEmail,p.gestorEmail].forEach(function(x){arr=arr.concat(emails(x))});
    }
    var seen={};return arr.filter(function(x){if(seen[x])return false;seen[x]=1;return true});
  }
  function parseDateBr(v){
    var m=String(v||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(!m)return null;
    return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]));
  }
  function endDate(c){
    try{if(typeof vigenciaEfetivaStr==='function')return vigenciaEfetivaStr(c)||c.vigenciaFim||''}catch(e){}
    return c.vigenciaFim||'';
  }
  function daysTo(v){
    var d=parseDateBr(v);if(!d)return null;
    var h=new Date();h.setHours(0,0,0,0);d.setHours(0,0,0,0);
    return Math.round((d-h)/86400000);
  }
  function parentNumber(c){
    if(!c||!c.contratoPai)return'';
    var p=contract(c.contratoPai);return p&&p.numero?p.numero:c.contratoPai;
  }
  function template(c,type){
    var num=c.numero||'—',empresa=c.empresa||'—',fim=endDate(c),obj=c.objeto||'—';
    if(type==='ADITIVO'){
      return{
        subject:'TDN | Novo termo aditivo '+num+' — '+empresa,
        body:'Prezados,\n\nInformamos o cadastro do Termo Aditivo nº '+num+(parentNumber(c)?', vinculado ao Contrato nº '+parentNumber(c):'')+'.\n\nEmpresa: '+empresa+'\nObjeto: '+obj+(fim?'\nVigência até: '+fim:'')+'\n\nEsta comunicação foi emitida pelo TDN - Gestão de Contratos.\n\nAtenciosamente,\nGestão de Contratos\nFundação Hospital Santa Lydia'
      };
    }
    if(type==='VENCIMENTO'){
      var dias=daysTo(fim),prazo='';
      if(dias!==null) prazo=dias<0?' O documento venceu há '+Math.abs(dias)+' dia(s).':dias===0?' O vencimento ocorre hoje.':' Faltam '+dias+' dia(s) para o vencimento.';
      return{
        subject:'TDN | Aviso de vencimento — '+(c.tipo||'Contrato')+' '+num+' — '+empresa,
        body:'Prezados,\n\nInformamos que '+(c.tipo==='Termo Aditivo'?'o Termo Aditivo':'o Contrato')+' nº '+num+', firmado com '+empresa+', possui vencimento previsto para '+(fim||'data não informada')+'.'+prazo+'\n\nObjeto: '+obj+'\n\nSolicitamos avaliação das providências necessárias quanto à continuidade, prorrogação, renovação ou encerramento, conforme aplicável.\n\nEsta comunicação foi emitida pelo TDN - Gestão de Contratos.\n\nAtenciosamente,\nGestão de Contratos\nFundação Hospital Santa Lydia'
      };
    }
    if(type==='PERSONALIZADO'){
      return{subject:'TDN | '+(c.tipo||'Contrato')+' '+num+' — '+empresa,body:'Prezados,\n\nReferente a '+(c.tipo||'Contrato')+' nº '+num+' — '+empresa+'.\n\n\n\nAtenciosamente,\nGestão de Contratos\nFundação Hospital Santa Lydia'};
    }
    return{
      subject:'TDN | Novo contrato '+num+' — '+empresa,
      body:'Prezados,\n\nInformamos o cadastro do Contrato nº '+num+' no TDN - Gestão de Contratos.\n\nEmpresa: '+empresa+'\nObjeto: '+obj+(c.vigenciaInicio?'\nInício da vigência: '+c.vigenciaInicio:'')+(fim?'\nVigência até: '+fim:'')+'\n\nEsta comunicação foi emitida pelo TDN - Gestão de Contratos.\n\nAtenciosamente,\nGestão de Contratos\nFundação Hospital Santa Lydia'
    };
  }
  function installCss(){
    if(document.getElementById('tdngo-contratos-email-css'))return;
    var st=document.createElement('style');st.id='tdngo-contratos-email-css';
    st.textContent='.email-v1-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1600;display:none;align-items:center;justify-content:center;padding:18px}.email-v1-bg.open{display:flex}.email-v1-modal{width:min(760px,100%);max-height:92vh;overflow:auto;background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.22)}.email-v1-h{display:flex;align-items:center;gap:8px;padding:15px 18px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--surface);z-index:1}.email-v1-b{padding:18px}.email-v1-f{display:grid;grid-template-columns:1fr 1fr;gap:12px}.email-v1-f .full{grid-column:1/-1}.email-v1-f label{display:block;font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;margin-bottom:4px}.email-v1-f input,.email-v1-f select,.email-v1-f textarea{width:100%;padding:9px 10px;border:1px solid var(--border);border-radius:7px;background:var(--surface2);color:var(--text);font:inherit}.email-v1-f textarea{min-height:230px;resize:vertical;line-height:1.45}.email-v1-actions{display:flex;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--border);position:sticky;bottom:0;background:var(--surface)}.email-v1-note{font-size:11px;color:var(--text3);margin-top:4px}.email-v1-history{display:grid;gap:7px}.email-v1-history-item{border:1px solid var(--border);background:var(--surface2);border-radius:8px;padding:9px 11px;font-size:12px}.email-v1-history-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.email-v1-ok{color:var(--green);font-weight:700}.email-v1-err{color:var(--red);font-weight:700}.email-v1-send{white-space:nowrap}.email-v1-alert-btn{margin-top:8px}.email-v1-msg{font-size:12px;margin-top:8px}.email-v1-list-btn{margin-left:5px}@media(max-width:700px){.email-v1-f{grid-template-columns:1fr}.email-v1-f .full{grid-column:auto}}';
    document.head.appendChild(st);
  }
  function installModal(){
    if(document.getElementById('email-v1-bg'))return;
    installCss();
    var bg=document.createElement('div');bg.id='email-v1-bg';bg.className='email-v1-bg';
    bg.innerHTML='<div class="email-v1-modal"><div class="email-v1-h"><div><b id="email-v1-title">Comunicar contrato</b><div class="email-v1-note" id="email-v1-ref"></div></div><span style="flex:1"></span><button class="btn sm" id="email-v1-close">✕</button></div><div class="email-v1-b"><div class="email-v1-f"><div><label>Tipo de comunicação</label><select id="email-v1-type"><option value="NOVO_CONTRATO">Novo contrato</option><option value="ADITIVO">Novo termo aditivo</option><option value="VENCIMENTO">Aviso de vencimento</option><option value="PERSONALIZADO">Personalizado</option></select></div><div><label>Destinatários</label><input id="email-v1-to" placeholder="email@dominio.com.br; outro@dominio.com.br"><div class="email-v1-note">Fiscal e gestor são sugeridos automaticamente quando cadastrados.</div></div><div class="full"><label>CC adicional</label><input id="email-v1-cc" placeholder="Opcional. O CC padrão configurado pelo administrador será incluído pelo servidor."></div><div class="full"><label>Assunto</label><input id="email-v1-subject"></div><div class="full"><label>Mensagem</label><textarea id="email-v1-body"></textarea></div></div><div id="email-v1-msg" class="email-v1-msg"></div></div><div class="email-v1-actions"><button class="btn" id="email-v1-cancel">Cancelar</button><button class="btn primary" id="email-v1-send">Enviar e registrar</button></div></div>';
    document.body.appendChild(bg);
    document.getElementById('email-v1-close').onclick=close;
    document.getElementById('email-v1-cancel').onclick=close;
    bg.onclick=function(e){if(e.target===bg)close()};
    document.getElementById('email-v1-type').onchange=function(){
      var id=bg.dataset.contract,c=contract(id);if(!c)return;
      var t=template(c,this.value);document.getElementById('email-v1-subject').value=t.subject;document.getElementById('email-v1-body').value=t.body;
    };
    document.getElementById('email-v1-send').onclick=send;
  }
  function open(id,context){
    if(!canSend()){try{showNotif('Seu perfil não possui permissão para enviar e-mails.','err')}catch(e){}return}
    var c=contract(id);if(!c)return;
    installModal();
    var bg=document.getElementById('email-v1-bg');bg.dataset.contract=c.id;
    var type=context==='VENCIMENTO'?'VENCIMENTO':(c.tipo==='Termo Aditivo'?'ADITIVO':'NOVO_CONTRATO');
    document.getElementById('email-v1-type').value=type;
    document.getElementById('email-v1-title').textContent=context==='VENCIMENTO'?'Enviar aviso de vencimento':'Comunicar '+(c.tipo==='Termo Aditivo'?'termo aditivo':'contrato');
    document.getElementById('email-v1-ref').textContent=(c.tipo||'Contrato')+' '+(c.numero||'—')+' — '+(c.empresa||'—');
    document.getElementById('email-v1-to').value=recipients(c).join('; ');
    document.getElementById('email-v1-cc').value='';
    var t=template(c,type);document.getElementById('email-v1-subject').value=t.subject;document.getElementById('email-v1-body').value=t.body;
    setMsg('');
    bg.classList.add('open');
  }
  function close(){var x=document.getElementById('email-v1-bg');if(x)x.classList.remove('open')}
  function setMsg(m,err){var x=document.getElementById('email-v1-msg');if(!x)return;x.textContent=m||'';x.style.color=err?'var(--red)':'var(--green)'}
  async function send(){
    var bg=document.getElementById('email-v1-bg'),id=bg&&bg.dataset.contract,c=contract(id);if(!c)return;
    var to=emails(document.getElementById('email-v1-to').value),cc=emails(document.getElementById('email-v1-cc').value);
    if(!to.length){setMsg('Informe ao menos um destinatário.',true);return}
    var subject=document.getElementById('email-v1-subject').value.trim(),body=document.getElementById('email-v1-body').value.trim();
    if(!subject||!body){setMsg('Assunto e mensagem são obrigatórios.',true);return}
    var b=document.getElementById('email-v1-send');b.disabled=true;var old=b.textContent;b.textContent='Enviando...';setMsg('');
    try{
      var r=await api('send',{method:'POST',body:{contract_id:c.id,type:document.getElementById('email-v1-type').value,to:to,cc:cc,subject:subject,body:body}});
      close();try{showNotif('✓ '+(r.message||'E-mail enviado.'),'ok')}catch(e){}
      if(String(currentDetailId||'')===String(c.id))loadHistory(c.id);
    }catch(e){setMsg('Falha no envio: '+e.message,true)}
    finally{b.disabled=false;b.textContent=old}
  }
  function typeLabel(v){
    return({NOVO_CONTRATO:'Novo contrato',ADITIVO:'Termo aditivo',VENCIMENTO:'Vencimento',PERSONALIZADO:'Personalizado',TESTE:'Teste'})[v]||v||'E-mail';
  }
  async function loadHistory(id){
    var box=document.getElementById('email-v1-history-'+String(id).replace(/[^a-zA-Z0-9_-]/g,'_'));
    if(!box)return;
    box.innerHTML='<div style="font-size:12px;color:var(--text3)">Carregando comunicações...</div>';
    try{
      var r=await api('history?contract_id='+encodeURIComponent(id)),arr=r.data||[];
      if(!arr.length){box.innerHTML='<div style="font-size:12px;color:var(--text3)">Nenhum e-mail enviado para este contrato.</div>';return}
      box.innerHTML='<div class="email-v1-history">'+arr.map(function(h){
        var when=h.enviado_em||h.criado_em,dt=when?new Date(when).toLocaleString('pt-BR'):'—',status=h.status==='ENVIADO'?'<span class="email-v1-ok">✓ Enviado</span>':'<span class="email-v1-err">✗ Erro</span>';
        var tos=Array.isArray(h.destinatarios)?h.destinatarios.join('; '):'',cc=Array.isArray(h.cc)&&h.cc.length?'<div><b>CC:</b> '+esc(h.cc.join('; '))+'</div>':'';
        return'<div class="email-v1-history-item"><div class="email-v1-history-top"><b>'+esc(typeLabel(h.tipo_comunicacao))+'</b>'+status+'<span style="color:var(--text3)">'+esc(dt)+'</span><span style="color:var(--text3)">por '+esc(h.enviado_por_nome||h.enviado_por_email||'—')+'</span></div><div style="margin-top:4px"><b>Para:</b> '+esc(tos)+'</div>'+cc+'<div><b>Assunto:</b> '+esc(h.assunto||'')+'</div>'+(h.erro?'<div class="email-v1-err">'+esc(h.erro)+'</div>':'')+'<details style="margin-top:5px"><summary style="cursor:pointer;color:var(--accent)">Ver mensagem</summary><div style="white-space:pre-wrap;margin-top:7px;color:var(--text2)">'+esc(h.corpo||'')+'</div></details></div>';
      }).join('')+'</div>';
    }catch(e){box.innerHTML='<div style="font-size:12px;color:var(--red)">Histórico de e-mails indisponível: '+esc(e.message)+'</div>'}
  }
  function injectHistory(c){
    var body=document.getElementById('modal-body');if(!body||!c)return;
    body.querySelectorAll('.email-v1-detail-section').forEach(function(x){x.remove()});
    var sec=document.createElement('div');sec.className='dsec email-v1-detail-section';
    var bid='email-v1-history-'+String(c.id).replace(/[^a-zA-Z0-9_-]/g,'_');
    sec.innerHTML='<div class="dsec-title">Comunicações por e-mail</div><div id="'+bid+'"><div style="font-size:12px;color:var(--text3)">Carregando comunicações...</div></div>';
    body.appendChild(sec);loadHistory(c.id);
  }
  function injectFooter(c){
    if(!canSend()||!c)return;
    var f=document.getElementById('modal-footer');if(!f||f.querySelector('.email-v1-send-detail'))return;
    var b=document.createElement('button');b.type='button';b.className='btn sm email-v1-send-detail';b.textContent='✉️ Comunicar';
    b.onclick=function(){open(c.id,'DETALHE')};
    f.insertBefore(b,f.firstChild);
  }
  function idFromOnclick(el){
    if(!el||!el.getAttribute)return'';
    var direct=String(el.getAttribute('data-detail')||'').trim();
    if(direct)return direct;
    var s=String(el.getAttribute('onclick')||''),m=s.match(/showDetail\(['"]([^'"]+)['"]\)/);
    return m?m[1]:'';
  }
    function decorateList(){
    if(!canSend())return;
    document.querySelectorAll('#lista-body tr').forEach(function(tr){
      if(tr.querySelector('.email-v1-list-btn'))return;
      var ver=Array.from(tr.querySelectorAll('button')).find(function(x){return idFromOnclick(x)});
      if(!ver)return;var id=idFromOnclick(ver);if(!id)return;
      var b=document.createElement('button');b.type='button';b.className='btn sm email-v1-list-btn';b.title='Enviar comunicação por e-mail';b.textContent='✉';
      b.onclick=function(e){e.stopPropagation();open(id,'LISTA')};
      ver.insertAdjacentElement('afterend',b);
    });
  }
  function decorateAlerts(){
    if(!canSend())return;
    document.querySelectorAll('#alertas-body .alert-card').forEach(function(card){
      if(card.querySelector('.email-v1-alert-btn'))return;
      var id=idFromOnclick(card);if(!id)return;
      var b=document.createElement('button');b.type='button';b.className='btn sm email-v1-alert-btn';b.textContent='✉ Enviar aviso';
      b.onclick=function(e){e.preventDefault();e.stopPropagation();open(id,'VENCIMENTO')};
      card.appendChild(b);
    });
  }

  installCss();installModal();

  if(typeof window.showDetail==='function'){
    var oldDetail=window.showDetail;
    window.showDetail=function(id){
      var r=oldDetail.apply(this,arguments),c=contract(id);
      setTimeout(function(){injectFooter(c);injectHistory(c)},0);
      return r;
    };
  }
  if(typeof window.renderLista==='function'){
    var oldLista=window.renderLista;
    window.renderLista=function(){var r=oldLista.apply(this,arguments);setTimeout(decorateList,0);return r};
  }
  if(typeof window.renderAlertas==='function'){
    var oldAlertas=window.renderAlertas;
    window.renderAlertas=function(){var r=oldAlertas.apply(this,arguments);setTimeout(decorateAlerts,0);return r};
  }

  setTimeout(function(){try{decorateList();decorateAlerts()}catch(e){console.warn('[Contratos e-mail]',e)}},150);
  window.tdngoContratosEmail={open:open,history:loadHistory};
})();