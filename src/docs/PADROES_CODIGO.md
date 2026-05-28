# 📋 PADRÕES DE CÓDIGO — Guia de Governança
**Versão**: 1.0  
**Data**: 28 de maio de 2026  
**Escopo**: Convenções consolidadas do projeto

---

## 🎯 CONVENÇÕES GERAIS

### Imports e Aliases
```javascript
// ✅ PADRÃO — Usar @ para src/
import { base44 } from '@/api/base44Client';
import Component from '@/components/X';
import { useData } from '@/hooks/useData';
import { parseAbertura } from '@/utils/relatorioCAUQUtils';

// ❌ EVITAR — Caminhos relativos
import { base44 } from '../../../api/base44Client';
```

### Organização de Arquivo
```javascript
// 1. Imports (React first, then libs, then app)
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Component from '@/components/X';
import { useData } from '@/hooks/useData';

// 2. Types/Constants (se houver)
const COLORS = { ... };

// 3. Componente principal
export default function MyComponent() { }

// 4. Helpers/funções puras (ao fim, se houver)
const helperFunction = () => { };
```

### Nomes de Variáveis
```javascript
// ✅ Descritivas
const dadosGranulometria = [];
const realizarMarshall = true;
const onPointHover = (data, pos) => { };

// ❌ Genéricas
const data = [];
const flag = true;
const handler = () => { };
```

---

## 📦 CONVENÇÕES POR TIPO

### 1. Componentes React

#### Nome (PascalCase)
```javascript
// ✅ PADRÃO
export default function RelatorioCAUQGraficos({ props }) { }
export default function DashboardHeader() { }
export default function ProjectFormCAUQ() { }

// ❌ EVITAR
export default function relatorioCAUQGraficos() { }
export default function RelatorioCAUQ_Graficos() { }
```

#### Props Destructuring
```javascript
// ✅ PADRÃO
export default function MyComponent({ 
  dadosGranulometria, 
  realizarMarshall, 
  onPointHover 
}) {
  // ...
}

// ⚠️ SE MUITAS PROPS (>5)
export default function MyComponent(props) {
  const { prop1, prop2, ...restProps } = props;
}
```

#### Exports
```javascript
// ✅ PADRÃO — Default para componentes
export default function Component() { }

// ✅ NAMED para helpers locais
export const helperFunction = () => { };
```

#### Arquivo
```
components/
├── ComponentName.jsx           ✅ Um componente por arquivo
├── SmallerComponent.jsx        ✅ Cada um isolado
└── subfolder/
    ├── SubComponent.jsx        ✅ Se necessário agrupar
    └── index.js                ✅ Barrel file (raro)
```

---

### 2. Pages (Rotas)

#### Nome (PascalCase, sem sufixo)
```javascript
// ✅ PADRÃO
pages/Dashboard.jsx
pages/RelatorioCAUQ.jsx
pages/EnsaioCAUQ/
pages/ChecklistMRAF/

// ❌ EVITAR
pages/dashboard.jsx
pages/RelatorioCauqPage.jsx
pages/PageEnsaioCAUQ.jsx
```

#### Estrutura
```javascript
// ✅ PADRÃO
export default function Dashboard() {
  // Data fetching com hooks
  const { data, isLoading } = useData();
  
  // Rendering
  return <div>{/* ... */}</div>;
}

// ❌ EVITAR — Lógica pesada na página
export default function Dashboard() {
  // 100+ linhas de lógica
}
```

#### Routing em App.jsx
```javascript
// ✅ PADRÃO — Rota automática via pages.config.js OU explícita
import Dashboard from '@/pages/Dashboard';

<Route path="/" element={<Dashboard />} />
<Route path="/relatorio-cauq" element={<RelatorioCAUQ />} />

// ✅ COM LAYOUT
<Route element={<Layout />}>
  <Route path="/" element={<Dashboard />} />
  <Route path="/relatorio" element={<Relatorio />} />
</Route>
```

---

### 3. Hooks (Custom React Hooks)

