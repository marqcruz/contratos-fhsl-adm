# TDNGo — serviço de e-mail dos Contratos

O serviço fica separado do frontend estático e escuta apenas em `127.0.0.1:8081`.
As credenciais SMTP são salvas criptografadas no Supabase e a chave de criptografia fica somente no servidor.

## 1. Preparar variáveis

```bash
cd ~/projetos/contratos-fhsl-adm/mail-api
cp .env.example .env
chmod 600 .env
openssl rand -base64 48
```

Edite `.env` e informe:
- `SUPABASE_SERVICE_ROLE_KEY`: chave service role do projeto TDNGo;
- `TDN_MAIL_MASTER_KEY`: valor aleatório gerado acima.

Nunca publique o arquivo `.env` no Git.

## 2. Criar e iniciar o container

```bash
podman build -t tdngo-mail-api -f Containerfile .
podman rm -f tdngo-mail-api 2>/dev/null || true
podman run -d \
  --name tdngo-mail-api \
  --restart=always \
  --env-file .env \
  -p 127.0.0.1:8081:8081 \
  tdngo-mail-api
```

Teste no próprio servidor:

```bash
curl http://127.0.0.1:8081/health
```

Resposta esperada:

```json
{"ok":true,"service":"tdngo-mail-api"}
```

## 3. Apache

A rota da API deve ficar ANTES da rota geral do TDN:

```apache
ProxyPass        /tdn/api/email/ http://127.0.0.1:8081/
ProxyPassReverse /tdn/api/email/ http://127.0.0.1:8081/

ProxyPass        /tdn/ http://127.0.0.1:8080/
ProxyPassReverse /tdn/ http://127.0.0.1:8080/
```

Depois:

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## 4. Configurar no TDN

Acesse **Administração → E-mail SMTP**, salve a configuração e execute primeiro **Testar conexão**.
Depois envie um e-mail de teste.

A senha SMTP nunca é retornada ao navegador depois de salva.
