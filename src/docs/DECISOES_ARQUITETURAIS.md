# 🎯 DECISÕES ARQUITETURAIS — Registro de Decisões
**Versão**: 1.0  
**Data**: 28 de maio de 2026  
**Formato**: ADR (Architecture Decision Record)

---

## ADR-001: Separação de Componentes por Domínio

**Status**: ✅ Aprovado  
**Data**: 2026-05-28  
**Contexto**: Organização de 100+ componentes

### Decisão
Separar componentes em três categorias:
1. **`components/ui/`** — shadcn/ui genéricos
2. **`components/relatorios/`** — Compartilhados entre relatórios
3. **`components/relatorio-**/`** — Específicos de cada relatório (CAUQ, MRAF, etc)

### Alternativas Consideradas
- ❌ Um único `components/relatórios/` com 200+ arquivos
- ❌ Espalhar em cada `pages/Relatorio*/` sem reutilização
- ✅ **ESCOLHIDA** — Separação por domínio + specificidade

### Consequências
- ✅ Fácil encontrar componentes
- ✅ Reutilização clara
- ✅ Escalável para 150+ componentes
- ⚠️ Mais pastas (mitigado por estrutura clara)

### Referências
- 📂 Structure: `components/relatorio-cauq/`, `components/relatorio-mraf/`, etc
- 📋 Padrão em: PADROES_CODIGO.md

---

## ADR-002: Funções Puras em Utils vs Lógica em Hooks

**Status**: ✅ Aprovado  
**Data**: 2026-05-28  
**Contexto**: Onde colocar lógica de transformação de dados?

### Decisão
- **Utils** = Funções puras (parseAbertura, buildPolylinePoints) → testáveis isoladamente
- **Hooks** = State + side effects (useQuery, useState) → React-específico

### Alternativas Consideradas
- ❌ Tudo em hooks
- ❌ Tudo em utils
- ✅ **ESCOLHIDA** — Separação clara por contexto

### Exemplo
```javascript
// ✅ utils/relatorioCAUQUtils.js (puro)
export const parseAbertura = (str) => parseFloat(str.replace(',', '.'));

// ✅ hooks/useRelatorioCAUQData.js (com side effects)
export const useRelatorioCAUQData = (projectId) => {
  const { data } = useQuery({...});
  const cleaned = data?.map(d => ({ ...d, abertura: parseAbertura(d.abertura) }));
  return { data: cleaned };
};
```

### Consequências
- ✅ Testes isolados para utils (47 testes)
- ✅ Sem duplicação de lógica
- ✅ Reutilização em diferentes contextos
- ⚠️ Exige disciplina (mas padrão claro)

---

## ADR-003: Teste Unitário vs Integração

**Status**: ✅ Parcial  
**Data**: 2026-05-28  
**Contexto**: Cobertura de testes

### Decisão
- **Unitários**: Utils (parseAbertura, etc) → vitest + node env
- **Integração**: Componentes simples → vitest + estrutura de props
- **E2E**: Não necessário atualmente (usar quando houver)

### Alternativas Consideradas
- ❌ Snapshot testing (frágil, alto manutenção)
- ❌ E2E tests de tudo (caro em CI/CD)
- ✅ **ESCOLHIDA** — Unit + integração seletiva

### Status Atual
- ✅ Utils: Estruturados em testes unitários
- ✅ Componentes: Estruturados em testes de integração
- ⚠️ Hooks: Implícitamente testados via componentes
- ⚠️ Pages: Testados via features

### Próximos Passos
- Expandir testes de integração conforme necessário
- Adicionar E2E quando publicar

---

## ADR-004: Nomenclatura Default vs Named Exports

**Status**: ✅ Aprovado  
**Data**: 2026-05-28  
**Contexto**: Padrão de exports

### Decisão
- **Default**: Componentes React, Pages
- **Named**: Utils, Serviços, Constantes

