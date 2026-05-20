# Roadmap de Refatoração - Projeto Afirmaevias

## 📊 Status: 100% Completo (Sprint 1 + 2 + 3)

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

### 🔲 Prioridade 4: Páginas de Ensaios Individuais (Próxima Sprint)

| Tarefa | Esforço | Impacto | Status |
|--------|---------|---------|--------|
| `EnsaioCAUQ.jsx` - Refatorar com sub-componentes | 3h | Alto | 📋 Planejado |
| `EnsaioMRAF.jsx` - Aplicar padrão | 2h | Médio | 📋 Planejado |
| `EnsaioGranulometriaIndividual.jsx` | 2h | Médio | 📋 Planejado |
| Hook `useTestForm` - Abstração comum | 2h | Alto | 📋 Planejado |
| `constants/sieves.js` - Extrair constantes de peneiras | 30m | Baixo | 📋 Planejado |

---

### 🔲 Prioridade 5: Relatórios (Longo Prazo)
- [ ] Consolidar relatórios em componentes reutilizáveis
- [ ] PDF generation service centralizado
- [ ] Assinatura digital centralizada

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
| **Total linhas refatoradas** | **~3957** | **~1630** | **~59%** |

---

## 💡 Padrões Estabelecidos

### Hook Pattern (Checklists)
```javascript
const { formData, setFormData, loading, isEditable, isApproved, ... } = useChecklistForm(
  getInitialFormData, 'EntityName', 'storage_key'
)
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
*Próxima Sprint: Sprint 4 - Ensaios Individuais (EnsaioCAUQ, EnsaioMRAF, hook useTestForm)*