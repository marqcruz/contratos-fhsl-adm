// ============================================================
// GESTÃO DE CONTRATOS FHSL — Google Apps Script v5
// ============================================================
const SHEET_NAME   = 'Contratos';
const USERS_SHEET  = 'Usuarios';
const PDF_FOLDER   = 'Contratos FHSL - PDFs';
const EMAIL_ADMIN  = 'SEU_EMAIL@fhsl.com.br';            // ← ALTERE
const API_KEY      = 'COLE_SUA_CHAVE_ANTHROPIC_AQUI';    // ← sk-ant-... (leitura de PDF)

const HEADERS = [
  'ID','Numero','Tipo','ContratoPai','StatusContrato','Processo',
  'DataAssinatura','Lei','Foro','Contratante','CNPJContratante',
  'Empresa','CNPJ','SituacaoCadastral','MunicipioUF',
  'Objeto','ValoresUnidades','VigenciaInicio','VigenciaFim',
  'ValorTotal','ValorMensal','Prorrogacao','RenovacaoIniciada','TipoValor',
  'FormaPagamento','PrazoPagamento','IndiceReajuste','Periodicidade',
  'FiscalNome','FiscalEmail','FiscalCargo',
  'GestorNome','GestorEmail','GestorCargo',
  'Subcontratacao','Garantia','MultaMin','MultaMax',
  'Observacoes','Historico','PdfNome','PdfUrl','CriadoEm','AtualizadoEm'
];
const UHEADERS = ['ID','Nome','Email','Senha','Role','Ativo','Modulos','CriadoEm'];
const LOG_SHEET = 'Auditoria';
const LHEADERS = ['DataHora','Usuario','Email','Acao','Detalhe','Alvo'];
const UNITS_SHEET = 'Unidades';
const UNHEADERS = ['ID','Nome','Tipo','CEP','Logradouro','Numero','Bairro','Cidade','UF','Lat','Lng','Telefone','Responsavel','Ativo','CriadoEm'];
const UNIDADES_PADRAO = ['Hospital Santa Lydia','UPA Norte','UPA Sul','UPA Leste','UBS Central','CAPS','SAMU','Administração / Sede'];

function doGet(e)  { return handle(e); }
function doPost(e) { return handle(e); }

function handle(e) {
  const action = ((e && e.parameter && e.parameter.action) || '').toLowerCase();
  let result;
  try {
    if      (action === 'ping')       result = { ok:true, message:'Conectado!' };
    else if (action === 'getall')     result = getAll();
    else if (action === 'save')       result = save(JSON.parse(e.postData.contents));
    else if (action === 'delete')     result = deleteRow(JSON.parse(e.postData.contents));
    else if (action === 'getusers')   result = getUsers();
    else if (action === 'saveuser')   result = saveUser(JSON.parse(e.postData.contents));
    else if (action === 'deleteuser') result = deleteUser(JSON.parse(e.postData.contents));
    else if (action === 'authuser')   result = authUser(JSON.parse(e.postData.contents));
    else if (action === 'uploadpdf')  result = uploadPdf(JSON.parse(e.postData.contents));
    else if (action === 'extractpdf') result = extrairPdfComIA(JSON.parse(e.postData.contents));
    else if (action === 'getlog')     result = getLog();
    else if (action === 'logevent')   result = logEvent(JSON.parse(e.postData.contents));
    else if (action === 'getunits')   result = getUnits();
    else if (action === 'saveunit')   result = saveUnit(JSON.parse(e.postData.contents));
    else if (action === 'deleteunit') result = deleteUnit(JSON.parse(e.postData.contents));
    else if (action === 'diag')       result = diag();
    else if (action === 'repair')     result = repair();
    else result = { ok:false, message:'Ação desconhecida: '+action };
  } catch(err) { result = { ok:false, message:String(err) }; }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function sheetOf(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#1d6aad').setFontColor('#fff');
    sh.setFrozenRows(1);
    return sh;
  }
  // Auto-reparo: garante que todas as colunas esperadas existam, na ordem certa.
  const lastCol = Math.max(sh.getLastColumn(), 1);
  const existing = sh.getRange(1,1,1,lastCol).getValues()[0].map(function(x){ return String(x).trim(); });
  const faltando = headers.filter(function(h){ return existing.indexOf(h) < 0; });
  if (faltando.length) {
    // acrescenta as colunas que faltam ao final do cabeçalho
    sh.getRange(1, lastCol+1, 1, faltando.length).setValues([faltando]);
    sh.getRange(1,1,1,lastCol+faltando.length).setFontWeight('bold').setBackground('#1d6aad').setFontColor('#fff');
    sh.setFrozenRows(1);
  }
  return sh;
}
// Lê os cabeçalhos reais da planilha (podem estar em ordem diferente da constante)
function realHeaders(sh) {
  const lastCol = Math.max(sh.getLastColumn(), 1);
  return sh.getRange(1,1,1,lastCol).getValues()[0].map(function(x){ return String(x).trim(); });
}

