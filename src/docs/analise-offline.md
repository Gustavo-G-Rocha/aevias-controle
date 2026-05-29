# Análise Técnica – Implementação de Modo Offline

**Data:** 29 de maio de 2026  
**Status:** Análise (implementação não iniciada)

---

## 1. Sumário Executivo

A aplicação apresenta **forte dependência online** em três pilares:
1. **Autenticação e dados mestres** (base44.auth.me, Obra, Regional, Project)
2. **Upload de fotos** (base44.integrations.Core.UploadFile)
3. **Persistência de registros** (base44.entities.*.create/update)

Uma estratégia **offline-first** requer priorização de checklists em campo (Terraplanagem, MRAF, Aplicação) sobre consultas e relatórios.

**Recomendação:** PWA + IndexedDB com suporte parcial a offline (criar/editar, sem upload de fotos).

---

## 2. Mapeamento de Formulários

### Prioridade Alta (Campo) – Offline Essential

| Formulário | Tipo | Frequência | Operações Críticas | Upload |
|---|---|---|---|---|
| **Checklist Terraplanagem** | Verificação | Alta | Checkbox, texto, validações | Fotos |
| **Checklist MRAF** | Verificação | Alta | Checkbox, clima, aplicação | Fotos |
| **Checklist Aplicação** | Verificação | Média | Pintura, geometria, medições | Fotos |
| **Diário de Obra** | Log | Alta | Clima, efetivo, máquinas | Fotos |

### Prioridade Média (Campo) – Offline Desejável

| Formulário | Tipo | Frequência | Operações Críticas |
|---|---|---|---|
| **Checklist Concretagem** | Verificação | Média | Cargas, slump, compactação |
| **Checklist Usina** | Monitoramento | Média | Agregados, ligante, rodadas |

### Prioridade Baixa (Laboratório) – Offline Não Essencial

| Formulário | Tipo | Local | Dependências |
|---|---|---|---|
| **Ensaios (CAUQ, MRAF, etc.)** | Testes técnicos | Laboratório | Cálculos, servidor sempre disponível |
| **Relatórios Unificados** | Consulta | Escritório | Query + impressão + internet |
| **Geração de Relatórios** | PDF | Qualquer | API + cálculos em tempo real |

---

## 3. Análise de Dependências Online

### 3.1 Autenticação e Mestres

**Impacto:** CRÍTICO

```javascript
// useChecklistForm.js — linhas 34-55
const userData = await base44.auth.me();  // ← Necessário para permissões
const obrasData = await base44.entities.Obra.list();
const regionaisData = await base44.entities.Regional.list();
const projectsData = await base44.entities.Project.list();
```

**Problema:** Sem internet, usuário não consegue:
- Autenticar
- Listar obras disponíveis
- Selecionar regional/projeto

**Solução:** Cache local de mestres após primeiro login (duração de sessão).

---

### 3.2 Upload de Fotos

**Impacto:** ALTO

```javascript
// useChecklistTerrapalagemForm.js — linhas 159-160
const result = await base44.integrations.Core.UploadFile({ file });
uploadedUrls.push(result.file_url);
```

**Problema:** Sem upload, fotos não podem ser adicionadas ao formulário.

**Solução:** 
- Armazenar fotos em IndexedDB como Blobs
- Fila de upload pendente quando internet voltar
- Marcadores visuais de "foto offline"

---

### 3.3 Persistência de Registros

**Impacto:** CRÍTICO

```javascript
// useChecklistTerrapalagemForm.js — linhas 209-214
await base44.entities.ChecklistTerraplanagem.update(editingChecklist.id, updateData);
await base44.entities.ChecklistTerraplanagem.create(dataToSave);
```

**Problema:** Sem internet, criação/edição de checklists falha.

**Solução:**
- Salvar em localStorage/IndexedDB imediatamente
- Fila de sincronização ao recuperar conexão
- Deduplicação por timestamp + hash

---