#### Nome (camelCase com prefixo `use`)
```javascript
// ✅ PADRÃO
hooks/useRelatorioCAUQData.js     → const { data } = useRelatorioCAUQData();
hooks/useEnsaioCAUQForm.js        → const { formData, setField } = useEnsaioCAUQForm();
hooks/useProjectsFilters.js       → const { filters, setFilter } = useProjectsFilters();
hooks/useDashboardData.js         → const { stats } = useDashboardData();

// Sufixos semânticos
hooks/use*Data.js        → Data fetching (useQuery)
hooks/use*Form.js        → Form state (useState + handlers)
hooks/use*Actions.js     → Mutations (useMutation)
hooks/use*Filters.js     → Filter logic (useState)

// ❌ EVITAR
hooks/dataFetcher.js
hooks/formManagement.js
hooks/get_Dashboard_Data.js
```

#### Arquivo (um hook por arquivo)
```
hooks/
├── useRelatorioCAUQData.js       ✅ Um hook
├── useEnsaioCAUQForm.js          ✅ Um hook
├── useDashboardData.js           ✅ Um hook
└── useSharedLogic.js             ✅ Se compartilhado
```

#### Return Type
```javascript
// ✅ PADRÃO
export const useRelatorioCAUQData = (projectId) => {
  const { data, isLoading, error } = useQuery(...);
  
  return {
    data,
    isLoading,
    error,
    refetch: () => { }
  };
};

// Uso
const { data, isLoading } = useRelatorioCAUQData(projectId);
```

---

### 4. Utils (Funções Puras)

#### Nome (camelCase, plural para coleções)
```javascript
// ✅ PADRÃO
utils/relatorioCAUQUtils.js       → parseAbertura(), getXLog(), getYGraph()
utils/projectFormUtils.js         → sanitizeProjectData(), validateForm()
utils/ensaiosService.js           → listEnsaios(), createEnsaio()

// Regra
utils/*Utils.js          → Funções puras
utils/*Service.js        → CRUD + lógica de negócio
```

#### Exports
```javascript
// ✅ PADRÃO — Named exports
export const parseAbertura = (str) => parseFloat(str.replace(',', '.'));
export const buildPolylinePoints = (dados, getX, getY, field) => { };
export function getGraphDimensions(realizarMarshall) { }

// Arquivo organizado
export {
  parseAbertura,
  buildPolylinePoints,
  getGraphDimensions,
  getLegendItems,
};
```

#### Características
```javascript
// ✅ SEMPRE puro
- Sem side effects
- Sem state
- Sem async (exceto dentro)
- Determinístico (input → output)
- Testável isoladamente

// ❌ NUNCA
- Chamadas diretas a base44
- Mutação de props
- Efeitos colaterais
```

---

### 5. Services (CRUD + Lógica)

#### Nome
```javascript
services/obrasService.js         → getObras(), createObra(), updateObra()
services/projectsService.js      → listProjects(), deleteProject()
services/ensaiosService.js       → fetchEnsaios(), saveEnsaio()
```

#### Padrão
```javascript
// ✅ PADRÃO
export const getObras = async (filters) => {
  const { data } = await base44.entities.Obra.filter(filters);
  return data;
};

export const createObra = async (obraData) => {
  try {
    const result = await base44.entities.Obra.create(obraData);
    return result;
  } catch (error) {
    throw new Error(`Erro ao criar obra: ${error.message}`);
  }
};
```

---

### 6. Testes

#### Nome (um teste por arquivo)
```
tests/
├── utils/
│   ├── relatorioCAUQUtils.test.js          ✅ Testa src/utils/relatorioCAUQUtils.js
│   └── ensaioLimitesUtils.test.js          ✅ Testa src/utils/ensaioLimitesUtils.js
├── components/
│   ├── relatorio-cauq/
│   │   └── relatorioCAUQGraficos.test.jsx  ✅ Testa componente
│   └── projects/
│       └── projectForm.test.jsx            ✅ Testa componente
└── hooks/
    └── useProjectsData.test.js             ✅ Quando necessário
```

