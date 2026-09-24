import base64
import hashlib
import hmac
import html
import json
import os
import secrets
import smtplib
import ssl
import time
from email.message import EmailMessage
from urllib.parse import quote

import requests
from cryptography.fernet import Fernet, InvalidToken
from flask import Flask, Response, jsonify, request

app = Flask(__name__)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://nsbhhmrhzkqkaoznaeif.supabase.co").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
MASTER_KEY = os.environ.get("TDN_MAIL_MASTER_KEY", "")
HTTP_TIMEOUT = float(os.environ.get("HTTP_TIMEOUT", "15"))
PUBLIC_BASE_URL = os.environ.get("TDN_MAIL_PUBLIC_BASE_URL", "https://app.hospitalsantalydia.com.br/tdn/api/email").rstrip("/")

if not SERVICE_KEY:
    raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY não configurada.")
if not MASTER_KEY:
    raise RuntimeError("TDN_MAIL_MASTER_KEY não configurada.")

REST = SUPABASE_URL + "/rest/v1"
AUTH_API = SUPABASE_URL + "/functions/v1/tdngo-auth-api"
DB_HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": "Bearer " + SERVICE_KEY,
    "Content-Type": "application/json",
}

ADMIN_ROLES = {"admin", "desenvolvedor", "developer", "master"}
SEND_ROLES = ADMIN_ROLES | {"gestor"}
VALID_TYPES = {"NOVO_CONTRATO", "ADITIVO", "VENCIMENTO", "PERSONALIZADO", "TESTE"}
PIXEL_GIF = base64.b64decode("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==")

def ok(**data):
    return jsonify({"ok": True, **data})

def fail(message, status=400):
    return jsonify({"ok": False, "message": str(message)}), status

def db(method, path, payload=None, prefer=None):
    headers = dict(DB_HEADERS)
    if prefer:
        headers["Prefer"] = prefer
    r = requests.request(
        method,
        REST + "/" + path.lstrip("/"),
        headers=headers,
        json=payload,
        timeout=HTTP_TIMEOUT,
    )
    if not r.ok:
        try:
            detail = r.json().get("message") or r.text
        except Exception:
            detail = r.text
        raise RuntimeError(detail or ("HTTP " + str(r.status_code)))
    if not r.text:
        return None
    try:
        return r.json()
    except Exception:
        return r.text

def b64url(raw):
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")

def decode_payload(raw):
    padded = raw + ("=" * (-len(raw) % 4))
    return json.loads(base64.urlsafe_b64decode(padded.encode()).decode())

def current_user():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None

    token = auth[7:].strip()
    if not token:
        return None

    # A própria API de autenticação do TDN valida assinatura e expiração.
    # Uma ação inexistente só é alcançada depois que a sessão foi validada.
    try:
        vr = requests.post(
            AUTH_API,
            headers={
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json",
            },
            json={"action": "__tdngo_mail_session_check__"},
            timeout=HTTP_TIMEOUT,
        )
    except requests.RequestException:
        return None

    if vr.status_code == 401:
        return None

    try:
        vj = vr.json()
    except Exception:
        return None

    # No auth-api atual, uma sessão válida com ação desconhecida retorna 400.
    # Qualquer outro retorno inesperado é rejeitado.
    if not (vr.status_code == 400 and str(vj.get("message") or "") == "Ação desconhecida."):
        return None

    # A assinatura já foi validada pelo auth-api; daqui extraímos somente o e-mail
    # para carregar o usuário real no banco.
    parts = token.split(".")
    if len(parts) != 2:
        return None
    try:
        data = decode_payload(parts[0])
    except Exception:
        return None

    email = str(data.get("email") or "").strip().lower()
    if not email:
        return None

    rows = db(
        "GET",
        "usuarios?email=eq." + quote(email, safe="") +
        "&ativo=eq.true&select=id,legacy_id,nome,email,role,modulos&limit=1",
    ) or []
    if not rows:
        return None

    user = rows[0]
    mods = user.get("modulos") or []
    if isinstance(mods, str):
        mods = [x.strip() for x in mods.split(",") if x.strip()]

    if str(user.get("role") or "").lower() not in ADMIN_ROLES and mods and "contratos" not in mods:
        return None

    return user

def require_user():
    user = current_user()
    if not user:
        return None, fail("Sessão inválida ou sem acesso ao módulo Contratos.", 401)
    return user, None

def is_admin(user):
    return str(user.get("role") or "").lower() in ADMIN_ROLES

def can_send(user):
    return str(user.get("role") or "").lower() in SEND_ROLES

