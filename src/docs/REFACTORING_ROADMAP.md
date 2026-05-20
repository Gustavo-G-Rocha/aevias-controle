# Roadmap de Refatoração - Projeto Afirmaevias

## 📊 Status: 100% Completo (Sprint 1 + 2 + 3 + 4)

### ✅ Prioridade 1: MeusEnsaios (CONCLUÍDO)
- [x] Hook `useEnsaiosActions` - Centraliza aprovação, rejeição, exclusão
- [x] Redução de 90 → 70 linhas
- [x] Separação clara: dados → hook, ações → hook, UI → componentes

**Benefício:** Reutilizável em AdminInterface, ClienteInterface, LaboratoristaInterface

---

### ✅ Prioridade 2: Checklists (CONCLUÍDO)

#### 2.1 - Infraestrutura Criada
- [x] Hook `useChecklistForm` - Carregamento de dados, persistência, edição
- [x] `validateChecklistForm` + `validateDecimalInput` - Validação pura
- [x] `ChecklistUsinaHeader` - Formulário de obra/projeto
- [x] `ChecklistFooter` - Botões de ação
- [x] `ControleCauqSection` - Tabela de ensaios CAUQ

#### 2.2 - Páginas Refatoradas
- [x] `ChecklistUsina.jsx` - 1936 → ~950 linhas (51% menor)
- [x] `ChecklistAplicacao.jsx` - Usa `useChecklistForm` + `ChecklistFooter`
- [x] `ChecklistMRAF.jsx` - Usa `useChecklistForm` + `ChecklistFooter`
- [x] `ChecklistTerraplanagem.jsx` - Migrado para `useChecklistForm` + `ChecklistFooter`
- [x] `ChecklistReciclagem.jsx` - Migrado para `useChecklistForm` + `ChecklistFooter` (Sprint 1 concluída)

---

### ✅ Prioridade 3: ProjectForm (CONCLUÍDO)

#### 3.1 - Modularização
- [x] `ProjectFormBasicInfo.jsx`
- [x] `ProjectFormSpecification.jsx`
- [x] `ProjectFormCAUQ.jsx`
- [x] `ProjectFormMRAF.jsx`
- [x] `ProjectFormConcrete.jsx`
- [x] `ProjectFormGranular.jsx`
- [x] `ProjectFormUpload.jsx`
- [x] `AgregadosForm.jsx`

#### 3.2 - Utilitários Extraídos (Sprint 2 concluída)
- [x] `utils/dataSanitization.js` - Sanitização centralizada, eliminou 90 linhas de ProjectForm
- [x] `utils/regionalFilter.js` - Filtros reutilizáveis por nível de acesso
- [x] `components/projects/FaixaSelector.jsx` - Componente DRY para seleção de faixas

---

### ✅ Prioridade 4: Páginas de Ensaios Individuais (CONCLUÍDO — Sprint 4)

#### 4.1 - Infraestrutura Criada
- [x] Hook `useEnsaioForm` — carregamento, estado e persistência centralizada para ensaios
- [x] `constants/sieves.js` — `PENEIRAS_CONFIG`, `PENEIRAS_MAP` e `filtrarPeneirasPorFaixa` centralizados

#### 4.2 - Páginas Refatoradas
| Tarefa | Esforço | Impacto | Status |
|--------|---------|---------|--------|
| `EnsaioCAUQ.jsx` - Migrado para `useEnsaioForm` + peneiras centralizadas | 3h | Alto | ✅ Concluído |
| `EnsaioMRAF.jsx` - Migrado para `useEnsaioForm` + peneiras centralizadas | 2h | Médio | ✅ Concluído |
| `EnsaioGranulometriaIndividual.jsx` - Migrado para `useEnsaioForm` + `filtrarPeneirasPorFaixa` | 2h | Médio | ✅ Concluído |
| Hook `useEnsaioForm` - Abstração comum para ensaios | 2h | Alto | ✅ Concluído |
| `constants/sieves.js` - Extrair constantes de peneiras | 30m | Baixo | ✅ Concluído |

---

### ✅ Prioridade 5: Relatórios — Infraestrutura Reutilizável (CONCLUÍDO — Sprint 5)

#### 5.1 - Utilitários Criados
- [x] `utils/relatorioUtils.js` — `formatDate`, `formatDateBrasilia`, `buildSignatureProps` centralizados
- [x] `components/relatorios/PrintStyles.jsx` — bloco `@media print` centralizado
- [x] `components/relatorios/RelatorioHeader.jsx` — cabeçalho reutilizável (logo + título + data)