// ── HASH DE SENHA (SHA-256) ──────────────────────────────
function hashPassword(senha) {
  if (!senha) return '';
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(senha), Utilities.Charset.UTF_8);
  return 'sha256$' + raw.map(function(b){ var v=(b<0?b+256:b).toString(16); return v.length===1?'0'+v:v; }).join('');
}
function checkPassword(senha, armazenada) {
  armazenada = String(armazenada||'');
  if (armazenada.indexOf('sha256$') === 0) return hashPassword(senha) === armazenada;
  return String(senha) === armazenada; // compatibilidade com senhas antigas em texto puro
}

// ── AUDITORIA ────────────────────────────────────────────
function audit(actor, acao, detalhe, alvo) {
  try {
    const sh = sheetOf(LOG_SHEET, LHEADERS);
    const now = Utilities.formatDate(new Date(),'America/Sao_Paulo','dd/MM/yyyy HH:mm:ss');
    sh.appendRow([now, (actor&&actor.nome)||'—', (actor&&actor.email)||'—', acao||'', detalhe||'', alvo||'']);
  } catch(err) {}
}
function logEvent(p) { audit(p.actor, p.acao, p.detalhe, p.alvo); return { ok:true }; }
function getLog() {
  const sh = sheetOf(LOG_SHEET, LHEADERS);
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return { ok:true, data:[] };
  const h = data[0];
  return { ok:true, data: data.slice(1).map(function(r){ var o={}; h.forEach(function(k,i){o[k]=r[i];}); return o; }).reverse().slice(0,500) };
}

// ── DIAGNÓSTICO E REPARO MANUAL ──────────────────────────
function diag() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME);
  const out = { ok:true, versao:'v9-autorepair', abaContratosExiste:!!sh };
  if (sh) {
    const lastCol = Math.max(sh.getLastColumn(),1);
    out.cabecalhosReais = sh.getRange(1,1,1,lastCol).getValues()[0];
    out.temPdfUrl = out.cabecalhosReais.indexOf('PdfUrl') >= 0;
    out.temPdfNome = out.cabecalhosReais.indexOf('PdfNome') >= 0;
    out.totalColunas = lastCol;
  }
  out.colunasEsperadas = HEADERS.length;
  return out;
}
function repair() {
  const sh = sheetOf(SHEET_NAME, HEADERS);   // dispara o auto-reparo
  const lastCol = Math.max(sh.getLastColumn(),1);
  const reais = sh.getRange(1,1,1,lastCol).getValues()[0];
  return { ok:true, message:'Reparo executado', cabecalhosAgora:reais, temPdfUrl:reais.indexOf('PdfUrl')>=0 };
}

