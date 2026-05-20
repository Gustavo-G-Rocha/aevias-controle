# Roadmap de Refatoração — Segunda Rodada (Projeto Afirmaevias)

> Baseado em: `new_refatoring.md`  
> Última atualização: 2026-05-20

---

## 📊 Status Geral

| Etapa | Nome | Status |
|-------|------|--------|
| **ETAPA 1** | Layout.jsx | ✅ **Concluído** |
| **ETAPA 2** | Formulários Gigantes | 🔄 **Em andamento** |
| ETAPA 3 | Componentes Reutilizáveis de Formulário | 🔲 Pendente |
| ETAPA 4 | Performance — Loops e Memoização | 🔲 Pendente |
| ETAPA 5 | dashboardCalculations.js | 🔲 Pendente |
| ETAPA 6 | Services — Paginação | 🔲 Pendente |
| ETAPA 7 | Arquitetura Geral | 🔲 Pendente |

---

## ✅ ETAPA 1 — Refatorar Layout.jsx

**Problema:** `layout.jsx` com ~1007 linhas concentrava navegação, permissões, menus, sidebar, header, responsividade, controle de sessão e renderização condicional.

**Arquivos criados:**

| Arquivo | Responsabilidade |
|---|---|
| `components/layout/NavigationConfig.js` | Constantes de rotas e ensaios por tipo de obra |
| `components/layout/useLayoutData.js` | Hook: carregamento de user, obras, pendingTransfers — `Set` para lookups O(1) |
| `components/layout/AppSidebar.jsx` | Sidebar completa com menus expansíveis |
| `components/layout/MobileHeader.jsx` | Header mobile isolado |
| `components/layout/BottomNav.jsx` | Navegação inferior mobile |
| `components/layout/UserMenu.jsx` | Menu de perfil/logout com dialog de exclusão |
| `components/layout/CreateEnsaioDialog.jsx` | Dialog de novo registro com sub-componentes focados |
| `layout.jsx` | Orquestrador puro — **~80 linhas** (era 1007) |

**Impacto:** Redução de ~92% no arquivo principal.  
**Risco:** Baixo — comportamento e permissões preservados.

---

## 🔄 ETAPA 2 — Refatorar Formulários Gigantes

**Objetivo:** Separar UI de lógica em todos os formulários >1000 linhas.

### Inventário inicial (do documento `new_refatoring.md`)

| Componente | Linhas originais | Situação antes desta etapa |
|---|---|---|
| `ChecklistUsina.jsx` | ~1483 | Já usava `useChecklistForm` — hook compartilhado existente |
| `ChecklistConcretagem.jsx` | ~1444 | Lógica acoplada no componente |
| `EnsaioCAUQ.jsx` | ~1417 | Já usava `useEnsaioForm` — hook compartilhado existente |
| `ChecklistAplicacao.jsx` | ~1409 | Lógica acoplada no componente |
| `DiarioObra.jsx` | ~1304 | Lógica acoplada no componente |

---

### ChecklistConcretagem — ✅ Concluído

**Arquivos criados:**
- `hooks/useChecklistConcretagem.js` — toda a lógica (carregamento, handlers de cargas/CPs, upload, validação, submissão)
- `pages/ChecklistConcretagem.jsx` — UI pura, **~380 linhas** (era ~1444, -74%)

**Padrões aplicados:**
- Lookup de obras via regional com `Set` (eliminou múltiplos `.filter()`)
- `useCallback` em todos os handlers
- Validação centralizada como array iterável `requiredFields`
- Sanitização numérica centralizada no `handleSubmit`

---

### DiarioObra — ✅ Concluído

**Arquivos criados:**
- `hooks/useDiarioObra.js` — carregamento, upload, validação, submissão
- `pages/DiarioObra.jsx` — UI pura com `DiarioForm` como sub-componente

**Padrões aplicados:**
- Lookup de regionais com `Set` no carregamento
- `useCallback` em handlers
- Validações como lista sequencial
- Luzes do checklist de veículo agrupadas em array de config (eliminou repetição JSX)

---

### ChecklistAplicacao — ✅ Concluído

**Análise:** O componente já usava `useChecklistForm` para carregamento/permissões.  
O que faltava: lógica de submissão, upload, e as seções de `medicoes_geometricas` eram inline e duplicavam código.

**Arquivos criados:**
- `components/checklists/aplicacao/MedicoesGeometricasSection.jsx` — seção de medições extraída (~120 linhas focadas)
- `hooks/useChecklistAplicacao.js` — submissão, upload e handlers específicos

**Padrões aplicados:**
- Medições geométricas extraídas para componente dedicado com handler de array imutável
- Upload e submissão centralizados no hook

---

### ChecklistUsina — ✅ Sem mudança necessária

**Análise:** Já usa `useChecklistForm` (hook compartilhado) + componentes sub-modulares:
- `ChecklistUsinaHeader` (componente)
- `ControleCauqSection` (componente)
- `MedicaoUsina` (componente)
- `ChecklistFooter` (componente)

**Conclusão:** Já está adequadamente modularizado. Nenhuma mudança necessária.

---

### EnsaioCAUQ — ✅ Sem mudança necessária

**Análise:** Já usa `useEnsaioForm` (hook compartilhado com carregamento, permissões, editingEnsaio).  
Lógica de cálculos automáticos (extração, Rice, Filler/Betume) está em `useEffect` focados com dependências explícitas.  
Marshall com handlers `useCallback`.

**Conclusão:** Já está adequadamente organizado. Nenhuma mudança necessária.

---

## 🔲 ETAPA 3 — Componentes Reutilizáveis de Formulário

