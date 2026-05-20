# Roadmap de Refatoração — Segunda Rodada (Projeto Afirmaevias)

> Documento atualizado em: 2026-05-20
> Baseado em: `new_refatoring.md`

---

## 📊 Status Geral

| Sprint | Nome | Status |
|--------|------|--------|
| Sprint 1 | MeusEnsaios | ✅ Concluído |
| Sprint 2 | Checklists | ✅ Concluído |
| Sprint 3 | ProjectForm | ✅ Concluído |
| Sprint 4 | Ensaios Individuais | ✅ Concluído |
| Sprint 5 | Relatórios — Infraestrutura | ✅ Concluído |
| **ETAPA 1** | **Layout.jsx** | ✅ **Concluído** |
| **ETAPA 2** | **Formulários Gigantes** | 🔄 **Em andamento** |
| ETAPA 3 | Componentes Reutilizáveis de Formulário | 🔲 Pendente |
| ETAPA 4 | Performance — Loops e Memoização | 🔲 Pendente |
| ETAPA 5 | dashboardCalculations.js | 🔲 Pendente |
| ETAPA 6 | Services — Paginação | 🔲 Pendente |
| ETAPA 7 | Arquitetura Geral | 🔲 Pendente |

---

## ✅ ETAPA 1 — Refatorar Layout.jsx

**Problema:** `layout.jsx` com ~1007 linhas concentrava navegação, permissões, menus, sidebar, header, responsividade, controle de sessão e renderização condicional.

**Solução:** Decomposição em módulos focados:

| Arquivo criado | Responsabilidade |
|---|---|
| `components/layout/NavigationConfig.js` | Constantes de rotas e ensaios por tipo de obra |
| `components/layout/useLayoutData.js` | Hook: carregamento de user, obras, pendingTransfers — usa `Set` para lookups O(1) |
| `components/layout/AppSidebar.jsx` | Sidebar completa com menus expansíveis |
| `components/layout/MobileHeader.jsx` | Header mobile isolado |
| `components/layout/BottomNav.jsx` | Navegação inferior mobile |
| `components/layout/UserMenu.jsx` | Menu de perfil/logout com dialog de exclusão |
| `components/layout/CreateEnsaioDialog.jsx` | Dialog de novo registro com sub-componentes focados |
| `layout.jsx` | Orquestrador — **~80 linhas** (era 1007) |

**Impacto:** Redução de ~92% no arquivo principal. Cada responsabilidade é isolada, testável e modificável de forma independente.

**Risco:** Baixo — comportamento e permissões preservados.

---

## 🔄 ETAPA 2 — Refatorar Formulários Gigantes

**Problema:** Componentes com 1000+ linhas misturando UI, lógica de negócio, validações, chamadas de API e gerenciamento de estado.

**Componentes prioritários do documento:**
- `ChecklistConcretagem.jsx` (~1444 linhas) ✅ Concluído
- `DiarioObra.jsx` (~1304 linhas) ✅ Concluído
- `ChecklistUsina.jsx` (~1483 linhas) → Próximo
- `EnsaioCAUQ.jsx` (~1417 linhas) → Próximo
- `ChecklistAplicacao.jsx` (~1409 linhas) → Próximo

### ChecklistConcretagem — Concluído

**Arquivos criados:**
- `hooks/useChecklistConcretagem.js` — toda a lógica extraída (carregamento, handlers de cargas, CPs, upload, validação, submissão)
- `pages/ChecklistConcretagem.jsx` — UI pura, ~380 linhas (era ~1444)

**Padrão aplicado:**
- Lookup de obras via regional com `Set` (eliminou múltiplos `.filter()` em loop)
- `useCallback` em todos os handlers para evitar re-renders
- Validação centralizada no hook, com `requiredFields` array iterável
- Sanitização de dados numéricos centralizada no `handleSubmit`

### DiarioObra — Concluído

**Arquivos criados:**
- `hooks/useDiarioObra.js` — carregamento, upload, validação e submissão extraídos
- `pages/DiarioObra.jsx` — UI pura com `DiarioForm` como sub-componente (manteve a estrutura existente de componente controlado)

**Padrão aplicado:**
- Lookup de regionais com `Set` no carregamento
- `useCallback` em todos os handlers
- Validações como lista sequencial no hook
- Luzes do checklist de veículo agrupadas em array de configuração (eliminou repetição de JSX)

---

## 🔲 ETAPA 3 — Componentes Reutilizáveis de Formulário

**Objetivo:** Criar `components/forms/` com:

```
components/forms/
  FormSection.jsx       — Card com título e conteúdo
  FormActions.jsx       — Botões Cancelar / Salvar / Finalizar
  UploadGallery.jsx     — Upload + preview de fotos (reutilizado em 10+ formulários)
  ObservacaoField.jsx   — Textarea com contador de caracteres
  StatusDraftBanner.jsx — Banner "Em Rascunho" padronizado
```