function ensureUnits(sh) {
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) {
    const h = realHeaders(sh);
    const now = Utilities.formatDate(new Date(),'America/Sao_Paulo','dd/MM/yyyy HH:mm');
    UNIDADES_PADRAO.forEach(function(nome,idx){
      const o = { ID:String(Date.now()+idx), Nome:nome, Ativo:true, CriadoEm:now };
      sh.appendRow(h.map(function(k){ return o[k]!==undefined ? o[k] : ''; }));
    });
  }
}
function getUnits() {
  const sh = sheetOf(UNITS_SHEET, UNHEADERS);
  ensureUnits(sh);
  const data = sh.getDataRange().getValues();
  const h = data[0];
  return { ok:true, data: data.slice(1).map(function(r){ var o={}; h.forEach(function(k,i){o[k]=r[i];}); return o; }) };
}
function saveUnit(p) {
  const actor = p.__actor; if (p.__actor) delete p.__actor;
  const sh = sheetOf(UNITS_SHEET, UNHEADERS);
  ensureUnits(sh);
  const h = realHeaders(sh);
  const data = sh.getDataRange().getValues();
  const cNome = h.indexOf('Nome');
  const nome = String(p.Nome||'').trim();
  if (!nome) return { ok:false, message:'Nome vazio' };
  // evita duplicar (case-insensitive)
  for (var i=1;i<data.length;i++) {
    if (String(data[i][cNome]).toLowerCase().trim() === nome.toLowerCase() && String(data[i][0])!==String(p.ID))
      return { ok:false, message:'Já existe uma unidade com esse nome' };
  }
  const now = Utilities.formatDate(new Date(),'America/Sao_Paulo','dd/MM/yyyy HH:mm');
  if (p.ID) {
    for (var i=1;i<data.length;i++) {
      if (String(data[i][0]) === String(p.ID)) {
        // mantém valores existentes para campos não enviados
        const atual = {}; h.forEach(function(k,j){ atual[k] = data[i][j]; });
        const novo = {}; h.forEach(function(k){ novo[k] = (p[k]!==undefined && p[k]!==null) ? p[k] : (atual[k]!==undefined?atual[k]:''); });
        novo.ID = p.ID; novo.Nome = nome;
        sh.getRange(i+1,1,1,h.length).setValues([h.map(function(k){ return novo[k]; })]);
        audit(actor, 'Editou unidade', nome, p.ID);
        return { ok:true, id:p.ID };
      }
    }
  }
  const id = String(Date.now());
  p.ID = id; p.Nome = nome; p.CriadoEm = now;
  if (p.Ativo === undefined) p.Ativo = true;
  sh.appendRow(h.map(function(k){ return p[k]!==undefined && p[k]!==null ? p[k] : ''; }));
  audit(actor, 'Criou unidade', nome, id);
  return { ok:true, id:id };
}
function deleteUnit(p) {
  const id = (typeof p === 'object' && p !== null) ? p.id : p;
  const actor = (typeof p === 'object' && p !== null) ? p.__actor : null;
  const sh = sheetOf(UNITS_SHEET, UNHEADERS);
  const data = sh.getDataRange().getValues();
  for (var i=1;i<data.length;i++) {
    if (String(data[i][0]) === String(id)) {
      const nome = data[i][1];
      sh.deleteRow(i+1);
      audit(actor, 'Removeu unidade', nome, id);
      return { ok:true };
    }
  }
  return { ok:false, message:'Não encontrada' };
}

function getAll() {
  const sh = sheetOf(SHEET_NAME, HEADERS);
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return { ok:true, data:[] };
  const h = data[0];
  return { ok:true, data: data.slice(1).map(function(r){ var o={}; h.forEach(function(k,i){o[k]=r[i];}); return o; }) };
}

function toBRserver(v){
  if(v===undefined||v===null||v==='') return '';
  if(Object.prototype.toString.call(v)==='[object Date]'){
    var dd=('0'+v.getDate()).slice(-2), mm=('0'+(v.getMonth()+1)).slice(-2);
    return dd+'/'+mm+'/'+v.getFullYear();
  }
  var s=String(v).trim();
  if(s.length===10 && s.charAt(2)==='/' && s.charAt(5)==='/') return s;   // DD/MM/AAAA
  if(s.length>=10 && s.charAt(4)==='-' && s.charAt(7)==='-'){             // AAAA-MM-DD[...]
    return s.substring(8,10)+'/'+s.substring(5,7)+'/'+s.substring(0,4);
  }
  return s;
}
function setDateColumnsText(sh){
  // força as colunas de data a serem texto puro, para o Sheets não reinterpretar
  ['DataAssinatura','VigenciaInicio','VigenciaFim'].forEach(function(col){
    var idx = HEADERS.indexOf(col);
    if(idx>=0) sh.getRange(2, idx+1, Math.max(sh.getMaxRows()-1,1), 1).setNumberFormat('@');
  });
}
function save(p) {
  const actor = p.__actor; if (p.__actor) delete p.__actor;
  // normaliza datas para DD/MM/AAAA em texto
  p.DataAssinatura = toBRserver(p.DataAssinatura);
  p.VigenciaInicio = toBRserver(p.VigenciaInicio);
  p.VigenciaFim    = toBRserver(p.VigenciaFim);
  const sh = sheetOf(SHEET_NAME, HEADERS);   // auto-repara colunas faltantes
  setDateColumnsText(sh);
  const h = realHeaders(sh);                 // cabeçalhos REAIS, já reparados
  const data = sh.getDataRange().getValues();
  const now = Utilities.formatDate(new Date(),'America/Sao_Paulo','dd/MM/yyyy HH:mm');
  const buildRow = function(){ return h.map(function(k){ return p[k]!==undefined && p[k]!==null ? p[k] : ''; }); };
  if (p.ID) {
    for (var i=1;i<data.length;i++) {
      if (String(data[i][0]) === String(p.ID)) {
        p.AtualizadoEm = now;
        if (!p.CriadoEm) { var ci=h.indexOf('CriadoEm'); p.CriadoEm = ci>=0 ? data[i][ci] : now; }
        sh.getRange(i+1,1,1,h.length).setValues([buildRow()]);
        audit(actor, 'Editou contrato', (p.Numero||'')+' — '+(p.Empresa||''), p.ID);
        return { ok:true, message:'Atualizado', id:p.ID };
      }
    }
  }
  p.ID = String(Date.now());
  p.CriadoEm = now; p.AtualizadoEm = now;
  sh.appendRow(buildRow());
  audit(actor, 'Criou contrato', (p.Numero||'')+' — '+(p.Empresa||''), p.ID);
  return { ok:true, message:'Inserido', id:p.ID };
}

