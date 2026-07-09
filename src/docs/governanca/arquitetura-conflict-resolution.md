# Arquitetura de Resolução de Conflitos (Offline-First)

## Estratégia escolhida e por quê

**Last-Write-Wins (LWW) com detecção e notificação ao usuário.**

- **Por que LWW:** O app é offline-first com um único backend centralizado. CRDTs seriam excesso para um domínio onde a maioria das edições não é concorrente (cada laboratorista trabalha em seus próprios registros). LWW é simples, previsível e não exige migração destrutiva.
- **Por que detecção + notificação:** LWW puro pode perder dados silenciosamente. A detecção compara timestamps e, se o registro no servidor foi modificado após o salvamento do cliente, o conflito é sinalizado — o usuário decide como resolver.

## Mecanismo de Detecção

1. **`base_updated_date`:** Timestamp do servidor (`updated_date`) capturado quando o formulário é carregado. Se diferente do `updated_date` atual no momento da sincronização → o registro foi modificado por outro usuário enquanto o cliente editava.
2. **`client_updated_at`:** Timestamp de quando o usuário salvou offline. Se anterior ao `updated_date` do servidor → o servidor foi atualizado após o salvamento do cliente.
3. **Resposta 409:** O backend retorna o registro atual do servidor para comparação campo-a-campo.

## Entidades/Campos Afetados

### Campos server-authoritative (nunca sobrescritos pelo cliente)
- `approved`, `approved_by`, `approved_date`, `approver_details`
- `rejection_reason`, `was_rejected`
- `client_signature`, `manager_signature`
- `integrity_hash`, `integrity_hash_date`
- `pendente_aprovacao_cliente`, `cliente_aprovacao`, etc.

### Campos sensíveis a conflito (requerem revisão manual)
- **EnsaioCAUQ:** `corpos_prova_marshall`, `extracao_ligante`, `densidade_rice`
- **EnsaioProctor:** `umidades`, `densidades`, `densidade_maxima_seca`, `umidade_otima`
- **EnsaioDensidadeInSitu:** `furos`, `dados_proctor`
- **EnsaioVigaBenkelman:** `levantamentos`, `controle_estatistico`
- **DiarioObra:** `efetivo_maquinas`, `efetivo_colaboradores`, `nao_conformidades`
- **Checklists:** `ensaios_empreiteira`, `acompanhamento_execucao`

## Arquivos Alterados

| Arquivo | Alteração |
|---|---|
| `src/utils/conflictResolution.js` | **Novo** — lógica de detecção, comparação e classificação de campos |
| `src/components/offline/ConflictResolutionDialog.jsx` | **Novo** — UI de resolução de conflitos |
| `src/tests/utils/conflictResolution.test.js` | **Novo** — testes unitários da lógica |
| `base44/functions/validarESalvarRegistro/entry.ts` | Detecção server-side (LWW), `force_overwrite`, stripping de campos server-authoritative |
| `src/services/syncService.js` | Roteia sync via `validarESalvarRegistro`, handle 409, `forceSyncQueueItem`, `resolveConflict` |
| `src/services/offlineStorageService.js` | DB v2, store `conflicts`, CRUD de conflitos |
| `src/hooks/useOfflineSync.js` | Expõe `conflictCount`, `conflicts`, `resolveConflict` |
| `src/components/offline/OfflineStatusBar.jsx` | Notificação de conflitos + diálogo de resolução |
| `src/utils/offlineQueue.js` | `clientUpdatedAt`, `baseUpdatedDate`, status `conflict` |
| `src/Layout.jsx` | Renderiza `OfflineStatusBar` |
| `src/pages/ChecklistTerraplanagem/hooks/useChecklistTerrapalagemForm.jsx` | Passa `clientUpdatedAt` e `baseUpdatedDate` ao enfileirar |

## Cenários de Conflito Testados

1. **Duas edições offline do mesmo registro em dispositivos diferentes:** Device A salva em T=10, Device B salva em T=12. B sincroniza primeiro (server updated_date = T=12). A sincroniza depois → `client_updated_at (T=10) < server.updated_date (T=12)` → **conflito detectado**.
2. **Sincronização fora de ordem (registro mais antigo chega depois):** Mesmo cenário acima — o registro mais antigo detecta conflito e não sobrescreve silenciosamente.
3. **Edição offline sem conflito:** Device A salva em T=10, ninguém mais modifica. Sincroniza em T=15 → `client_updated_at (T=10) ≥ server.updated_date (T=0)` → **sem conflito**, sync normal.
4. **Force overwrite:** Usuário escolhe "Usar minha versão" → `force_overwrite: true` → campos server-authoritative são removidos, update aplicado.

## Plano de Rollback

1. Reverter `validarESalvarRegistro/entry.ts` (remover conflict detection e `force_overwrite`).
2. Reverter `syncService.js` para usar `base44.entities.*.create/update` diretamente.
3. Reverter `offlineStorageService.js` para DB_VERSION=1 (ou manter v2 com store de conflitos vazia — inofensiva).
4. Conflitos em IndexedDB podem ser limpos via `clearConflicts()`.
5. Registros já sincronizados não são afetados — a estratégia só atua no momento da sincronização.

## Impacto: **Médio**

- Adiciona uma chamada extra ao backend (`get` do registro existente) durante a sincronização de updates.
- Não altera schemas de entidades.
- Não exige migração de dados existentes.
- Compatível com registros legados (sem `client_updated_at` → comportamento original).