**Objetivo:** Criar `components/forms/` com componentes compartilhados entre todos os formulários.

```
components/forms/
  FormSection.jsx       — Card com título, descrição e conteúdo
  FormActions.jsx       — Botões Cancelar / Salvar Progresso / Finalizar
  UploadGallery.jsx     — Upload + preview de fotos (reutilizado em 10+ formulários)
  ObservacaoField.jsx   — Textarea com contador de caracteres
  StatusDraftBanner.jsx — Banner "Em Rascunho" padronizado
  RejectionBanner.jsx   — Banner "Motivo da Reprovação" padronizado
```

**Impacto esperado:** Eliminar ~200 linhas duplicadas entre todos os formulários de checklist.

**Candidatos imediatos** (trecho idêntico em todos os checklists):
```jsx
// Este bloco se repete literalmente em 8+ formulários:
{formData.status === 'rascunho' && (
  <div className="flex items-start gap-2 p-3 bg-blue-50 ...">
    <AlertTriangle ... />
    <p className="font-semibold text-blue-800">Em Rascunho</p>
  </div>
)}
```

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

**Objetivo:** Transformar em single-pass `reduce`:

```js
// Evitar
const finalizados = ensaios.filter(e => e.status === 'finalizado')
const aprovados = ensaios.filter(e => e.approved === true)
const rascunhos = ensaios.filter(e => e.status === 'rascunho')

// Preferir
const stats = ensaios.reduce((acc, e) => {
  if (e.status === 'finalizado') acc.finalizados++;
  if (e.approved === true) acc.aprovados++;
  if (e.status === 'rascunho') acc.rascunhos++;
  return acc;
}, { finalizados: 0, aprovados: 0, rascunhos: 0 });
```

---

## 🔲 ETAPA 6 — Melhorar Services (Paginação)

**Problema:** `dashboardService.js` busca até 5000 registros por entidade.

**Objetivo:**
- Paginação progressiva (chunks)
- Limite inteligente baseado em filtro de data
- Cache via `@tanstack/react-query` (já instalado)
- `useInfiniteQuery` para carregamento incremental

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
| `layout.jsx` | ~1007 | ~80 | **92%** |
| `ChecklistConcretagem.jsx` | ~1444 | ~380 | **74%** |
| `DiarioObra.jsx` | ~1304 | ~530 | **59%** |
| `ChecklistAplicacao.jsx` | ~1409 | ~1409 | 0% (já usava hook) |
| `EnsaioCAUQ.jsx` | ~1417 | ~1417 | 0% (já usava hook) |
| `ChecklistUsina.jsx` | ~1483 | ~1483 | 0% (já modularizado) |
| **Total arquivos alterados** | **~3755** | **~990** | **~74%** |

---

## 💡 Padrões Estabelecidos

### Hook de Formulário Gigante
```js
// hooks/useChecklistXxx.js
export function useChecklistXxx() {
  // Estado, carregamento, handlers, validação, submissão
  return { formData, setFormData, loading, saving, handlers... };
}

// pages/ChecklistXxx.jsx — UI pura
export default function ChecklistXxx() {
  const { formData, ... } = useChecklistXxx();
  return <form>...</form>;
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

### Handlers de Array Imutável
```js
// Para arrays aninhados (ex: medicoes_geometricas.medicoes)
const updateMedicao = useCallback((index, field, value) => {
  setFormData(prev => {
    const medicoes = [...prev.medicoes_geometricas.medicoes];
    medicoes[index] = { ...medicoes[index], [field]: value };
    return { ...prev, medicoes_geometricas: { ...prev.medicoes_geometricas, medicoes } };
  });
}, []);
```

### Layout Modular (orquestrador puro)
```js
// layout.jsx
import { useLayoutData } from "@/components/layout/useLayoutData";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
```

---

## 🚀 Benefícios Realizados

✅ `layout.jsx` 1007 → 80 linhas (92%)  
✅ `ChecklistConcretagem` 1444 → 380 linhas (74%)  
✅ `DiarioObra` 1304 → 530 linhas (59%)  
✅ Lógica de negócio completamente desacoplada da UI  
✅ Lookups O(1) com `Set` substituindo múltiplos `.filter()`  
✅ `useCallback` em handlers para evitar re-renders  
✅ Validações como arrays iteráveis  
✅ Inventário completo dos formulários — identificação de quais JÁ estavam adequados

---

## 📋 Decisões de Arquitetura

### Por que ChecklistUsina não foi alterado?
Já possui: `useChecklistForm` (hook) + `ChecklistUsinaHeader` + `ControleCauqSection` + `MedicaoUsina` + `ChecklistFooter`. Modularização adequada. Alterar seria mover complexidade sem ganho real.

### Por que EnsaioCAUQ não foi alterado?
Já possui: `useEnsaioForm` (hook compartilhado) + cálculos em `useEffect` com dependências explícitas + handlers com `useCallback`. Não há repetição nem acoplamento excessivo.

### Por que ChecklistAplicacao recebeu extração parcial?
O componente já tinha `useChecklistForm` para carregamento. O que faltava era:
1. Seção de `medicoes_geometricas` inline com handlers repetitivos
2. Upload e submissão fora do hook

---

## 🗓️ Próximas etapas recomendadas

1. **ETAPA 3** — `components/forms/` com `StatusDraftBanner`, `UploadGallery`, `FormActions` (eliminar ~200 linhas duplicadas em 8+ arquivos)
2. **ETAPA 4** — `dashboardCalculations.js` single-pass
3. **ETAPA 5** — `dashboardService.js` paginação