function deleteRow(p) {
  const id = (typeof p === 'object' && p !== null) ? p.id : p;
  const actor = (typeof p === 'object' && p !== null) ? p.__actor : null;
  const sh = sheetOf(SHEET_NAME, HEADERS);
  const h = realHeaders(sh);
  const cNum = h.indexOf('Numero'), cEmp = h.indexOf('Empresa');
  const data = sh.getDataRange().getValues();
  for (var i=1;i<data.length;i++) {
    if (String(data[i][0]) === String(id)) {
      const num = cNum>=0?data[i][cNum]:'', emp = cEmp>=0?data[i][cEmp]:'';
      sh.deleteRow(i+1);
      audit(actor, 'Excluiu contrato', (num||'')+' — '+(emp||''), id);
      return { ok:true, message:'Excluído' };
    }
  }
  return { ok:false, message:'Registro não encontrado' };
}

// ── USUÁRIOS ─────────────────────────────────────────────
function ensureAdmin(sh) {
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) {
    const now = Utilities.formatDate(new Date(),'America/Sao_Paulo','dd/MM/yyyy HH:mm');
    sh.appendRow([String(Date.now()),'Administrador','admin@fhsl.com.br',hashPassword('admin123'),'admin',true,now]);
  }
}
function getUsers() {
  const sh = sheetOf(USERS_SHEET, UHEADERS);
  ensureAdmin(sh);
  const data = sh.getDataRange().getValues();
  const h = data[0];
  return { ok:true, data: data.slice(1).map(function(r){ var o={}; h.forEach(function(k,i){o[k]=r[i];}); return o; }) };
}
function saveUser(p) {
  const actor = p.__actor; if (p.__actor) delete p.__actor;
  const sh = sheetOf(USERS_SHEET, UHEADERS);
  ensureAdmin(sh);
  const data = sh.getDataRange().getValues();
  const h = data[0];
  const now = Utilities.formatDate(new Date(),'America/Sao_Paulo','dd/MM/yyyy HH:mm');
  if (p.ID) {
    for (var i=1;i<data.length;i++) {
      if (String(data[i][0]) === String(p.ID)) {
        if (!p.Senha) p.Senha = data[i][3];            // mantém senha se vier vazia
        else p.Senha = hashPassword(p.Senha);          // nova senha → hash
        sh.getRange(i+1,1,1,h.length).setValues([h.map(function(k){return p[k]!==undefined?p[k]:'';})]);
        audit(actor, 'Editou usuário', (p.Nome||'')+' ('+(p.Email||'')+') · perfil '+(p.Role||''), p.ID);
        return { ok:true, id:p.ID };
      }
    }
  }
  p.ID = String(Date.now()); p.CriadoEm = now; if (p.Ativo===undefined) p.Ativo = true;
  p.Senha = hashPassword(p.Senha);
  sh.appendRow(h.map(function(k){return p[k]!==undefined?p[k]:'';}));
  audit(actor, 'Criou usuário', (p.Nome||'')+' ('+(p.Email||'')+') · perfil '+(p.Role||''), p.ID);
  return { ok:true, id:p.ID };
}
function deleteUser(p) {
  const id = (typeof p === 'object' && p !== null) ? p.id : p;
  const actor = (typeof p === 'object' && p !== null) ? p.__actor : null;
  const sh = sheetOf(USERS_SHEET, UHEADERS);
  const data = sh.getDataRange().getValues();
  for (var i=1;i<data.length;i++) {
    if (String(data[i][0]) === String(id)) {
      const nome = data[i][1], email = data[i][2];
      sh.deleteRow(i+1);
      audit(actor, 'Excluiu usuário', (nome||'')+' ('+(email||'')+')', id);
      return { ok:true };
    }
  }
  return { ok:false, message:'Não encontrado' };
}
function authUser(p) {
  const res = getUsers();
  if (!res.ok) return { ok:false, message:'Erro ao ler usuários' };
  const email = String(p.email||'').toLowerCase().trim();
  const u = res.data.find(function(x){
    return String(x.Email).toLowerCase().trim() === email
      && checkPassword(p.senha, x.Senha)
      && String(x.Ativo) !== 'false' && String(x.Ativo) !== 'FALSE';
  });
  if (!u) { audit({nome:'—',email:email}, 'Tentativa de login falha', 'E-mail ou senha incorretos', ''); return { ok:false, message:'E-mail ou senha incorretos' }; }
  // Migração suave: se a senha ainda estava em texto puro, regrava como hash
  if (String(u.Senha).indexOf('sha256$') !== 0) {
    const sh = sheetOf(USERS_SHEET, UHEADERS);
    const data = sh.getDataRange().getValues();
    for (var i=1;i<data.length;i++) { if (String(data[i][0])===String(u.ID)) { sh.getRange(i+1,4).setValue(hashPassword(p.senha)); break; } }
  }
  audit({nome:u.Nome,email:u.Email}, 'Login', 'Acesso ao sistema', u.ID);
  return { ok:true, user:{ id:u.ID, nome:u.Nome, email:u.Email, role:u.Role, modulos:(u.Modulos||'') } };
}

