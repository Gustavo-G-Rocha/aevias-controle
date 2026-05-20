# Arquitetura do Projeto — Afirmaevias

> Criado em: 2026-05-20  
> Baseado na segunda rodada de refatoração

---

## Visão Geral

Aplicação React (Vite) usando Base44 como backend as a service.  
Arquitetura orientada a domínio com separação clara entre UI, hooks, services e utils.

---

## Estrutura de Pastas

```
src/
├── pages/              # Componentes de página (rotas)
├── components/         # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── layout/         # Layout da aplicação (sidebar, header, nav)
│   ├── checklists/     # Componentes específicos de checklists
│   │   └── aplicacao/  # Componentes da seção de aplicação
│   ├── relatorios/     # Componentes de relatórios/impressão
│   ├── ensaios/        # Componentes de lista/tabela de ensaios
│   ├── dashboard/      # Componentes do dashboard
│   ├── projects/       # Componentes de projetos
│   ├── obras/          # Componentes de obras
│   ├── nc/             # Componentes de não conformidades
│   └── regionais/      # Componentes de regionais
├── hooks/              # Hooks customizados (lógica de formulários, dados)
├── services/           # Chamadas de API e integração externa
├── utils/              # Funções puras (cálculos, formatação, validação)
├── constants/          # Constantes e configurações estáticas
├── lib/                # Utilitários de infraestrutura (auth, query client)
├── entities/           # Schemas das entidades Base44
├── functions/          # Funções backend (Deno)
├── docs/               # Documentação técnica
└── api/                # Cliente Base44 inicializado
```

---

## Camadas da Aplicação

### 1. UI — Páginas e Componentes

**Regra:** Somente renderização. Zero lógica de negócio inline.

```jsx
// ✅ Correto — página usa hook, renderiza resultado
export default function ChecklistConcretagem() {
  const { formData, handleSubmit, ... } = useChecklistConcretagem();
  return <form onSubmit={handleSubmit}>...</form>;
}

// ❌ Errado — lógica de negócio inline na página
export default function ChecklistConcretagem() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser); }, []);
  // 1000+ linhas de handlers, validações, submissão...
}
```

### 2. Hooks — Estado e Ciclo de Vida

**Regra:** Orquestram estado, ciclo de vida e handlers. Chamam services e utils.

```js
// hooks/useChecklistConcretagem.js
export function useChecklistConcretagem() {
  const [formData, setFormData] = useState(getInitialFormData());
  // handlers, validação, submissão...
  return { formData, setFormData, loading, saving, handlers };
}
```

**Hooks existentes:**
| Hook | Responsabilidade |
|------|-----------------|
| `useChecklistForm` | Carregamento genérico de checklists (obra, projetos, permissões) |
| `useEnsaioForm` | Carregamento genérico de ensaios |
| `useChecklistConcretagem` | Lógica específica do checklist de concretagem |
| `useDiarioObra` | Lógica específica do diário de obra |
| `useLayoutData` | Dados do layout (user, obras, pendingTransfers) |
| `useEnsaiosList` | Listagem paginada de ensaios |
| `useDashboardData` | Dados agregados do dashboard |
| `useTableFilters` | Filtros de tabela |
| `useReportMode` | Modo de impressão de relatórios |
| `useChecklistConcretagem` | Cargas, CPs, upload — checklist concreto |
| `useDiarioObra` | Upload, validação — diário de obra |

### 3. Services — API e Integração Externa

**Regra:** Chamadas de API, transformação de payload, sem estado.

```
services/
  ensaiosService.js     — CRUD de ensaios
  checklistsService.js  — CRUD de checklists
  projectsService.js    — Projetos
  regionaisService.js   — Regionais
  obrasService.js       — Obras
  uploadService.js      — Upload de arquivos
  usuariosService.js    — Usuários
  dashboardService.js   — Dados agregados do dashboard
```

### 4. Utils — Cálculos e Transformações Puras

**Regra:** Funções puras, sem efeitos colaterais, testáveis de forma isolada.

```
utils/
  relatorioUtils.js          — Formatação de datas e assinaturas
  dashboardCalculations.js   — Cálculos de métricas
  checklistValidation.js     — Validação de formulários
  accessControl.js           — Verificação de permissões
  entityConfig.js            — Configuração de entidades
  regionalFilter.js          — Filtro por regional
  dataSanitization.js        — Sanitização de dados
  imageUpload.js             — Upload de imagens
  index.ts                   — Utilities gerais
```

### 5. Constants — Dados Estáticos

```
constants/
  sieves.js    — Configuração de peneiras DNIT/ASTM
```

---

## Layout da Aplicação

