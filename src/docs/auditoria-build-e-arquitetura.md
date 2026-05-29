# Auditoria de Build e Arquitetura — Aevias Controle
**Data:** 2026-05-29  
**Escopo:** Análise completa de imports, entidades, pages, components, hooks, services, utils e rotas.

---

## CRÍTICO
> Problemas que quebram `npm run build` imediatamente.

### 1. Imports `@/entities/*` Remanescentes
A migração para `base44.entities.*` foi parcialmente executada, mas arquivos ainda podem conter o padrão antigo. O erro recente de build confirma:

```
Could not load /src/entities/EnsaioDensidade (imported by src/pages/EnsaioDensidade.jsx)
```

**Arquivos já corrigidos durante auditoria:**
- `pages/EnsaioDensidade.jsx` ✅
- `hooks/useChecklistForm.js` ✅
- `hooks/useEnsaioForm.js` ✅
- `hooks/useEnsaioProctorData.js` ✅
- `hooks/useFaixasGranulometricasActions.js` ✅
- `hooks/useEnsaioSondagemData.js` ✅
- `hooks/useChecklistConcretagem.js` ✅
- `hooks/useEditarNCData.js` ✅
- `hooks/useFaixasGranulometricasData.js` ✅

**Arquivos NÃO verificados individualmente (podem ainda ter o padrão antigo):**
- Todos os hooks em `hooks/useChecklist*.js` não auditados individualmente
- Componentes dentro de `pages/EnsaioCAUQ/hooks/`
- Componentes dentro de `pages/ChecklistMRAF/hooks/`
- Componentes dentro de `pages/ChecklistAplicacao/hooks/`
- Componentes dentro de `pages/ChecklistTerraplanagem/hooks/`
- Componentes dentro de `pages/ChecklistReciclagem/hooks/`
- Componentes dentro de `pages/ChecklistUsina/hooks/`
- **Recomendação:** Buscar `from "@/entities/` em TODOS os arquivos antes do próximo build.

### 2. Import de SDK com Caminho Interno
**Arquivo:** `lib/AuthContext.jsx` — linha 4:
```js
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';
```
Este import acessa internals do SDK (`/dist/utils/axios-client`). Se o SDK mudar sua estrutura interna em uma atualização, este import quebra silenciosamente ou em build. Não é um caminho público garantido pela API do SDK.

### 3. `loadAllRecords` chamado com argumento ignorado
**Arquivo:** `components/ensaios/dataLoader.jsx` — linha 35:
```js
loadAllRecords('list'),
```
A função `loadAllRecords()` em `services/recordsService.js` **não aceita parâmetros** — a assinatura é `async function loadAllRecords()`. O argumento `'list'` é silenciosamente ignorado, mas indica divergência de contrato que pode mascarar bugs.

---

## ALTO
> Problemas que podem quebrar produção ou causar comportamento incorreto.

### 4. Duplicação de Lógica de Carregamento de Dados
Existem **três sistemas paralelos** de carregamento de dados para os mesmos registros:

| Sistema | Arquivo | Uso |
|---|---|---|
| `recordsService.loadAllRecords()` | `services/recordsService.js` | Dashboard, MeusEnsaios (via React Query) |
| `loadAllData()` | `components/ensaios/dataLoader.jsx` | MeusEnsaios legacy (pode ainda estar em uso) |
| `loadDashboardData()` | `services/dashboardService.js` | Dashboard legacy |

`dashboardService.js` e `dataLoader.jsx` importam de `recordsService`, mas ainda existem como camadas redundantes. Se `recordsService` for a fonte única, `dashboardService.js` e `dataLoader.jsx` são candidatos a remoção.

### 5. `pages/RelatorioEnsaio.jsx` — Carregamento Ineficiente
Linha 29–35: carrega **TODAS** as listas de `EnsaioDensidade` e `EnsaioMRAF` apenas para encontrar um registro por ID:
```js
const [ensaiosDensidade, ensaiosMRAF, obras, projects, regionais] = await Promise.all([
  base44.entities.EnsaioDensidade.list(),
  base44.entities.EnsaioMRAF.list(),
  ...
```
Deveria usar `.get(id)` diretamente. Com bases de dados maiores, isso causa timeout ou lentidão grave em produção.