// ── UPLOAD DE PDF NO DRIVE ───────────────────────────────
function getPdfFolder() {
  const it = DriveApp.getFoldersByName(PDF_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PDF_FOLDER);
}
function uploadPdf(p) {
  if (!p || !p.base64) return { ok:false, message:'PDF não recebido' };
  try {
    const bytes = Utilities.base64Decode(p.base64);
    const blob = Utilities.newBlob(bytes, 'application/pdf', p.nome || ('contrato_'+Date.now()+'.pdf'));
    const file = getPdfFolder().createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const id = file.getId();
    return { ok:true, url:'https://drive.google.com/file/d/'+id+'/preview', fileId:id };
  } catch(err) {
    return { ok:false, message:'Falha ao salvar PDF no Drive: '+String(err) };
  }
}

// ── E-MAIL DE VENCIMENTO ─────────────────────────────────
function verificarVencimentos() {
  const res = getAll();
  if (!res.ok || !res.data.length) return;
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  res.data.forEach(function(c) {
    if (!c.VigenciaFim) return;
    if (['Encerrado','Suspenso'].indexOf(c.StatusContrato) >= 0) return;
    const pt = String(c.VigenciaFim).split('/');
    if (pt.length < 3) return;
    const fim = new Date(+pt[2], +pt[1]-1, +pt[0]); fim.setHours(0,0,0,0);
    const diff = Math.round((fim - hoje) / 86400000);
    if (diff !== 60 && diff !== 30 && diff !== 15) return;
    const dests = [EMAIL_ADMIN, c.FiscalEmail, c.GestorEmail].filter(function(x){return x;});
    const uniq = dests.filter(function(v,i){return dests.indexOf(v)===i;});
    const assunto = '⚠ Contrato vence em ' + diff + ' dias — ' + c.Numero + ' | ' + c.Empresa;
    const linhas = [['Nº',c.Numero],['Tipo',c.Tipo],['Empresa',c.Empresa],['CNPJ',c.CNPJ],['Objeto',c.Objeto],['Vigência',c.VigenciaInicio+' a '+c.VigenciaFim],['Valor Total',formatBRL(c.ValorTotal)],['Fiscal',c.FiscalNome||'—'],['Gestor',c.GestorNome||'—']];
    var rows = '';
    for (var i=0;i<linhas.length;i++){ rows += '<tr style="background:'+(i%2?'#f5f5f3':'#fff')+'"><td style="padding:9px 14px;font-weight:700;width:38%;border-bottom:1px solid #e2e2de">'+linhas[i][0]+'</td><td style="padding:9px 14px;border-bottom:1px solid #e2e2de">'+(linhas[i][1]||'—')+'</td></tr>'; }
    const html = '<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto"><div style="background:#1d6aad;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0"><h2 style="margin:0;font-size:18px">⚠ Alerta de Vencimento de Contrato</h2><p style="margin:6px 0 0;opacity:.85;font-size:13px">Fundação Hospital Santa Lydia</p></div><div style="background:#fff;padding:24px;border:1px solid #e2e2de;border-top:none;border-radius:0 0 8px 8px"><p style="font-size:15px;margin:0 0 16px">O contrato abaixo vence em <strong style="color:#b91c1c">'+diff+' dias</strong> ('+c.VigenciaFim+').</p><table style="width:100%;border-collapse:collapse;font-size:13px">'+rows+'</table><div style="margin-top:18px;padding:13px;background:#fefce8;border:1px solid #fde68a;border-radius:6px;font-size:13px;color:#a16207"><strong>Ação necessária:</strong> Verificar prorrogação, termo aditivo ou encerramento.</div></div></div>';
    uniq.forEach(function(em){ MailApp.sendEmail({ to:em, subject:assunto, htmlBody:html }); });
  });
}