def get_contract(legacy_id):
    rows = db(
        "GET",
        "contratos?legacy_id=eq." + quote(str(legacy_id), safe="") +
        "&select=id,legacy_id,numero,tipo,empresa_legacy_nome,fiscal_email,gestor_email,"
        "contrato_pai_id,contrato_pai_legacy,vigencia_inicio,vigencia_fim,objeto&limit=1",
    ) or []
    return rows[0] if rows else None

def can_access_contract(user, contract):
    if is_admin(user):
        return True
    links = db(
        "GET",
        "usuario_modulo_unidades?usuario_id=eq." + quote(str(user["id"]), safe="") +
        "&modulo=eq.contratos&select=unidade_id",
    ) or []
    allowed = {str(x.get("unidade_id")) for x in links if x.get("unidade_id")}
    if not allowed:
        return False
    units = db(
        "GET",
        "contrato_unidades?contrato_id=eq." + quote(str(contract["id"]), safe="") +
        "&select=unidade_id",
    ) or []
    return any(str(x.get("unidade_id")) in allowed for x in units if x.get("unidade_id"))

def fernet():
    derived = hashlib.sha256(MASTER_KEY.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(derived))

def encrypt_password(value):
    return fernet().encrypt(value.encode()).decode() if value else None

def decrypt_password(value):
    if not value:
        return ""
    try:
        return fernet().decrypt(value.encode()).decode()
    except InvalidToken as exc:
        raise RuntimeError("Não foi possível descriptografar a senha SMTP. Verifique TDN_MAIL_MASTER_KEY.") from exc

def load_config():
    rows = db("GET", "contrato_email_config?id=eq.1&select=*&limit=1") or []
    if not rows:
        raise RuntimeError("Configuração de e-mail não encontrada.")
    return rows[0]

def config_public(cfg):
    return {
        "smtp_host": cfg.get("smtp_host") or "",
        "smtp_port": int(cfg.get("smtp_port") or 587),
        "smtp_security": cfg.get("smtp_security") or "starttls",
        "smtp_username": cfg.get("smtp_username") or "",
        "password_set": bool(cfg.get("smtp_password_enc")),
        "from_email": cfg.get("from_email") or "",
        "from_name": cfg.get("from_name") or "TDN - Gestão de Contratos",
        "reply_to": cfg.get("reply_to") or "",
        "default_cc": cfg.get("default_cc") or [],
        "enabled": bool(cfg.get("enabled")),
        "updated_at": cfg.get("atualizado_em"),
    }

def addresses(value):
    if isinstance(value, list):
        raw = value
    else:
        raw = str(value or "").replace(";", ",").split(",")
    out = []
    seen = set()
    for item in raw:
        email = str(item or "").strip().lower()
        if email and "@" in email and email not in seen:
            seen.add(email)
            out.append(email)
    return out

def smtp_connect(cfg):
    host = str(cfg.get("smtp_host") or "").strip()
    port = int(cfg.get("smtp_port") or 0)
    mode = str(cfg.get("smtp_security") or "starttls").lower()
    if not host or not port:
        raise RuntimeError("Servidor SMTP e porta são obrigatórios.")
    context = ssl.create_default_context()
    if mode == "ssl":
        client = smtplib.SMTP_SSL(host, port, timeout=20, context=context)
    else:
        client = smtplib.SMTP(host, port, timeout=20)
        client.ehlo()
        if mode == "starttls":
            client.starttls(context=context)
            client.ehlo()
    username = str(cfg.get("smtp_username") or "").strip()
    password = decrypt_password(cfg.get("smtp_password_enc"))
    if username:
        if not password:
            client.quit()
            raise RuntimeError("Usuário SMTP configurado sem senha.")
        client.login(username, password)
    return client

def send_message(cfg, to_list, cc_list, subject, body, tracking_token=None):
    sender = str(cfg.get("from_email") or cfg.get("smtp_username") or "").strip()
    if not sender:
        raise RuntimeError("E-mail remetente não configurado.")
    msg = EmailMessage()
    msg["From"] = (str(cfg.get("from_name") or "").strip() + " <" + sender + ">").strip()
    msg["To"] = ", ".join(to_list)
    if cc_list:
        msg["Cc"] = ", ".join(cc_list)
    if cfg.get("reply_to"):
        msg["Reply-To"] = str(cfg["reply_to"]).strip()
    msg["Subject"] = subject
    msg.set_content(body)

    if tracking_token:
        safe_body = html.escape(body).replace("\n", "<br>\n")
        pixel_url = PUBLIC_BASE_URL + "/open/" + quote(tracking_token, safe="")
        html_body = (
            '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">'
            + safe_body
            + '</div>'
            + '<img src="' + html.escape(pixel_url, quote=True) + '" width="1" height="1" alt="" '
              'style="display:block;width:1px;height:1px;border:0;opacity:0" />'
        )
        msg.add_alternative(html_body, subtype="html")

    client = smtp_connect(cfg)
    try:
        client.send_message(msg)
    finally:
        try:
            client.quit()
        except Exception:
            pass