**Impacto esperado:** Eliminar ~200 linhas duplicadas entre todos os formulários de checklist.

---

## 🔲 ETAPA 4 — Performance — Loops e Memoização

**Problema identificado:**

```js
// Evitar — múltiplos .filter() sobre o mesmo array
ensaios.filter(e => e.status === 'finalizado')
ensaios.filter(e => e.status === 'rascunho')
ensaios.filter(e => e.approved === true)

// Preferir — uma passagem única
const counts = { finalizado: 0, rascunho: 0, aprovado: 0 };
for (const e of ensaios) {
  if (e.status === 'finalizado') counts.finalizado++;
  if (e.status === 'rascunho') counts.rascunho++;
  if (e.approved === true) counts.aprovado++;
}
```

**Prioridade:** `dashboardCalculations.js`, `services/dashboardService.js`, `components/ensaios/utils.js`

---

## 🔲 ETAPA 5 — Melhorar dashboardCalculations.js

**Problema:** Múltiplos `.filter()` independentes sobre o mesmo array de ensaios.

**Objetivo:** Transformar em single-pass processing:

```js
// Evitar
const finalizados = ensaios.filter(...)
const aprovados = ensaios.filter(...)
const rascunhos = ensaios.filter(...)

// Preferir
const stats = ensaios.reduce((acc, e) => {
  if (e.status === 'finalizado') acc.finalizados++;
  // ...
  return acc;
}, { finalizados: 0, aprovados: 0, rascunhos: 0 });
```

---

## 🔲 ETAPA 6 — Melhorar Services (Paginação)

**Problema:** `dashboardService.js` busca até 5000 registros por entidade, causando lentidão e gargalos de rede.

**Objetivo:** Implementar:
- Paginação progressiva (buscar por chunks)
- Limite inteligente baseado em filtro de data
- Cache via `@tanstack/react-query` (já instalado)
- Carregamento incremental com `useInfiniteQuery`

---

## 🔲 ETAPA 7 — Arquitetura Geral

**Objetivo:** Garantir separação clara em todos os módulos:

| Camada | Responsabilidade | Localização |
|--------|-----------------|-------------|
| UI | Somente renderização | `pages/`, `components/` |
| Hooks | Estado e ciclo de vida | `hooks/` |
| Services | API e integração | `services/` |
| Utils | Cálculos e transformações puras | `utils/` |
| Configs | Constantes e metadados | `constants/`, `lib/` |

---

## 📈 Métricas Acumuladas (Segunda Rodada)

| Arquivo | Antes | Depois | Redução |
|---------|-------|--------|---------|
| `layout.jsx` | ~1007 linhas | ~80 linhas | **92%** |
| `ChecklistConcretagem.jsx` | ~1444 linhas | ~380 linhas | **74%** |
| `DiarioObra.jsx` | ~1304 linhas | ~400 linhas | **69%** |
| **Total etapa** | **~3755** | **~860** | **~77%** |

---

## 💡 Padrões Estabelecidos (Segunda Rodada)

### Hook de Formulário Gigante
```js
// hooks/useChecklistXxx.js
export function useChecklistXxx() {
  // Estado, carregamento, handlers, validação e submissão
  return { formData, setFormData, loading, saving, handlers... };
}

// pages/ChecklistXxx.jsx
export default function ChecklistXxx() {
  const { formData, setFormData, ... } = useChecklistXxx();
  return <form>...</form>; // Somente UI
}
```

### Lookup com Set (evitar .filter() em loop)
```js
const regionaisSet = new Set(regionaisIds);
const obrasRegional = obrasData.filter(o => regionaisSet.has(o.regional_id));
```

### Validação como Array Iterável
```js
const requiredFields = [
  [!formData.campo, "preencha o campo X"],
  [!formData.outro, "preencha o campo Y"],
];
for (const [cond, msg] of requiredFields) {
  if (cond) { alert(`Por favor, ${msg}.`); return; }
}
```

### Layout Modular
```js
// layout.jsx — orquestrador puro
import { useLayoutData } from "@/components/layout/useLayoutData";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
```

---

## 🚀 Benefícios Realizados (Acumulado)

✅ **layout.jsx** reduzido de 1007 → 80 linhas (92%)
✅ **ChecklistConcretagem** reduzido de 1444 → 380 linhas (74%)
✅ **DiarioObra** reduzido de 1304 → 400 linhas (69%)
✅ Lógica de negócio completamente desacoplada da UI
✅ Lookups O(1) com `Set` substituindo múltiplos `.filter()`
✅ `useCallback` aplicado em todos os handlers para evitar re-renders
✅ Validações como arrays iteráveis — eliminam if/return duplicados