// ── EXTRAÇÃO DE PDF COM IA (servidor, sem CORS) ──────────
function extrairPdfComIA(payload) {
  if (!API_KEY || API_KEY === 'COLE_SUA_CHAVE_ANTHROPIC_AQUI')
    return { ok:false, message:'Chave da API não configurada no Apps Script (API_KEY).' };
  if (!payload || !payload.pdfBase64) return { ok:false, message:'PDF não recebido.' };
  const prompt = 'Analise este contrato administrativo brasileiro e extraia as informações no formato JSON abaixo. '
    + 'Responda APENAS com JSON válido, sem texto adicional nem markdown.\n'
    + '{"numero":"","tipo":"Contrato ou Termo Aditivo","statusContrato":"Vigente","processo":"",'
    + '"dataAssinatura":"DD/MM/AAAA","lei":"","foro":"","contratante":"","cnpjContratante":"",'
    + '"empresa":"","cnpj":"","objeto":"","unidades":[{"nome":"","valorMensal":0}],'
    + '"vigenciaInicio":"DD/MM/AAAA","vigenciaFim":"DD/MM/AAAA","prorrogacao":"","valorTotal":0,"valorMensal":0,'
    + '"formaPagamento":"","prazoPagamento":"","indiceReajuste":"","periodicidade":"",'
    + '"fiscalNome":"","fiscalEmail":"","fiscalCargo":"","gestorNome":"","gestorEmail":"","gestorCargo":"",'
    + '"subcontratacao":"","garantia":"","multaMin":"","multaMax":"","observacoes":""}\n'
    + 'Se um campo não existir, use null ou array vazio.';
  const body = { model:'claude-sonnet-4-6', max_tokens:2000, messages:[{ role:'user', content:[
    { type:'document', source:{ type:'base64', media_type:'application/pdf', data:payload.pdfBase64 } },
    { type:'text', text:prompt } ] }] };
  var resp;
  try {
    resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method:'post', contentType:'application/json',
      headers:{ 'x-api-key':API_KEY, 'anthropic-version':'2023-06-01' },
      payload:JSON.stringify(body), muteHttpExceptions:true });
  } catch(err) { return { ok:false, message:'Falha ao chamar a IA: '+String(err) }; }
  if (resp.getResponseCode() !== 200)
    return { ok:false, message:'Erro da API ('+resp.getResponseCode()+'): '+resp.getContentText().slice(0,300) };
  var text = '';
  try { var j = JSON.parse(resp.getContentText()); text = (j.content||[]).map(function(x){return x.text||'';}).join(''); }
  catch(err){ return { ok:false, message:'Resposta inválida da IA.' }; }
  var dados;
  try { var clean = text.replace(/\`\`\`json|\`\`\`/g,'').trim(); dados = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}')+1)); }
  catch(err){ return { ok:false, message:'Não foi possível interpretar os dados extraídos.' }; }
  return { ok:true, data:dados };
}

function formatBRL(val){ var n=parseFloat(val)||0; return 'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }