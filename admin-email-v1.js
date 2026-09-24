(function(){
  'use strict';
  if (window.__TDNGO_ADMIN_EMAIL_V1__) return;
  window.__TDNGO_ADMIN_EMAIL_V1__ = true;

  function session(){
    try{return JSON.parse(sessionStorage.getItem('fhsl_session')||localStorage.getItem('fhsl_session')||'null')}catch(e){return null}
  }
  var BASE = new URL('api/email/', location.href).toString();
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
  function token(){var x=session();return x&&x.tdngoToken?x.tdngoToken:''}
  async function api(path, options){
    options=options||{};
    var h=Object.assign({'Content-Type':'application/json'},options.headers||{});
    h.Authorization='Bearer '+token();
    var r=await fetch(BASE+path,{method:options.method||'GET',headers:h,body:options.body?JSON.stringify(options.body):undefined,cache:'no-store'});
    var t=await r.text(),j;
    try{j=JSON.parse(t)}catch(e){j={ok:false,message:t||('HTTP '+r.status)}}
    if(!r.ok||!j.ok)throw new Error(j.message||('HTTP '+r.status));
    return j;
  }
  function msg(text,type){
    var el=document.getElementById('email-admin-msg');if(!el)return;
    el.textContent=text||'';el.style.color=type==='err'?'var(--red)':type==='ok'?'var(--green)':'var(--muted)';
  }
  function installCss(){
    if(document.getElementById('tdngo-email-admin-css'))return;
    var st=document.createElement('style');st.id='tdngo-email-admin-css';
    st.textContent='.email-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.email-grid .full{grid-column:1/-1}.email-card{border:1px solid var(--border);background:var(--surface);border-radius:12px;padding:18px;margin-bottom:14px}.email-card h3{margin:0 0 4px;font-size:15px}.email-card p{margin:0 0 14px;color:var(--muted);font-size:12px}.email-switch{display:flex;align-items:center;gap:8px;margin:0;text-transform:none!important;font-size:13px!important;color:var(--text)!important}.email-switch input{width:auto}.email-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.email-help{font-size:11px;color:var(--muted);margin-top:5px}.email-state{display:inline-flex;align-items:center;border-radius:999px;padding:4px 9px;font-size:11px;font-weight:750;background:var(--surface2);color:var(--muted)}.email-state.on{background:rgba(63,185,80,.12);color:var(--green)}@media(max-width:760px){.email-grid{grid-template-columns:1fr}.email-grid .full{grid-column:auto}}';
    document.head.appendChild(st);
  }
  function installPage(){
    var cur=session();
    if(!cur || String(cur.role||'').toLowerCase()!=='admin')return;
    if(document.getElementById('p-email'))return;
    installCss();
    var nav=document.querySelector('.nav');
    if(nav){
      var b=document.createElement('button');b.type='button';b.dataset.page='email';b.innerHTML='✉️ E-mail SMTP';
      b.onclick=function(){window.tdngoEmailAdmin.show(b)};
      var audit=nav.querySelector('[data-page="auditoria"]');
      if(audit)audit.insertAdjacentElement('beforebegin',b);else nav.appendChild(b);
    }
    var main=document.querySelector('main.main');
    if(!main)return;
    var page=document.createElement('section');page.className='page';page.id='p-email';
    page.innerHTML=
      '<div class="email-card">'
      +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><h3>Servidor de envio</h3><p>Configuração central usada pelo módulo Contratos. A senha permanece criptografada e não volta a ser exibida após o salvamento.</p></div><span class="email-state" id="email-state">Não configurado</span></div>'
      +'<div class="email-grid">'
      +'<div class="full"><label class="email-switch"><input id="email-enabled" type="checkbox"> Habilitar envio de e-mails no módulo Contratos</label></div>'
      +'<div><label>Servidor SMTP</label><input id="email-host" placeholder="smtp.exemplo.com.br"></div>'
      +'<div><label>Porta</label><input id="email-port" type="number" min="1" max="65535" value="587"></div>'
      +'<div><label>Segurança</label><select id="email-security"><option value="starttls">STARTTLS</option><option value="ssl">SSL/TLS</option><option value="none">Sem criptografia</option></select></div>'
      +'<div><label>Usuário SMTP</label><input id="email-user" autocomplete="off"></div>'
      +'<div class="full"><label>Senha SMTP</label><input id="email-pass" type="password" autocomplete="new-password" placeholder="Deixe em branco para manter a senha já salva"><div class="email-help" id="email-pass-help">Nenhuma senha salva.</div></div>'
      +'<div><label>E-mail remetente</label><input id="email-from" type="email" placeholder="contratos@dominio.com.br"></div>'
      +'<div><label>Nome do remetente</label><input id="email-from-name" value="TDN - Gestão de Contratos"></div>'
      +'<div><label>Responder para</label><input id="email-reply" type="email" placeholder="Opcional"></div>'
      +'<div><label>CC padrão</label><input id="email-cc" placeholder="email1@...; email2@..."></div>'
      +'</div>'
      +'<div class="email-actions"><button class="btn primary" id="email-save">Salvar configuração</button><button class="btn" id="email-test-conn">Testar conexão</button></div>'
      +'<div id="email-admin-msg" style="font-size:12px;margin-top:10px"></div>'
      +'</div>'
      +'<div class="email-card"><h3>E-mail de teste</h3><p>Após salvar, envie uma mensagem real para confirmar autenticação, remetente e entrega.</p><div class="email-grid"><div class="full"><label>Destinatário do teste</label><input id="email-test-to" type="email" placeholder="seu.email@dominio.com.br"></div></div><div class="email-actions"><button class="btn" id="email-send-test">Enviar e-mail de teste</button></div></div>';
    main.appendChild(page);
    document.getElementById('email-save').onclick=save;
    document.getElementById('email-test-conn').onclick=testConnection;
    document.getElementById('email-send-test').onclick=sendTest;
  }
  function setBusy(id,busy,label){
    var b=document.getElementById(id);if(!b)return;
    if(busy){if(!b.dataset.label)b.dataset.label=b.textContent;b.disabled=true;b.textContent=label||'Aguarde...'}
    else{b.disabled=false;if(b.dataset.label){b.textContent=b.dataset.label;delete b.dataset.label}}
  }
  async function load(){
    msg('Carregando configuração...');
    try{
      var r=await api('config'),c=r.config||{};
      document.getElementById('email-enabled').checked=!!c.enabled;
      document.getElementById('email-host').value=c.smtp_host||'';
      document.getElementById('email-port').value=c.smtp_port||587;
      document.getElementById('email-security').value=c.smtp_security||'starttls';
      document.getElementById('email-user').value=c.smtp_username||'';
      document.getElementById('email-pass').value='';
      document.getElementById('email-from').value=c.from_email||'';
      document.getElementById('email-from-name').value=c.from_name||'TDN - Gestão de Contratos';
      document.getElementById('email-reply').value=c.reply_to||'';
      document.getElementById('email-cc').value=Array.isArray(c.default_cc)?c.default_cc.join('; '):'';
      document.getElementById('email-pass-help').textContent=c.password_set?'Senha já cadastrada. Deixe o campo vazio para mantê-la.':'Nenhuma senha salva.';
      var st=document.getElementById('email-state');st.textContent=c.enabled?'Envio habilitado':'Envio desabilitado';st.className='email-state'+(c.enabled?' on':'');
      msg(c.updated_at?'Última atualização: '+new Date(c.updated_at).toLocaleString('pt-BR'):'','');
    }catch(e){
      msg('Serviço de e-mail indisponível: '+e.message,'err');
    }
  }
  function payload(){
    return{
      enabled:document.getElementById('email-enabled').checked,
      smtp_host:document.getElementById('email-host').value.trim(),
      smtp_port:Number(document.getElementById('email-port').value||0),
      smtp_security:document.getElementById('email-security').value,
      smtp_username:document.getElementById('email-user').value.trim(),
      smtp_password:document.getElementById('email-pass').value,
      from_email:document.getElementById('email-from').value.trim(),
      from_name:document.getElementById('email-from-name').value.trim(),
      reply_to:document.getElementById('email-reply').value.trim(),
      default_cc:document.getElementById('email-cc').value
    };
  }
  async function save(){
    setBusy('email-save',true,'Salvando...');
    try{await api('config',{method:'PUT',body:payload()});msg('Configuração salva com segurança.','ok');await load()}
    catch(e){msg(e.message,'err')}
    finally{setBusy('email-save',false)}
  }
  async function testConnection(){
    setBusy('email-test-conn',true,'Testando...');
    msg('Abrindo conexão com o servidor SMTP...');
    try{var r=await api('test',{method:'POST',body:{}});msg(r.message||'Conexão SMTP concluída.','ok')}
    catch(e){msg('Falha no SMTP: '+e.message,'err')}
    finally{setBusy('email-test-conn',false)}
  }
  async function sendTest(){
    var to=document.getElementById('email-test-to').value.trim();
    if(!to){msg('Informe o destinatário do teste.','err');return}
    setBusy('email-send-test',true,'Enviando...');
    try{var r=await api('test',{method:'POST',body:{to:to}});msg(r.message||'E-mail de teste enviado.','ok')}
    catch(e){msg('Falha no envio: '+e.message,'err')}
    finally{setBusy('email-send-test',false)}
  }
  function show(button){
    document.querySelectorAll('.page').forEach(function(x){x.classList.remove('active')});
    document.querySelectorAll('.nav button').forEach(function(x){x.classList.remove('active')});
    var p=document.getElementById('p-email');if(p)p.classList.add('active');
    if(button)button.classList.add('active');
    var t=document.getElementById('title'),sub=document.getElementById('sub');
    if(t)t.textContent='E-mail SMTP';
    if(sub)sub.textContent='Servidor de envio e comunicação de contratos';
    load();
  }
  function ensureInstalled(){installPage()}
  window.tdngoEmailAdmin={show:show,load:load,install:ensureInstalled};
  var originalStart=window.start;
  if(typeof originalStart==='function'){
    window.start=function(){var r=originalStart.apply(this,arguments);setTimeout(ensureInstalled,0);return r};
  }
  var originalLogin=window.login;
  if(typeof originalLogin==='function'){
    window.login=async function(){var r=await originalLogin.apply(this,arguments);setTimeout(ensureInstalled,0);return r};
  }
  ensureInstalled();
})();