### 3.4 Consultas Dinâmicas (Relatórios)

**Impacto:** MÉDIO

```javascript
// recordsService.js — linhas 91-103
const normalized = normalizeRecords(results, ALL_RECORD_ENTITIES);
```

**Problema:** Filtros, buscas e relatórios dinâmicos requerem dados atualizados.

**Solução:** 
- Cache read-only de últimos 50 registros por tipo
- Relatórios baseados em cache local
- Sincronização inicial ao conectar

---

## 4. Arquitetura Proposta

### 4.1 Stack de Tecnologia

| Camada | Solução | Razão |
|---|---|---|
| **Detectação Online** | `navigator.onLine` | Built-in, simples |
| **Storage Local** | **IndexedDB** | Suporta Blobs (fotos), transações, quota maior |
| **Cache Maestres** | **localStorage** | JSON pequeno, rápido |
| **Fila de Sync** | **localStorage + IndexedDB** | Persistente entre sessões |
| **PWA** | Opcional (v2) | Service Worker para offline |

### 4.2 Estrutura de Diretórios

```
src/
├── services/
│   ├── offlineService.js          # API unificada online/offline
│   ├── syncService.js             # Fila de sincronização
│   └── offlineStorageService.js   # IndexedDB + localStorage
├── hooks/
│   ├── useOfflineDetection.js     # Hook para detectar online/offline
│   ├── useOfflineSync.js          # Hook para gerenciar fila
│   └── useOfflineFormPersistence.js  # Extensão de useFormPersistence
├── utils/
│   ├── offlineQueue.js            # Estrutura de fila com timestamp
│   └── offlineConflictResolver.js # Estratégia de conflitos
└── tests/
    └── services/
        ├── offlineService.test.js
        ├── syncService.test.js
        └── offlineStorageService.test.js
```

### 4.3 Fluxo de Operações

#### Criar Checklist (Offline)

```
Usuário digita dados
    ↓
handleSubmit() detecta online?
    ├─ SIM: salva em base44 + localStorage
    └─ NÃO: salva em IndexedDB + enfileira sync
    ↓
Usuário volta online
    ↓
useOfflineSync verifica fila
    ↓
Reenvio automático com deduplicação
    ↓
Feedback visual ao usuário
```

#### Upload de Fotos (Offline)

```
Usuário seleciona arquivo
    ↓
handleFileChange() detecta online?
    ├─ SIM: upload imediato
    └─ NÃO: armazena Blob em IndexedDB + enfileira
    ↓
Galeria exibe fotos com badge "pendente"
    ↓
Usuário volta online
    ↓
useOfflineSync processa fila de uploads
    ↓
Badge desaparece quando sincronizado
```

---

## 5. Mecanismo de Sincronização

### 5.1 Estrutura de Fila

```javascript
// offlineQueue.js
interface QueueItem {
  id: string;           // uuid v4
  timestamp: number;    // Date.now()
  operation: 'create' | 'update' | 'upload';
  entityType: string;   // 'ChecklistTerraplanagem', 'DiarioObra', etc.
  entityId?: string;    // null para create, id para update
  payload: object;      // dados a sincronizar
  dataHash: string;     // sha256(JSON.stringify(payload))
  attempts: number;     // falhas de sincronização
  lastError?: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}
```

### 5.2 Estratégia de Deduplicação

**Problema:** Offline + user tira screenshot/compartilha = duplicados.

**Solução:** Hash + Timestamp

```javascript
// syncService.js — deduplicação
const existing = await checkPendingSyncByHash(dataHash);
if (existing) {
  // Atualizar apenas o payload, manter timestamp original
  await updateQueueItem(existing.id, { payload });
  return; // Não duplicar
}
// Novo item
await addToQueue({ timestamp, dataHash, payload, ... });
```

### 5.3 Resolução de Conflitos

**Cenário:** Usuário edita offline, depois online, e dados mudaram no servidor.

