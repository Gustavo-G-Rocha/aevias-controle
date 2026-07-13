# Política de Sanitização contra XSS

## Visão Geral

Este documento descreve a política de sanitização de dados adotada no sistema
para prevenir ataques de **Cross-Site Scripting (XSS)** — tanto armazenado
(stored XSS) quanto refletido — e **Server-Side Template Injection (SSTI)**.

## Princípio Fundamental

**Texto puro (plain text) por padrão.** Nenhum HTML é permitido em campos de
texto livre do usuário. A única exceção seria um editor rich-text explicitamente
suportado (não utilizado atualmente neste sistema), caso em que uma whitelist
restrita de tags seria aplicada via biblioteca dedicada (ex.: DOMPurify).

## Camadas de Defesa

### 1. Sanitização na Entrada (Front-end)

**Arquivo:** `src/utils/dataSanitization.js` — função `sanitizeText`

Aplicada via `sanitizeTextFields` antes de persistir dados. Operações:

| Operação | Padrão | Exemplo |
|---|---|---|
| Remover tags perigosas + conteúdo | `script, iframe, object, embed, style, svg, math, template, noscript, noframes, applet, xml` | `<script>alert(1)</script>` → `''` |
| Remover tags perigosas void | `link, meta, base, form, input, button` | `<meta http-equiv="refresh">` → `''` |
| Remover event handlers | `on\w+=...` | `onerror=alert(1)` → `''` |
| Remover protocolos perigosos | `javascript:, vbscript:, data:text/html` | `javascript:alert(1)` → `alert(1)` |
| Neutralizar template syntax | `{{ }}` → `{ { } }`, `<% %>` → `< % % >` | `{{7*7}}` → `{ {7*7} }` |
| Remover caracteres de controle | `\x00-\x1F` (exceto `\t \n \r`) | previne bypass via encoding |
| Limite de tamanho | 10.000 caracteres (configurável) | previne payloads excessivos |

**Tags não-perigosas** (ex.: `<b>`, `<img>`, `<tags>`) são **preservidas como
texto literal**. O React escapa automaticamente os caracteres `<` e `>` na
renderização via `{}`, garantindo que sejam exibidos como texto visível — nunca
interpretados como HTML.

### 2. Sanitização no Back-end

Dois backend functions aplicam sanitização server-side:

**`base44/functions/validarESalvarRegistro/entry.ts`** — sanitiza todos os
campos de texto via `sanitizeTextFields` antes de persistir (create/update).

**`base44/functions/gerenciarAprovacao/entry.ts`** — sanitiza `rejectionReason`
(motivo da reprovação) antes de atribuí-lo a `rejection_reason` e
`cliente_reprovacao_motivo`. Texto livre do approver que antes era persistido
sem sanitização — agora passa pela mesma política.

Isto garante que mesmo chamadas diretas à API (bypassando o front-end) sejam
sanitizadas. **Nunca confiar apenas no front-end.**

### 3. Escaping na Saída (Renderização)

**Framework:** React + JSX

O React escapa automaticamente todo conteúdo interpolado via `{}`. Auditoria
realizada confirmou:

- ✅ **Zero** usos de `dangerouslySetInnerHTML` no código
- ✅ **Zero** atribuições diretas de `innerHTML`
- ✅ **Zero** usos de `v-html` (não aplicável — app é React)

Conclusão: toda renderização em tela é segura por padrão.

### 4. Escaping na Geração de PDF

**Mecanismo:** Browser print-to-PDF via CSS `@media print`

Os relatórios são componentes React renderizados normalmente e impressos via
`window.print()`. Como o React escapa todo conteúdo, o HTML gerado para
impressão é seguro — nenhum conteúdo do usuário é interpretado como HTML.

**Exportação ZIP (backend):** A função `exportarEnsaiosPDF` busca HTML de
relatórios via URL interna (construída server-side, sem input do usuário) e
empacota em ZIP. O HTML nunca é injetado no DOM — é armazenado como arquivo.
Nomes de arquivo são sanitizados via `sanitizeFileName` (allowlist de
caracteres).

### 5. Content-Security-Policy (CSP)

**Arquivo:** `index.html`

Meta tag CSP configurada como camada adicional de defesa em profundidade:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: blob: https:;
connect-src 'self' https:;
frame-ancestors 'none';
object-src 'none';
base-uri 'self';
```

> `object-src 'none'` bloqueia `<object>`, `<embed>`, `<applet>`.
> `frame-ancestors 'none'` previne clickjacking.
> `base-uri 'self'` previne hijack de `<base>`.

## Campos Afetados

A sanitização via `sanitizeTextFields` é recursiva — aplica-se a **todos** os
campos de texto livre em **todas** as entidades:

- `DiarioObra.atividades_realizadas`, `DiarioObra.observacoes`
- `RelatorioNC.descricao_nc`, `RelatorioNC.acoes`
- `ChecklistTerraplanagem.observacoes_gerais`
- `ChecklistConcretagem.observacoes_gerais`
- `EnsaioProctor.observacoes`
- `CertificacaoUsina.observacoes_gerais`
- Todos os campos `descricao`, `observacoes`, `acoes_corretivas_descricao`
- Todos os itens em arrays `nao_conformidades[].descricao`

## Validação Complementar

- **Encoding:** Entrada normalizada para UTF-8; caracteres de controle removidos
- **Tamanho:** Limite de 10.000 caracteres por campo (configurável via `options.maxLength`)
- **CSP:** Configurado em `index.html` como defesa em profundidade

## Testes

- **Unitários:** `src/tests/utils/dataSanitization.test.js` — testes de contrato
- **Segurança:** `src/tests/security/xssSanitization.test.js` — suíte dedicada
  com payloads clássicos de XSS e SSTI

## Critérios de Aceite

1. ✅ Nenhum payload de XSS testado é executado na tela nem no PDF gerado
2. ✅ Todos os campos de texto livre passam pela mesma política de sanitização
3. ✅ Existem testes automatizados cobrindo os payloads do escopo
4. ✅ A sanitização ocorre no back-end, independentemente do front-end