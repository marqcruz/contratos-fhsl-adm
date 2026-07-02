# Sistema de Gestão de Contratos — FHSL

Sistema interno de gestão de contratos da Fundação Hospital Santa Lydia.
Front-end em HTML único (`index.html`) + back-end em Google Apps Script sobre Google Sheets.

---

## Como colocar em produção (GitHub Pages)

> Repositório **público** é necessário para o GitHub Pages gratuito.
> Antes de publicar, leia a seção "Segurança" abaixo.

1. Crie um repositório no GitHub (ex.: `contratos-fhsl`).
2. Envie o arquivo **`index.html`** para o repositório (Add file → Upload files → Commit).
3. Vá em **Settings → Pages**.
4. Em **Build and deployment → Source**, selecione **Deploy from a branch**.
5. Branch: **main**, pasta: **/ (root)**. Salve.
6. Aguarde 1–2 minutos. O endereço aparece no topo da página:
   `https://<sua-conta>.github.io/contratos-fhsl/`
7. Distribua esse link internamente. Para atualizar o sistema no futuro,
   basta substituir o `index.html` no repositório — o endereço não muda.

---

## Arquitetura

- **Front-end:** `index.html` (interface, roda no navegador do usuário).
- **Back-end:** Google Apps Script publicado como "App da Web", conectado a uma
  planilha Google Sheets que funciona como banco de dados.
- **PDFs:** salvos numa pasta do Google Drive ("Contratos FHSL - PDFs").
- **Autenticação:** e-mail + senha, com senha protegida por hash SHA-256 na planilha.
- A URL do Apps Script fica fixa (travada) no `index.html`.

Adequado para dezenas/centenas de contratos e poucos usuários simultâneos.

---

## Segurança — checklist antes de liberar

- [ ] **Trocar a senha do admin padrão.** O primeiro acesso é
      `admin@fhsl.com.br` / `admin123`. Entre, crie seu usuário real com senha
      forte e, em seguida, **exclua o admin padrão ou troque a senha dele**.
- [ ] **Chave da API Anthropic:** confirmar que a chave colada no Apps Script
      (constante `API_KEY`) é válida e **não** foi compartilhada publicamente.
      Se houver qualquer dúvida, gere uma nova no console da Anthropic.
- [ ] **Ciência do time de TI:** o Apps Script é publicado com acesso
      "Qualquer pessoa" (necessário para o sistema funcionar sem cada usuário
      logar no Google). A proteção dos dados está no **login do sistema**
      (senha com hash), não na URL. Para uso interno com poucos usuários é um
      risco baixo e controlado.
- [ ] **Repositório público:** o código-fonte do `index.html` fica visível.
      Ele **não** contém senhas nem a chave da API (essas ficam no servidor do
      Google). Contém a URL do Apps Script, que sozinha não dá acesso aos dados
      sem login válido.

---

## Manutenção do Apps Script

Ao atualizar o código do Apps Script, **sempre** republique assim para manter a
mesma URL (e não precisar mexer no `index.html`):

**Implantar → Gerenciar implantações → (ícone de lápis) Editar →
Versão: Nova versão → Implantar.**

Evite "Nova implantação", que gera uma URL diferente.

---

## Gatilho de e-mail (avisos de vencimento)

No Apps Script, em **Gatilhos (ícone de relógio) → Adicionar gatilho**:
função `verificarVencimentos`, temporizador por dia, entre 8h e 9h.
Envia aviso ao admin, fiscal e gestor quando faltam 60, 30 e 15 dias
para o vencimento.