### Alternativas Consideradas
- ❌ Tudo default
- ❌ Tudo named
- ✅ **ESCOLHIDA** — Separação por tipo

### Exemplos
```javascript
// ✅ Default — Componentes
export default function RelatorioCAUQGraficos() { }

// ✅ Named — Utils
export const parseAbertura = () => { };
export const buildPolylinePoints = () => { };
```

### Consequências
- ✅ Claro qual é o "main" export
- ✅ Fácil refatorar imports
- ✅ Consistente com comunidade React

---

## ADR-005: Aliases @ para Importações

**Status**: ✅ Aprovado  
**Data**: 2026-05-28  
**Contexto**: Evitar caminhos relativos profundos

### Decisão
Usar `@/` como alias para `src/` em todas as importações

### Configuração
```javascript
// vitest.config.js
resolve: {
  alias: {
    '@': resolve(__dirname, './src'),
  },
}

// jsconfig.json (se houver)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

### Exemplos
```javascript
// ✅ BOM
import Component from '@/components/X';
import { useData } from '@/hooks/useData';

// ❌ EVITAR
import Component from '../../../components/X';
import { useData } from '../../hooks/useData';
```

### Consequências
- ✅ Caminhos legíveis
- ✅ Fácil mover arquivos
- ✅ Sem confusão de profundidade

---

## ADR-006: Formatação de Relatórios em SVG

**Status**: ✅ Aprovado  
**Data**: 2026-05-28  
**Contexto**: Gráficos de granulometria, visualizações

### Decisão
Usar SVG nativo (não bibliotecas como Recharts) para:
- Escala logarítmica (precisão matemática)
- Controle pixel-perfect para PDF
- Performance com muitas polylines

### Alternativas Consideradas
- ❌ Recharts (inflexível para log scale)
- ❌ Canvas (impossível imprimir)
- ✅ **ESCOLHIDA** — SVG nativo

### Implementação
- ✅ `RelatorioCAUQGraficos.jsx` — SVG puro
- ✅ Subcomponentes: GranulometriaGrid, GranulometriaPolyline
- ✅ Cálculos: getXLog(), getYGraph()

### Consequências
- ✅ Total controle visual
- ✅ Impressão PDF perfeita
- ✅ Sem dependências extras
- ⚠️ Menos automático que bibliotecas (OK para nosso caso)

---

## ADR-007: Organização de Hooks (use*Data, use*Form, use*Actions)

**Status**: ✅ Aprovado  
**Data**: 2026-05-28  
**Contexto**: 50+ hooks, organização clara

### Decisão
Separar hooks por responsabilidade com sufixos semânticos:
- `use*Data.js` → Data fetching (useQuery)
- `use*Form.js` → Form state (useForm, useState)
- `use*Actions.js` → Mutations (useMutation)
- `use*Filters.js` → Filter logic (useState)

### Exemplos
```
hooks/
├── useRelatorioCAUQData.js    → Fetch relatório
├── useEnsaioCAUQForm.js       → Form de ensaio
├── useEnsaioCAUQActions.js    → Salvar ensaio
├── useProjectsFilters.js      → Filter projects
└── useDashboardData.js        → Dashboard stats
```

### Consequências
- ✅ Fácil encontrar hook certo
- ✅ Semântica clara
- ✅ Escalável para 100+ hooks
- ✅ Padrão documentado em PADROES_CODIGO.md

---

## ADR-008: Base44 SDK — Chamadas Centralizadas

**Status**: ✅ Aprovado  
**Data**: 2026-05-28  
**Contexto**: Uso seguro de base44.entities.*, base44.auth.*

### Decisão
- ✅ Usar `base44.entities.*.list()`, `create()`, `update()`, `delete()`
- ✅ Usar `base44.auth.me()`, `base44.auth.redirectToLogin()`
- ✅ Usar `base44.functions.invoke()` para backend
- ❌ NÃO usar `createPageUrl()` (use rotas em App.jsx)
- ✅ Sempre usar `try/catch` ou error handling

### Exemplos
```javascript
// ✅ BOM
const { data } = useQuery({
  queryFn: () => base44.entities.Project.list(),
});