### 6. `pages/RelatorioEnsaio.jsx` — Página com Responsabilidade Reduzida / Potencialmente Morta
A página só suporta `tipo === 'densidade'` e `tipo === 'mraf'`. O comentário interno diz:
> "Note: 'diario' type is now handled by a separate dedicated page"

Verificar se ainda existe alguma rota/link apontando para `RelatorioEnsaio?tipo=diario` (causaria erro silencioso). Além disso, `EnsaioMRAF` já tem `RelatorioMRAF` dedicado (`pages/RelatorioMRAF`?) — verificar se `RelatorioEnsaio` é redundante.

### 7. `hooks/useEnsaioProctorForm.js` — Lógica de `project_ids` na Obra
Linha 21–23:
```js
if (id && obra?.project_ids?.length > 0) {
  const projs = await Promise.all(obra.project_ids.map(pid => base44.entities.Project.get(pid)));
```
O schema da entidade `Obra` **não possui campo `project_ids`** — o campo de projetos por obra está em `Regional.project_ids`. Este código nunca encontra projetos corretamente via obra.

### 8. `hooks/useGestaoNCData.js` — Limite de 200 Registros na Listagem de NCs
```js
base44.entities.RelatorioNC.list("-created_date", 200),
```
Sistemas com mais de 200 NCs não carregarão todos os registros. `useNaoConformidadesData` usa limite 1000. Inconsistência entre hooks que servem páginas similares.

### 9. `services/ensaiosService.js` — Método `.read()` Inexistente
Linhas 40, 42 e 33 usam:
```js
return base44.entities[entityName].read(id);
```
O SDK base44 expõe `.get(id)`, não `.read(id)`. `obterEnsaioById` e `obterChecklistById` em `checklistsService.js` irão falhar em runtime. **Nenhuma página atual parece chamar essas funções**, mas são armadilhas para o próximo desenvolvedor.

Mesmo problema em `obrasService.js`:
```js
return base44.entities.Obra.read(id); // linha 19 — deveria ser .get(id)
```

E em `projectsService.js`:
```js
return base44.entities.Project.read(id); // linha 19 — deveria ser .get(id)
```

---

## MÉDIO
> Problemas arquiteturais que não quebram imediatamente mas criam dívida técnica.

### 10. Services Definidos mas Nunca Utilizados pelo Frontend
Os seguintes services foram criados com boas intenções mas **nenhuma página ou hook os importa**:

| Service | Funções não utilizadas |
|---|---|
| `services/obrasService.js` | `listarObrasRecentes`, `listarObrasPorRegional`, `listarObrasAtivas`, `obterObraById`, `criarObra`, `atualizarObra`, `deletarObra` |
| `services/projectsService.js` | `listarProjects`, `listarProjectsPorTipo`, `listarProjectsAtivos`, `obterProjectById`, `criarProject`, `atualizarProject`, `deletarProject`, `obterSchemaProject` |
| `services/regionaisService.js` | Todas as funções exceto possivelmente `obterRegionaisPorGestor` |
| `services/usuariosService.js` | Todas as funções |
| `services/ensaiosService.js` | `listarEnsaios`, `listarEnsaiosPorObra`, `obterEnsaioById`, `criarEnsaio`, `atualizarEnsaio`, `deletarEnsaio`, `obterSchemaEnsaio`, `assinarEnsaio` |
| `services/checklistsService.js` | Todas as funções |

Todos os hooks e páginas chamam `base44.entities.*` diretamente em vez de usar a camada de services. A camada de services é **letra morta**.

### 11. `services/dashboardService.js` — Service Não Utilizado Diretamente
`useDashboardData.js` e `Dashboard.jsx` usam diretamente `recordsService` e `useQueryData`. O `dashboardService.js` não é importado por nenhuma página ou hook atual — é código morto.