**Estratégia:** Last-Write-Wins (LWW)

```javascript
// syncService.js — merge
async function resolveConflict(local, remote) {
  // Comparar updated_date
  if (local.updated_date > remote.updated_date) {
    return local; // Local é mais novo, sobrescrever
  } else {
    // Remote é mais novo
    // Mesclar campos específicos (user-facing: fotos, observações)
    return merge(local, remote, ['fotos', 'observacoes_gerais']);
  }
}
```

---

## 6. Decisões Arquiteturais

### 6.1 Por que IndexedDB (não localStorage)?

| Critério | localStorage | IndexedDB |
|---|---|---|
| **Tamanho** | ~5-10MB | 50MB+ |
| **Blobs** | ✗ | ✓ |
| **Transações** | ✗ | ✓ |
| **Performance** | Melhor (sync) | Boa (async) |

**Decisão:** IndexedDB para dados grandes (fotos), localStorage para cache pequeno (mestres).

### 6.2 Por que PWA + Service Worker (v2)?

**Fase 1:** localStorage + IndexedDB (agora)
- Usuário já está dentro do app quando fica offline
- Persistência suficiente
- Implementação rápida

**Fase 2:** PWA + Service Worker (futuro)
- Offline desde o acesso inicial (agora não é suportado)
- Preload de assets estáticos
- Sincronização em background

### 6.3 Impacto em useChecklistForm

```javascript
// Hook modificado (v2)
export function useChecklistForm(getInitialFormData, entityName, storageName) {
  // ... código existente ...
  
  // NOVO: Detectar online
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // NOVO: Sincronizar fila ao conectar
  useOfflineSync(isOnline);
  
  return { ..., isOnline };
}
```

---

## 7. Impacto em Componentes Existentes

### Modificações Mínimas

| Componente | Mudança | Tipo |
|---|---|---|
| `useChecklistForm.js` | Adicionar hook `useOfflineSync` | Extensão |
| `handleSubmit()` | Detectar online antes de enviar | Condicional |
| `handleFileChange()` | Enfileirar upload se offline | Condicional |
| `UploadGallery.jsx` | Badge visual "pendente" | UI |
| `ChecklistFooter.jsx` | Desabilitar "Finalizar" se offline | UI |

### Sem Quebra de Funcionalidade

- Quando online: comportamento idêntico ao atual
- Quando offline: formulários permanecem editáveis
- Histórico de offline: invisível para usuário até sincronização

---

## 8. Sincronização Automática (Detalhes)

### 8.1 Quando Sincronizar?

```javascript
// useOfflineSync.js
useEffect(() => {
  if (!isOnline) return; // Esperar internet

  // Sincronizar automaticamente
  const interval = setInterval(async () => {
    try {
      const queue = await getOfflineQueue();
      for (const item of queue) {
        await syncItem(item);
      }
    } catch (e) {
      console.error('Sincronização falhou:', e);
    }
  }, 10000); // A cada 10s

  return () => clearInterval(interval);
}, [isOnline]);
```

### 8.2 Feedback Visual

```javascript
// useOfflineSync retorna:
{
  isOnline,           // boolean
  pendingCount,       // número de itens na fila
  isSyncing,          // boolean
  failedCount,        // itens que falharam
  lastSyncTime,       // Date
}
```

**Uso em UI:**
```jsx
{!isOnline && <Alert>Offline — {pendingCount} registros pendentes</Alert>}
{isSyncing && <Spinner />}
{failedCount > 0 && <Alert severity="error">Erro ao sincronizar</Alert>}
```

---

## 9. Telas Afetadas

### Nível 1 (Crítico – Formulários)

- ✓ ChecklistTerraplanagem
- ✓ ChecklistMRAF
- ✓ ChecklistAplicacao
- ✓ DiarioObra
- ✓ ChecklistConcretagem
- ✓ ChecklistUsina

### Nível 2 (Desejável – Listagens)