def audit(user, action, entity_id, details, modulo="CONTRATOS"):
    try:
        db(
            "POST",
            "auditoria",
            {
                "modulo": modulo,
                "entidade": "email_contratos",
                "entidade_id": str(entity_id or "SMTP"),
                "acao": action,
                "detalhes": details,
                "usuario_id": user.get("id"),
                "usuario_nome": user.get("nome") or "",
                "usuario_email": user.get("email") or "",
                "dados": {},
            },
            "return=minimal",
        )
    except Exception:
        pass

def save_history(user, contract, communication_type, to_list, cc_list, subject, body, status, error=None, tracking_token=None):
    payload = {
        "contrato_id": contract.get("id") if contract else None,
        "contrato_legacy_id": contract.get("legacy_id") if contract else None,
        "documento_numero": contract.get("numero") if contract else None,
        "documento_tipo": contract.get("tipo") if contract else None,
        "empresa": contract.get("empresa_legacy_nome") if contract else None,
        "tipo_comunicacao": communication_type,
        "destinatarios": to_list,
        "cc": cc_list,
        "assunto": subject,
        "corpo": body,
        "status": status,
        "erro": str(error)[:2000] if error else None,
        "enviado_por": user.get("id"),
        "enviado_por_nome": user.get("nome") or "",
        "enviado_por_email": user.get("email") or "",
        "enviado_em": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()) if status == "ENVIADO" else None,
        "tracking_token": tracking_token,
    }
    rows = db("POST", "contrato_email_historico", payload, "return=representation") or []
    return rows[0] if isinstance(rows, list) and rows else None

def update_history(history_id, **changes):
    if not history_id:
        return
    db(
        "PATCH",
        "contrato_email_historico?id=eq." + quote(str(history_id), safe=""),
        changes,
        "return=minimal",
    )

@app.get("/health")
def health():
    return ok(service="tdngo-mail-api")

@app.get("/open/<token>")
def register_open(token):
    # Endpoint público usado apenas pelo pixel 1x1. O token é aleatório e não
    # contém e-mail, contrato ou outro dado identificável.
    if 20 <= len(token) <= 128 and all(ch.isalnum() or ch in "-_" for ch in token):
        try:
            db("POST", "rpc/contrato_email_registrar_abertura", {"p_token": token})
        except Exception:
            # O carregamento da imagem nunca deve revelar se o token existe.
            app.logger.exception("Falha ao registrar abertura de e-mail")

    response = Response(PIXEL_GIF, mimetype="image/gif")
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0, private"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response

@app.get("/config")
def get_config():
    user, error = require_user()
    if error:
        return error
    if not is_admin(user):
        return fail("Apenas administradores podem acessar a configuração SMTP.", 403)
    return ok(config=config_public(load_config()))