### 12. `components/ensaios/dataLoader.jsx` — Candidato a Remoção
`loadAllData` em `dataLoader.jsx` não parece ser importado por nenhuma página atual (MeusEnsaios migrou para `useEnsaiosList` + `useQueryData`). Verificar se ainda há uso antes de remover.

### 13. `hooks/useEnsaioMRAFForm.js` — Dependência de useEffect Incompleta
Linha 29–45: o `useEffect` de cálculo automático lista explicitamente campos individuais de `extracao_ligante` como dependências:
```js
useEffect(() => {
  ...
}, [
  formData.extracao_ligante.amostra_umida,
  formData.extracao_ligante.amostra_seca,
  // ... 6 campos individuais
]);
```
Se novos campos de `extracao_ligante` forem adicionados, o efeito não reagirá a eles. Prefira `formData.extracao_ligante` como dependência única.

### 14. `pages/RelatorioChecklistPage.jsx` — Duplicata de `pages/RelatorioChecklist.jsx`
Ambas as páginas existem e ambas estão registradas em `pages.config.js`:
- `RelatorioChecklist` — usa hook `useRelatorioChecklistData`
- `RelatorioChecklistPage` — implementação inline sem hook

Duas páginas com propósito idêntico (renderizar checklist de usina). A `RelatorioChecklistPage` parece ser a versão mais antiga. Verificar se ambas estão em uso por diferentes fluxos.

### 15. `lib/AuthContext.jsx` — Estado `user` e `isAuthenticated` Redundante com `useLayoutData`
O `AuthContext` mantém um `user` próprio, e `useLayoutData` busca o mesmo usuário independentemente via `base44.auth.me()`. Existem potencialmente duas chamadas de autenticação por carregamento de página.

### 16. `hooks/useTableFilters.js` — Não Auditado
Arquivo referenciado em `other_files` mas não lido. Verificar se há imports antigos de `@/entities/*`.

### 17. Páginas Diário de Obra com Rota Aninhada
`pages/DiarioObra/index` — página usa `createPageUrl("DiarioObra")` que resolve para `/DiarioObra`. Funciona, mas o padrão de subpastas (`pages/DiarioObra/index`) não é consistente com páginas simples como `pages/EnsaioMRAF.jsx`.

---

## BAIXO
> Problemas de organização e manutenibilidade.

### 18. Inconsistência no Padrão de Estrutura de Páginas
Algumas páginas seguem o padrão de pasta (`pages/EnsaioCAUQ/index`, `pages/ChecklistUsina/index`), outras são arquivos simples (`pages/EnsaioMRAF.jsx`, `pages/EnsaioVigaBenkelman.jsx`). Sem regra clara de quando usar cada abordagem.

### 19. `utils/entityConfig.js` — Config Incompleta
`ENTITY_CONFIG` não inclui todas as entidades que existem no sistema (faltam: `EnsaioTaxaMRAF`, `EnsaioProctor`, `EnsaioRompimentoConcreto`, `GranuMistura`, `BoletimSondagem`, `BoletimSondagemTrado`, `EnsaioGranMistura`, `AcompanhamentoUsinagem`). Funções que dependem desta config (como `getEntityLabel`) retornam o nome bruto para tipos não mapeados.

### 20. `pages/MonitorProdutividade.jsx` — Sem Rota na Sidebar mas Registrado em `pages.config.js`
Página registrada e acessível via URL, mas só aparece em `NavigationConfig.ADMIN_NAVIGATION`. Sem inconsistência de build, mas dificulta auditoria.

### 21. `hooks/useRelatorioUnificadoRecords.js` — Dependência em `utils/relatorioUnificadoEntityMap.js`
`getEntityInstance` retorna instâncias de `base44.entities.*` definidas no momento da importação do módulo. Funciona, mas é redundante com `base44.entities[key]` dinâmico já disponível diretamente.