// ✅ COM ERRO
try {
  await base44.entities.Project.create(data);
} catch (error) {
  console.error('Erro ao criar projeto');
}

// ❌ EVITAR
const url = createPageUrl('RelatorioCAUQ'); // Use <Link to="/relatorio-cauq">
```

### Consequências
- ✅ Erro handling consistente
- ✅ Sem chamadas frágeis
- ✅ Fácil auditar imports
- ✅ 0 secrets hardcoded

---

## ADR-009: Rotas em App.jsx (não pagesConfig.js automático)

**Status**: ✅ Aprovado  
**Data**: 2026-05-28  
**Contexto**: Flexibilidade nas rotas

### Decisão
`pages.config.js` pode ser override manual. App.jsx é fonte de verdade.

### Padrão
```javascript
// App.jsx
<Route path="/" element={<Dashboard />} />
<Route path="/relatorio-cauq" element={<RelatorioCAUQ />} />
<Route path="/ensaio-cauq" element={<EnsaioCAUQ />} />

// Com layout
<Route element={<Layout />}>
  <Route path="/relatorio-*" element={<Relatorio />} />
</Route>
```

### Consequências
- ✅ Rotas explícitas, fácil debugar
- ✅ Layouts customizáveis
- ⚠️ Exige atualizar App.jsx para nova página

---

## ADR-010: Testes com Vitest (node env, não jsdom)

**Status**: ✅ Aprovado  
**Data**: 2026-05-28  
**Contexto**: Performance e foco em lógica

### Decisão
- ✅ Vitest com `environment: 'node'`
- ✅ Testes de funções puras (utils)
- ✅ Testes de estrutura de componentes (props, retorno)
- ❌ NÃO usar jsdom (custo/benefício baixo)

### Configuração
```javascript
// vitest.config.js
test: {
  environment: 'node',
  globals: true,
}
```

### Exemplos
```javascript
// ✅ Teste de util
it('parseia abertura com vírgula', () => {
  expect(parseAbertura('75,0')).toBe(75);
});

// ✅ Teste de componente (importabilidade)
it('módulo importável e é função', async () => {
  const mod = await import('@/components/X');
  expect(typeof mod.default).toBe('function');
});
```

### Consequências
- ✅ Testes rápidos (node é leve)
- ✅ Foco em lógica, não renderização
- ✅ Testes estruturados executam rapidamente
- ⚠️ Sem testes visuales (aceitável)

---

## 🔄 Processos de Decisão Futuros

Ao fazer mudanças arquiteturais, documentar em ADR:
1. Contexto — Por que mudança é necessária?
2. Alternativas — Outras opções consideradas?
3. Decisão — Qual escolha, por quê?
4. Consequências — Impacto positivo/negativo?
5. Status — Aprovado/Rejeitado/Pendente?

---

## 📋 Índice de ADRs

| ADR | Título | Status |
|---|---|---|
| ADR-001 | Separação de Componentes por Domínio | ✅ Aprovado |
| ADR-002 | Funções Puras em Utils vs Lógica em Hooks | ✅ Aprovado |
| ADR-003 | Teste Unitário vs Integração | ✅ Parcial |
| ADR-004 | Nomenclatura Default vs Named Exports | ✅ Aprovado |
| ADR-005 | Aliases @ para Importações | ✅ Aprovado |
| ADR-006 | Formatação de Relatórios em SVG | ✅ Aprovado |
| ADR-007 | Organização de Hooks (use*) | ✅ Aprovado |
| ADR-008 | Base44 SDK — Chamadas Centralizadas | ✅ Aprovado |
| ADR-009 | Rotas em App.jsx | ✅ Aprovado |
| ADR-010 | Testes com Vitest | ✅ Aprovado |

---

**Próxima revisão**: 28/08/2026  
**Última atualização**: 28/05/2026