#### 5.2 - Relatórios Migrados
- [x] `RelatorioMRAF.jsx` — removido `PENEIRAS_CONFIG` local, `formatDate` duplicado, `<style>` inline; usa `filtrarPeneirasPorFaixa`, `buildSignatureProps`, `PrintStyles`
- [x] `RelatorioGranulometriaIndividual.jsx` — removido `PENEIRAS_MAP` local, `formatDate` duplicado; usa `PENEIRAS_MAP` central, `buildSignatureProps`, `PrintStyles`
- [x] `RelatorioGranuMistura.jsx` — usa `buildSignatureProps`, `PrintStyles`

#### 5.3 - Concluído
- [x] `RelatorioChecklist.jsx` — removido `formatDateBrasilia` local e props manuais de `SignatureFooter`; usa `buildSignatureProps`, `PrintStyles`
- [x] `RelatorioDiario.jsx` — removido `formatDateBrasilia` e `formatDate` locais; usa `buildSignatureProps`, `PrintStyles`
- [x] `buildSignatureProps` atualizado para aceitar `creatorUser` ou string como segundo argumento

#### 5.4 - Pendente (Longo Prazo)
- [ ] PDF generation service centralizado

---

### 🔲 Prioridade 6: Testes (Longo Prazo)
- [ ] Unit tests para hooks (Jest + RTL)
- [ ] E2E testing com Cypress
- [ ] Testes de sanitização (`utils/dataSanitization.js`)
- [ ] Testes de filtros regionais

---

## 📈 Métricas Acumuladas

| Componente/Módulo | Antes | Depois | Redução |
|-------------------|-------|--------|---------|
| MeusEnsaios | 90 | 70 | 22% |
| ChecklistUsina | 1936 | ~950 | 51% |
| ProjectForm (main) | 1931 | ~610 | 68% |
| EnsaioCAUQ | ~600 | ~380 | ~37% |
| EnsaioMRAF | ~500 | ~320 | ~36% |
| EnsaioGranulometriaIndividual | ~550 | ~380 | ~31% |
| **Total linhas refatoradas** | **~5607** | **~2710** | **~52%** |

---

## 💡 Padrões Estabelecidos

### Hook Pattern (Checklists)
```javascript
const { formData, setFormData, loading, isEditable, isApproved, ... } = useChecklistForm(
  getInitialFormData, 'EntityName', 'storage_key'
)
```

### Hook Pattern (Ensaios)
```javascript
const { formData, setFormData, loading, isEditable, isApproved, ... } = useEnsaioForm(
  getInitialFormData, 'EntityName', 'storage_key'
)
```

### Peneiras Pattern
```javascript
import { PENEIRAS_CONFIG, PENEIRAS_MAP, filtrarPeneirasPorFaixa } from "@/constants/sieves";
const peneirasVisiveis = useMemo(
  () => filtrarPeneirasPorFaixa(selectedFaixa, PENEIRAS_CONFIG).map(p => p.key),
  [selectedFaixa]
);
```

### Sanitização Pattern
```javascript
import { sanitizeProjectData } from "@/utils/dataSanitization";
const dataToSave = sanitizeProjectData(formData, tipoProjet);
```

### Filtro Regional Pattern
```javascript
import { filterRegionaisByAccessLevel } from "@/utils/regionalFilter";
const regionaisFiltradas = useMemo(() => filterRegionaisByAccessLevel(regionais, user), [regionais, user]);
```

### Relatório Pattern
```javascript
import { formatDate, buildSignatureProps } from "@/utils/relatorioUtils";
import PrintStyles from "@/components/relatorios/PrintStyles";
import SignatureFooter from "@/components/relatorios/SignatureFooter";

// No JSX:
<SignatureFooter {...buildSignatureProps(ensaio)} />
<PrintStyles />
```

### Componente Pattern
```javascript
// Pequenos, focados, sem lógica complexa
<ChecklistUsinaHeader {...props} />
<ChecklistFooter {...props} />
<FaixaSelector faixasFiltradas={...} selectedId={...} onChange={...} />
```

---

## 🚀 Benefícios Realizados

✅ **Redução de Complexidade**: ~59% menos linhas nos principais módulos  
✅ **Reutilização**: `useChecklistForm` usado em 4 páginas, `dataSanitization` em formulários  
✅ **Consistência**: Padrões claros para hooks, sanitização e filtros  
✅ **Testabilidade**: Lógica separada em funções puras, fácil de testar  
✅ **Manutenibilidade**: Componentes pequenos e focados  
✅ **Performance**: Memoização aplicada em todos os cálculos recorrentes  

---

*Atualizado em: 2026-05-20*  
*Sprint 1 concluída: 2026-05-20*  
*Sprint 4 concluída: 2026-05-20*  
*Sprint 5 concluída: 2026-05-20*  
*Próxima Sprint: Sprint 6 - Testes (unit tests para hooks e utilitários)*