@app.put("/config")
def put_config():
    user, error = require_user()
    if error:
        return error
    if not is_admin(user):
        return fail("Apenas administradores podem alterar a configuração SMTP.", 403)
    body = request.get_json(silent=True) or {}
    current = load_config()
    security = str(body.get("smtp_security") or "starttls").lower()
    if security not in {"starttls", "ssl", "none"}:
        return fail("Tipo de segurança SMTP inválido.")
    host = str(body.get("smtp_host") or "").strip()
    from_email = str(body.get("from_email") or "").strip()
    if not host:
        return fail("Informe o servidor SMTP.")
    try:
        port = int(body.get("smtp_port") or 0)
    except Exception:
        return fail("Porta SMTP inválida.")
    if port < 1 or port > 65535:
        return fail("Porta SMTP inválida.")
    payload = {
        "smtp_host": host,
        "smtp_port": port,
        "smtp_security": security,
        "smtp_username": str(body.get("smtp_username") or "").strip() or None,
        "from_email": from_email or None,
        "from_name": str(body.get("from_name") or "TDN - Gestão de Contratos").strip(),
        "reply_to": str(body.get("reply_to") or "").strip() or None,
        "default_cc": addresses(body.get("default_cc")),
        "enabled": bool(body.get("enabled")),
        "atualizado_por": user.get("id"),
        "atualizado_em": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    password = str(body.get("smtp_password") or "")
    if password:
        payload["smtp_password_enc"] = encrypt_password(password)
    elif body.get("clear_password"):
        payload["smtp_password_enc"] = None
    else:
        payload["smtp_password_enc"] = current.get("smtp_password_enc")
    db("PATCH", "contrato_email_config?id=eq.1", payload, "return=minimal")
    audit(user, "Atualizou configuração SMTP", "SMTP", host + ":" + str(port), "ADMIN")
    return ok(config=config_public(load_config()))

@app.post("/test")
def test_smtp():
    user, error = require_user()
    if error:
        return error
    if not is_admin(user):
        return fail("Apenas administradores podem testar o SMTP.", 403)
    body = request.get_json(silent=True) or {}
    cfg = load_config()
    target = addresses(body.get("to"))
    if target:
        subject = "TDN | Teste de configuração de e-mail"
        text = (
            "Este é um e-mail de teste enviado pelo TDN - Gestão de Contratos.\n\n"
            "Se você recebeu esta mensagem, a configuração SMTP está funcional."
        )
        try:
            send_message(cfg, target, [], subject, text)
            save_history(user, None, "TESTE", target, [], subject, text, "ENVIADO")
            audit(user, "Enviou e-mail de teste", "SMTP", ", ".join(target), "ADMIN")
            return ok(message="E-mail de teste enviado.")
        except Exception as exc:
            try:
                save_history(user, None, "TESTE", target, [], subject, text, "ERRO", exc)
            except Exception:
                pass
            return fail(str(exc), 502)
    try:
        client = smtp_connect(cfg)
        try:
            client.noop()
        finally:
            try:
                client.quit()
            except Exception:
                pass
        return ok(message="Conexão e autenticação SMTP concluídas.")
    except Exception as exc:
        return fail(str(exc), 502)

@app.post("/send")
def send_contract_email():
    user, error = require_user()
    if error:
        return error
    if not can_send(user):
        return fail("Seu perfil não possui permissão para enviar comunicações de contratos.", 403)
    body = request.get_json(silent=True) or {}
    legacy_id = str(body.get("contract_id") or "").strip()
    contract = get_contract(legacy_id)
    if not contract:
        return fail("Contrato não encontrado.", 404)
    if not can_access_contract(user, contract):
        return fail("Sem acesso a este contrato.", 403)
    cfg = load_config()
    if not cfg.get("enabled"):
        return fail("O envio de e-mail está desativado na Administração.", 409)
    communication_type = str(body.get("type") or "PERSONALIZADO").upper()
    if communication_type not in VALID_TYPES or communication_type == "TESTE":
        return fail("Tipo de comunicação inválido.")
    to_list = addresses(body.get("to"))
    if not to_list:
        return fail("Informe ao menos um destinatário.")
    cc_list = addresses(body.get("cc"))
    cc_list = addresses(cc_list + addresses(cfg.get("default_cc") or []))
    cc_list = [x for x in cc_list if x not in set(to_list)]
    subject = str(body.get("subject") or "").strip()
    text = str(body.get("body") or "").strip()
    if not subject or not text:
        return fail("Assunto e mensagem são obrigatórios.")
    tracking_token = secrets.token_urlsafe(32)
    history_row = None
    try:
        history_row = save_history(
            user, contract, communication_type, to_list, cc_list,
            subject, text, "PENDENTE", tracking_token=tracking_token
        )
        if not history_row or not history_row.get("id"):
            raise RuntimeError("Não foi possível criar o registro da comunicação.")

        send_message(cfg, to_list, cc_list, subject, text, tracking_token=tracking_token)
        update_history(
            history_row["id"],
            status="ENVIADO",
            erro=None,
            enviado_em=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        )
        audit(user, "Enviou comunicação por e-mail", legacy_id, subject + " | " + ", ".join(to_list))
        return ok(message="E-mail enviado e registrado no histórico.")
    except Exception as exc:
        try:
            if history_row and history_row.get("id"):
                update_history(history_row["id"], status="ERRO", erro=str(exc)[:2000])
            else:
                save_history(user, contract, communication_type, to_list, cc_list, subject, text, "ERRO", exc)
        except Exception:
            pass
        audit(user, "Falha no envio de e-mail", legacy_id, subject + " | " + str(exc))
        return fail(str(exc), 502)

@app.get("/history")
def history():
    user, error = require_user()
    if error:
        return error
    legacy_id = str(request.args.get("contract_id") or "").strip()
    contract = get_contract(legacy_id)
    if not contract:
        return fail("Contrato não encontrado.", 404)
    if not can_access_contract(user, contract):
        return fail("Sem acesso a este contrato.", 403)
    rows = db(
        "GET",
        "contrato_email_historico?contrato_legacy_id=eq." + quote(legacy_id, safe="") +
        "&select=id,tipo_comunicacao,destinatarios,cc,assunto,corpo,status,erro,"
        "enviado_por_nome,enviado_por_email,enviado_em,criado_em,primeira_abertura_em,"
        "ultima_abertura_em,quantidade_aberturas&order=criado_em.desc&limit=100",
    ) or []
    return ok(data=rows)

@app.errorhandler(Exception)
def unexpected(exc):
    app.logger.exception("Erro não tratado")
    return fail("Falha interna no serviço de e-mail.", 500)