- ✓ MeusEnsaios (desabilitar botão "criar" se offline)
- ✓ RelatorioChecklist (mostrar cached)

### Nível 3 (Não Afetado)

- ✗ Ensaios técnicos (laboratório)
- ✗ Relatórios dinâmicos (requerem internet)
- ✗ Geração de PDF (requer API)

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| **Conflito de dados** | Média | Alto | LWW + hash deduplicação |
| **Quota IndexedDB cheia** | Baixa | Alto | Limpeza periódica + alertar usuário |
| **Sincronização lenta** | Média | Médio | Retry com backoff exponencial |
| **Perda de dados** | Muito Baixa | Crítico | Transações + backup localStorage |
| **Usuário confundido** | Média | Médio | UI clara: badges, tooltips, status |

---

## 11. Esforço Estimado

| Tarefa | Dias | Complexidade |
|---|---|---|
| **offlineStorageService.js** | 3 | Média |
| **syncService.js** | 4 | Alta |
| **useOfflineSync.js / useOfflineDetection.js** | 2 | Baixa |
| **Integração em useChecklistForm** | 1 | Baixa |
| **UI: badges + status bar** | 1 | Baixa |
| **Testes unitários** | 3 | Média |
| **Testes E2E** (online → offline → online) | 2 | Alta |
| **Documentação + treino** | 1 | Baixa |
| **TOTAL** | **17 dias** | **Média-Alta** |

---

## 12. Recomendação Final

### Opção Escolhida: PWA + IndexedDB (Fase 2)

**Fase 1 (2-3 semanas):**
- IndexedDB para armazenamento
- localStorage para cache mestres
- Detecção online/offline
- Fila de sincronização
- Integração em checklists de campo

**Fase 2 (1 mês, futuro):**
- Service Worker
- Offline desde acesso inicial
- Preload de assets
- Sincronização em background

### Alternativas Rejeitadas

| Opção | Razão da Rejeição |
|---|---|
| **localStorage apenas** | Tamanho insuficiente para fotos |
| **PWA imediato** | Esforço desproporcionado; IndexedDB resolve 80% dos casos |
| **Sem offline** | Usuários em campo precisam de cobertura |

---

## 13. Próximos Passos

1. **Aprovação desta análise** (tech lead)
2. **Design detalha de offlineStorageService.js** (arquitetura)
3. **Prototipagem de sincronização** (spike 1 dia)
4. **Implementação progressiva** (6 sprints)
5. **Testes de campo** (2 semanas em obra real)

---

## Apêndice A: Estrutura IndexedDB

```javascript
// Banco de dados: aevias-offline-v1

// Store 1: queueItems (fila de sync)
keyPath: 'id'
indexes: ['timestamp', 'status', 'entityType', 'dataHash']

// Store 2: offlineChecklists (checklists salvos localmente)
keyPath: 'id'
indexes: ['obra_id', 'entityType', 'created_date']

// Store 3: offlinePhotos (fotos em Blob)
keyPath: 'id'
indexes: ['queueItemId', 'timestamp']

// Store 4: cacheMestres (Obra, Regional, Project)
keyPath: 'id'
indexes: ['entityType', 'updated_date']
```

---

## Apêndice B: Exemplo de Sincronização

```javascript
// Fluxo completo: usuario offline → online → sync

// 1. Offline: usuário cria checklist
{
  operation: 'create',
  entityType: 'ChecklistTerraplanagem',
  payload: { obra_id: 'X', data: '2026-05-29', ... },
  status: 'pending',
  timestamp: 1716984240000,
  dataHash: 'abc123...'
}

// 2. Online: sincronização executa
await base44.entities.ChecklistTerraplanagem.create(payload)
  ✓ Retorna: { id: 'checklist-uuid', created_date: '...', ... }
  
// 3. Marcar como sincronizado
queueItem.status = 'synced';
queueItem.entityId = 'checklist-uuid';

// 4. Limpar após 24h (manutenção)
``