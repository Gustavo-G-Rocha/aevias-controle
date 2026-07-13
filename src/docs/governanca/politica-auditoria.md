# Política de Auditoria — Trilha de Auditoria (AuditTrail)

## Visão Geral

A entidade `AuditTrail` registra de forma **imutável** todas as ações sensíveis
do sistema, com metadados de contexto (IP, dispositivo, papel do ator) para
permitir reconstrução forense de "quem fez o quê, quando, de onde e com qual
resultado".

## Eventos Auditados

### 1. Autenticação e Sessão

| Evento | Operation | Ponto de Instrumentação |
|--------|-----------|------------------------|
| Login bem-sucedido | `login_success` | `Login.jsx` → `logLoginSuccess()` |
| Login falho | `login_failure` | `Login.jsx` → `logLoginFailure()` |
| Logout manual | `logout` | `AuthContext.jsx` → `logLogout('manual')` |
| Logout por inatividade | `logout_inactivity` | `AuthContext.jsx` → `logLogout('inactivity')` |
| Solicitação de reset | `password_reset_request` | `ForgotPassword.jsx` → `logPasswordResetRequest()` |
| Redefinição de senha | `password_reset` | `ResetPassword.jsx` → `logPasswordReset()` |

### 2. Aprovações e Status

| Evento | Operation | Ponto de Instrumentação |
|--------|-----------|------------------------|
| Aprovação | `approve` | `gerenciarAprovacao` (backend) |
| Reprovação | `reject` | `gerenciarAprovacao` (backend) |
| Assinatura digital | `sign` | `gerenciarAprovacao` (backend) |
| Aprovação NC | `approve_nc` | `gerenciarAprovacao` (backend) |
| Reprovação NC | `reject_nc` | `gerenciarAprovacao` (backend) |

### 3. Documentos e Registros

| Evento | Operation | Ponto de Instrumentação |
|--------|-----------|------------------------|
| Criação | `create` | `validarESalvarRegistro` (backend) |
| Edição | `update` | `validarESalvarRegistro` (backend) |
| Exclusão | `delete` | `gerenciarAprovacao` (backend) |
| Exportação PDF | `report_exported` | `exportarEnsaiosPDF` (backend) |

### 4. Permissões e Papéis

| Evento | Operation | Ponto de Instrumentação |
|--------|-----------|------------------------|
| Criação de usuário | `user_created` | `useUsersActions.js` → `logUserCreated()` |
| Alteração de permissão | `permission_updated` | `useUsersActions.js` → `logPermissionUpdated()` |
| Desativação de conta | `user_deactivated` | `useUsersActions.js` → `logUserDeactivated()` |

## Estrutura de Cada Entrada

```
AuditTrail {
  entity_name:      string    — entidade afetada (ex: EnsaioCAUQ, AuthSession, User)
  entity_id:        string    — ID do registro afetado
  operation:        string    — tipo do evento (enum completo acima)
  changes:          array     — diff campo-a-campo [{field, old_value, new_value}]
  changed_by:       string    — email do ator
  changed_by_name:  string    — nome do ator
  actor_role:       string    — papel/nível de acesso no momento da ação
  ip_address:       string    — IP de origem (X-Forwarded-For → X-Real-IP)
  device_info:      string    — User-Agent (truncado em 500 chars)
  result:           enum      — "success" | "failure"
  failure_reason:   string    — motivo do fracasso (quando result = failure)
  chain_hash:       string    — SHA-256 do conteúdo + hash anterior
  previous_hash:    string    — hash da entrada anterior (cadeia tamper-evident)
  client_timestamp: datetime  — timestamp do cliente (edições offline)
  is_offline_sync:  boolean   — se veio de sincronização offline
}
```

## Captura de IP e Dispositivo

### IP
- Prioriza `X-Forwarded-For` (primeiro IP da cadeia — cliente original).
- Fallback: `X-Real-IP`.
- Capturado server-side em todos os pontos de auditoria.

### Dispositivo
- Captura `User-Agent` do cabeçalho da requisição.
- Truncado em 500 caracteres para evitar armazenamento excessivo.

### LGPD — Dados Pessoais
IP é dado pessoal sob LGPD (Art. 7º, IV). Tratamento:
- **Finalidade:** investigação de incidentes de segurança e conformidade.
- **Retenção:** ver seção abaixo.
- **Acesso:** restrito a administradores e gestores de contrato (RLS).

## Imutabilidade (Append-Only)

### RLS
- **create:** sem restrição (qualquer usuário autenticado pode inserir).
- **read:** admin, sala_tecnica, gestor_contrato, ou criador da entrada.
- **update:** **ninguém** — `user_condition: { role: "__append_only__" }` (role inexistente).
- **delete:** **ninguém** — mesma condição impossível.

Backend functions usam `asServiceRole` (bypassa RLS) para **inserir** entradas,
mas **nunca** atualizam ou excluem entradas existentes.

### Integridade Tamper-Evident (Chain Hash)

Cada entrada inclui:
- `chain_hash`: SHA-256 do conteúdo da entrada + `previous_hash`.
- `previous_hash`: `chain_hash` da entrada anterior (null na primeira).

Para verificar integridade da cadeia:
1. Ordene entradas por `created_date` ascendente.
2. Recompute `chain_hash` para cada entrada.
3. Verifique se cada `previous_hash` corresponde ao `chain_hash` da entrada anterior.
4. Qualquer divergência indica adulteração.

## Consulta e Filtragem

### Interface
A página **Histórico de Auditoria** (`/historico-auditoria`) suporta:

- **Por registro afetado:** `?entity_name=X&entity_id=Y` (URL params).
- **Por tipo de evento:** filtro dropdown (Todos, Criação, Login, Aprovação, etc.).
- **Por usuário:** filtro por email do ator.
- **Por período:** data inicial e data final.

### Acesso
- Administradores: veem todas as entradas.
- Sala Técnica / Gestor de Contrato: veem todas as entradas.
- Usuários comuns: veem apenas entradas que eles próprios geraram.

## Retenção

- **Período mínimo:** 2 anos (alinhado com práticas de auditoria de TI).
- **Purga:** realizada via script administrativo dedicado (não via aplicação).
- Entradas com `chain_hash` comprometido (cadeia quebrada) são **preservadas**
  para investigação — nunca purgadas automaticamente.

## Pontos de Escrita

| Função | Eventos |
|--------|---------|
| `registrarAuditoria` (backend) | Auth, user management, exports (chamada pelo frontend) |
| `validarESalvarRegistro` (backend) | create, update de registros |
| `gerenciarAprovacao` (backend) | approve, reject, sign, delete, NC actions |
| `exportarEnsaiosPDF` (backend) | report_exported |

Todas as três funções backend calculam `chain_hash` e capturam IP/dispositivo
inline (não é possível compartilhar módulos entre functions no Deno Deploy).