#### Padrão Vitest
```javascript
// ✅ PADRÃO
import { describe, it, expect } from 'vitest';

describe('parseAbertura', () => {
  it('parseia abertura com vírgula', () => {
    expect(parseAbertura('75,0')).toBe(75);
  });

  it('retorna número válido', () => {
    expect(typeof parseAbertura('75,0')).toBe('number');
  });
});

// ✅ Assertions claros
expect(result).toBe(expected);
expect(array).toContain(item);
expect(func).toThrow();
expect(component).toBeDefined();

// ❌ EVITAR
expect(result === expected).toBe(true);
expect(array.includes(item)).toBe(true);
```

---

### 7. Entidades (JSON Schema)

#### Nome (PascalCase)
```
entities/
├── Project.json                  ✅ Nome descritivo
├── EnsaioCAUQ.json               ✅ Nome descritivo
├── ChecklistAplicacao.json       ✅ Nome descritivo
└── DiarioObra.json               ✅ Nome descritivo
```

#### Estrutura
```json
{
  "name": "Project",
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "..." },
    "status": { "type": "string", "enum": [...] }
  },
  "required": ["name"],
  "rls": { "read": {}, "write": {...} }
}
```

---

## 🚀 PADRÕES POR FUNCIONALIDADE

### Data Fetching com React Query
```javascript
// ✅ PADRÃO
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['relatorios', projectId],
  queryFn: () => base44.entities.Relatorio.filter({ project_id: projectId }),
  enabled: !!projectId,
});

// Uso em hooks
export const useRelatorioCAUQData = (projectId) => {
  const { data, isLoading, error } = useQuery({...});
  return { data, isLoading, error };
};
```

### Mutations com React Query
```javascript
// ✅ PADRÃO
const { mutate, isPending } = useMutation({
  mutationFn: (data) => base44.entities.Project.update(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  },
});

// Uso
const handleSave = (formData) => {
  mutate(formData);
};
```

### Form State com React Hook Form
```javascript
// ✅ PADRÃO
import { useForm } from 'react-hook-form';

export const useProjectForm = (initialData) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: initialData,
  });

  return { register, handleSubmit, watch, errors };
};
```

### Conditional Rendering
```javascript
// ✅ PADRÃO
{isLoading && <Spinner />}
{error && <Error message={error.message} />}
{data && <Content data={data} />}

// ❌ EVITAR
{isLoading ? <Spinner /> : error ? <Error /> : data ? <Content /> : null}
```

---

## 📏 LIMITES RECOMENDADOS

| Item | Limite | Razão |
|---|---|---|
| **Linhas por arquivo** | <150 | Fácil de ler |
| **Props por componente** | <8 | Fácil de passar |
| **Nesting** | <3 níveis | Legibilidade |
| **Funções por arquivo** | <10 | Responsabilidade única |
| **Testes por arquivo** | <50 | Manutenível |
| **Imports por arquivo** | <20 | Dependências claras |

---

## ✅ CHECKLIST PRÉ-COMMIT

Antes de commitar, verificar:

- [ ] **Nomenclatura** — Segue padrões acima?
- [ ] **Imports** — Usa @ para src/?
- [ ] **Exports** — Default ou Named apropriados?
- [ ] **Tests** — Novas features têm testes?
- [ ] **Console.log** — Nenhum deixado?
- [ ] **Comments** — Comentários úteis, não óbvios?
- [ ] **Linting** — ESLint passa?
- [ ] **Testes** — Todos passam?

---

## 🔗 Documentos Relacionados

- 📋 [AUDITORIA_ARQUITETURAL_2026.md](./AUDITORIA_ARQUITETURAL_2026.md) — Diagnóstico completo
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) — Visão geral do projeto
- 📝 [DECISOES_ARQUITETURAIS.md](./DECISOES_ARQUITETURAIS.md) — Por quês das escolhas arquiteturais
- ✅ [CHECKLIST_CICD.md](./CHECKLIST_CICD.md) — Automação e validação de CI/CD

---

**Versão**: 1.0  
**Última atualização**: 28/05/2026  
**Próxima revisão**: 28/08/2026