```
layout.jsx (orquestrador puro, ~80 linhas)
│
├── components/layout/useLayoutData.js    — dados (user, obras, pendingTransfers)
├── components/layout/AppSidebar.jsx      — sidebar desktop
├── components/layout/MobileHeader.jsx    — header mobile
├── components/layout/BottomNav.jsx       — nav inferior mobile
├── components/layout/UserMenu.jsx        — perfil/logout
├── components/layout/CreateEnsaioDialog.jsx — modal de novo registro
└── components/layout/NavigationConfig.js — rotas e menus
```

---

## Controle de Acesso

Baseado em `user.role` e `user.access_level`:

| Nível | Role/AccessLevel | Permissões |
|-------|-----------------|------------|
| Admin | `role: 'admin'` | Tudo |
| Sala Técnica | `access_level: 'sala_tecnica_afirmaevias'` | Leitura + aprovação |
| Gestor de Contrato | `access_level: 'gestor_contrato'` | Gestão regional |
| Cliente | `access_level: 'cliente'` | Leitura + assinatura |
| Laboratorista | `role: 'user'` (padrão) | CRUD dos seus registros |

Constantes centralizadas em `lib/layoutConstants.js`.

---

## Formulários — Arquitetura Padrão

Todos os formulários grandes seguem o mesmo padrão:

```
páginas/FormularioXxx.jsx
  └── usa hooks/useFormularioXxx.js
        ├── usa services/xxxService.js
        ├── usa utils/xxxValidation.js
        └── usa utils/xxxCalculations.js (quando aplicável)
```

**Estado de aprovação:**
- `status: 'rascunho'` → visível apenas ao criador
- `status: 'finalizado'` → visível a gestores
- `approved: null` → aguardando aprovação
- `approved: true` → aprovado
- `approved: false` → reprovado (editável pelo criador)

---

## Relatórios (Impressão)

Todos os relatórios seguem o padrão:
- Recebem `id` via URL params
- Carregam dados e formatam com `utils/relatorioUtils.js`
- Usam `components/relatorios/SignatureFooter.jsx`
- Usam `components/relatorios/RelatorioHeader.jsx`
- Usam `components/relatorios/PrintStyles.jsx`

---

## Performance — Regras

### ✅ Usar Set/Map para lookups
```js
// O(1) em vez de O(n) em loop
const obrasMap = new Map(obras.map(o => [o.id, o]));
const obra = obrasMap.get(obraId); // O(1)

const regionaisSet = new Set(regionaisIds);
const filtradas = obras.filter(o => regionaisSet.has(o.regional_id)); // O(n)
```

### ✅ Single-pass em vez de múltiplos .filter()
```js
// ❌ Evitar
const finalizados = ensaios.filter(e => e.status === 'finalizado');
const aprovados = ensaios.filter(e => e.approved === true);

// ✅ Preferir
const { finalizados, aprovados } = ensaios.reduce((acc, e) => {
  if (e.status === 'finalizado') acc.finalizados++;
  if (e.approved === true) acc.aprovados++;
  return acc;
}, { finalizados: 0, aprovados: 0 });
```

### ✅ useCallback em handlers de formulário
```js
// Evita re-criação de funções a cada render
const handleChange = useCallback((field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
}, []);
```

### ✅ useMemo para dados derivados
```js
const selectedProject = useMemo(
  () => projects.find(p => p.id === formData.project_id),
  [projects, formData.project_id]
);
```

---

## Entidades Principais

| Entidade | Propósito |
|----------|-----------|
| `Regional` | Agrupamento geográfico de obras |
| `Obra` | Contrato/projeto de obra |
| `Project` | Projeto técnico (CAUQ, MRAF, BGS, etc.) |
| `DiarioObra` | Registro diário de atividades |
| `ChecklistUsina` | Controle de usinagem |
| `ChecklistAplicacao` | Controle de aplicação em campo |
| `ChecklistConcretagem` | Controle de concretagem |
| `EnsaioCAUQ` | Ensaio de CAUQ (extração + granulometria + Marshall) |
| `RelatorioNC` | Relatório de não conformidades |
| `FaixaGranulometrica` | Especificações granulométricas |

---

## Decisões Técnicas

### Por que Base44 e não Next.js?
Plataforma Base44 fornece backend as a service com autenticação, banco de dados e integração. Stack é Vite + React.

### Por que hooks customizados em vez de context?
Formulários são independentes entre si. Context seria over-engineering para estado local de formulário.

### Por que `useCallback` em handlers de formulário?
Formulários com muitos campos criam muitos re-renders. `useCallback` evita que funções sejam recriadas a cada render do pai.

### Por que `Set` em vez de `.includes()` para arrays grandes?
`.includes()` é O(n). `Set.has()` é O(1). Com arrays de 100+ regionais/obras, a diferença é perceptível.