### 22. `pages/RelatorioEnsaio.jsx` — Import Não Usado: `useCallback`
```js
import React, { useState, useEffect } from 'react';
import { useCallback } from "react";
```
`useCallback` é importado duas vezes (uma no destructuring de React implícito, outra explicitamente). Além disso, `loadReportData` usa `useCallback` mas está dentro de `useEffect` sem necessidade.

---

## COMPONENTES MORTOS / CANDIDATOS A REMOÇÃO

| Arquivo | Razão |
|---|---|
| `services/obrasService.js` | Nenhuma página ou hook importa suas funções |
| `services/projectsService.js` | Nenhuma página ou hook importa suas funções |
| `services/regionaisService.js` | Nenhuma página ou hook importa suas funções |
| `services/usuariosService.js` | Nenhuma página ou hook importa suas funções |
| `services/checklistsService.js` | Nenhuma página ou hook importa suas funções |
| `services/dashboardService.js` | Não importado por nenhum componente ativo |
| `components/ensaios/dataLoader.jsx` | Provável — verificar se `loadAllData` é importado |
| `pages/RelatorioChecklistPage.jsx` | Possível duplicata de `RelatorioChecklist` |

---

## IMPORTS QUEBRADOS / RISCOS DE BUILD

| Arquivo | Import problemático | Tipo de problema |
|---|---|---|
| `lib/AuthContext.jsx` | `@base44/sdk/dist/utils/axios-client` | Acessa internal do SDK, não é API pública |
| Qualquer arquivo não auditado | `from "@/entities/*"` | Quebraria build imediatamente |
| `services/ensaiosService.js` | `.read(id)` em vez de `.get(id)` | Runtime error (não build) |
| `services/obrasService.js` | `.read(id)` em vez de `.get(id)` | Runtime error (não build) |
| `services/projectsService.js` | `.read(id)` em vez de `.get(id)` | Runtime error (não build) |
| `hooks/useEnsaioProctorForm.js` | `obra.project_ids` inexistente | Lógica silenciosamente errada |

---

## ENTIDADES INEXISTENTES / INCONSISTÊNCIAS

| Uso | Local | Problema |
|---|---|---|
| `base44.entities.EnsaioGranMistura` | Aparece em alguns contextos | Entidade existe, mas `EnsaioGranMistura` difere de `GranuMistura` — verificar se são a mesma entidade ou duas distintas |
| `ProdutividadeDiaria` | `useProdutividadeData.js` linha 149 | Entidade usada mas não aparece nas entidades listadas no schema principal — verificar se existe |
| `Obra.project_ids` | `hooks/useEnsaioProctorForm.js` | Campo não existe no schema de `Obra` |

---

## RECOMENDAÇÕES PRIORITÁRIAS

### Antes do próximo build:
1. **Buscar e eliminar TODOS os `from "@/entities/"`** no codebase — grep completo.
2. **Corrigir `.read(id)` → `.get(id)`** nos services (mesmo que não utilizados, evita confusão futura).

### Refactoring de médio prazo:
3. **Remover services mortos** (`obrasService`, `projectsService`, `regionaisService`, `usuariosService`, `checklistsService`, `dashboardService`) ou adotá-los como camada obrigatória.
4. **Corrigir `pages/RelatorioEnsaio.jsx`** para usar `.get(id)` em vez de `.list()` — crítico para performance.
5. **Unificar `RelatorioChecklist` e `RelatorioChecklistPage`** — uma das duas está redundante.
6. **Verificar existência de `ProdutividadeDiaria`** como entidade no schema.
7. **Corrigir lógica de `project_ids`** em `useEnsaioProctorForm.js` — projetos estão em `Regional`, não em `Obra`.

### Arquitetura de longo prazo:
8. **Consolidar sistema de carregamento de dados** — escolher entre `recordsService` (React Query) como único padrão e remover `dataLoader.jsx` e `dashboardService.js`.
9. **Substituir import interno do SDK** (`@base44/sdk/dist/utils/axios-client`) por API pública.
10. **Completar `utils/entityConfig.js`** com todas as entidades ativas do sistema.