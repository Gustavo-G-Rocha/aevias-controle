# 🔄 Padrão de Refatoração para Páginas de Ensaios

## Visão Geral

Padrão replicável para refatorar páginas de ensaios, transformando-as de **monolitos de 500+ linhas** em **orquestradores de 120-150 linhas** com componentes modulares e funções puras testadas.

**Tempo estimado por ensaio:** 2-3 horas  
**Redução de linhas:** 70-76%  
**Cobertura de testes:** 100% em utils

---

## Estrutura Padrão

```
src/
├── hooks/
│   ├── useEnsaio[TIPO]Data.js      (70-80 linhas)
│   ├── useEnsaio[TIPO]Form.js      (80-100 linhas)
│   └── useEnsaio[TIPO]Actions.js   (50-60 linhas)
├── components/ensaio-[tipo]/
│   ├── EnsaioTIPOHeader.jsx        (30-40 linhas)
│   ├── EnsaioTIPODadosGerais.jsx   (120-150 linhas)
│   ├── EnsaioTIPOForm/              (70-200 linhas)
│   │   └── [seções específicas]
│   ├── EnsaioTIPOResumo.jsx        (40-50 linhas)
│   └── EnsaioTIPOActions.jsx       (20-30 linhas)
├── utils/
│   └── ensaioTIPOUtils.js          (100-150 linhas)
├── tests/
│   └── ensaioTIPOUtils.test.js     (200-300 linhas)
└── pages/
    └── EnsaioTIPO.jsx              (100-150 linhas)
```

---

## 1️⃣ Extrair Funções Puras → utils/

### Passo 1a: Identificar cálculos e validações

Procure por **funções puras** na página original (sem setState, sem API calls):

```javascript
// Exemplo: calcularEnsaio, formatarValor, isNaoConforme
```

### Passo 1b: Extrair em ensaioTIPOUtils.js

**Estrutura típica:**
- `getTemplate()` — template vazio de novo ensaio
- `calcularValores()` — cálculos automáticos
- `calcularMedias()` — agregação de resultados
- `isNaoConforme()` — validação contra limites
- `formatarValor()` — formatação de saída

### Passo 1c: Testes 100% cobertura

Para cada função:
- 1-2 testes de sucesso (caminho feliz)
- 1-2 testes de edge cases (valores nulos, zeros, limites)

**Meta:** 20-30 testes por utils

---

## 2️⃣ Extrair Lógica de Dados → useEnsaio[TIPO]Data.js

### Passo 2a: Identificar o que carregar

```javascript
// Sempre presente em ensaios:
const currentUser = await base44.auth.me();
const obras = await base44.entities.Obra.list();
const editingEnsaio = editId ? await base44.entities.EnsaioTIPO.get(editId) : null;
```

### Passo 2b: Criar o hook

```javascript
export const useEnsaioTIPOData = () => {
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [editingEnsaio, setEditingEnsaio] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadInitialData = useCallback(async () => {
    // 1. Carregar user + obras
    // 2. Filtrar obras por access_level
    // 3. Carregar ensaio se editId na URL
  }, [location, navigate]);

  return { user, obras, editingEnsaio, loading, loadInitialData };
};
```

**Responsabilidade:** Apenas carregamento e filtro de dados.

---

## 3️⃣ Extrair Formulário → useEnsaio[TIPO]Form.js

### Passo 3a: Estado inicial

```javascript
const [formData, setFormData] = useState(() => ({
  obra_id: "",
  data_ensaio: new Date().toISOString().split('T')[0],
  // ... todos os campos
}));
```

### Passo 3b: Handlers de mudança com cálculos

```javascript
const handleFieldChange = useCallback((field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
}, []);

const handleEnsaioChange = useCallback((index, field, value) => {
  setFormData(prev => {
    const novos = [...prev.ensaios];
    // Usar utils para recalcular
    novos[index] = calcularEnsaio({ ...novos[index], [field]: value }, area);
    const medias = calcularMedias(novos);
    return { ...prev, ensaios: novos, ...medias };
  });
}, []);
```

**Chave:** Useeffect para renderização automática ao mudar valores.

### Passo 3c: Operações CRUD em ensaios

```javascript
const adicionarEnsaio = useCallback(() => {
  setFormData(prev => ({
    ...prev,
    ensaios: [...prev.ensaios, getEnsaioInicial(prev.ensaios.length + 1)]
  }));
}, []);

const removerEnsaio = useCallback((index) => {
  setFormData(prev => {
    const novos = prev.ensaios.filter((_, i) => i !== index);
    return { ...prev, ensaios: novos, ...calcularMedias(novos) };
  });
}, []);
```

---

## 4️⃣ Extrair Ações → useEnsaio[TIPO]Actions.js

### Passo 4a: Salvamento

```javascript
const handleSubmit = useCallback(async (formData, user, editingEnsaio, finalizar) => {
  if (!formData.obra_id) {
    alert("Preencha Obra.");
    return;
  }

  setSaving(true);
  try {
    const dataToSave = {
      ...formData,
      laboratorista_name: user?.laboratorista_name,
      status: finalizar ? 'finalizado' : 'rascunho'
    };

    if (editingEnsaio) {
      await base44.entities.EnsaioTIPO.update(editingEnsaio.id, dataToSave);
    } else {
      await base44.entities.EnsaioTIPO.create(dataToSave);
    }

    navigate(createPageUrl('MeusEnsaios'));
  } finally {
    setSaving(false);
  }
}, [navigate]);
```

**Responsabilidade:** Apenas salvamento e navegação.

---

## 5️⃣ Extrair Componentes → components/ensaio-[tipo]/

### Passo 5a: Header (30-40 linhas)

```javascript
// EnsaioTIPOHeader.jsx
export default function EnsaioTIPOHeader({ editingEnsaio }) {
  return (
    <CardHeader>
      <CardTitle>{editingEnsaio ? 'Editar' : 'Novo'} Ensaio...</CardTitle>
      {editingEnsaio?.rejection_reason && <AlertBox />}
    </CardHeader>
  );
}
```

### Passo 5b: DadosGerais (120-150 linhas)

Todos os campos iniciais (obra, data, rodovia, etc.)

```javascript
// EnsaioTIPODadosGerais.jsx
export default function EnsaioTIPODadosGerais({
  formData,
  obras,
  isEditable,
  onFieldChange
}) {
  return (
    <div>
      <h3>Dados da Obra</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 12-15 inputs */}
      </div>
    </div>
  );
}
```

### Passo 5c: Seções específicas (70-200 linhas cada)

Agrupar inputs relacionados:
- **Dimensões/Bandeja** — geometria
- **Ensaios** — loop de dados
- **Parâmetros** — configuração

### Passo 5d: Resumo (40-50 linhas)

Exibição de resultados + validação

```javascript
// EnsaioTIPOResumo.jsx
export default function EnsaioTIPOResumo({ formData }) {
  return (
    <div>
      {/* Grid 2-4 colunas com resultados */}
      {/* Cores e highlighting automático */}
    </div>
  );
}
```

### Passo 5e: Actions (20-30 linhas)

Botões: Cancelar, Salvar, Finalizar

```javascript
// EnsaioTIPOActions.jsx
export default function EnsaioTIPOActions({
  isEditable,
  saving,
  onSaveDraft,
  onFinalize,
  onCancel
}) {
  return (
    <div className="flex justify-end gap-3">
      {/* Botões */}
    </div>
  );
}
```

---

## 6️⃣ Refatorar Página → pages/EnsaioTIPO.jsx

### Transformação Final

**De:**
```javascript
// 500+ linhas com tudo acoplado
export default function EnsaioTIPOPage() {
  const [formData, setFormData] = useState(...);
  const [user, setUser] = useState(...);
  const [loading, setLoading] = useState(...);
  // ... 400 linhas de JSX
}
```

**Para:**
```javascript
// 120-150 linhas: apenas orquestração
import useEnsaioTIPOData from "@/hooks/useEnsaioTIPOData";
import useEnsaioTIPOForm from "@/hooks/useEnsaioTIPOForm";
import useEnsaioTIPOActions from "@/hooks/useEnsaioTIPOActions";

export default function EnsaioTIPOPage() {
  const { user, obras, editingEnsaio, loading, loadInitialData } = useEnsaioTIPOData();
  const { formData, handleFieldChange, ... } = useEnsaioTIPOForm(editingEnsaio);
  const { saving, handleSubmit, handleCancel } = useEnsaioTIPOActions();

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  if (loading) return <Loader />;

  return (
    <Card>
      <Header editingEnsaio={editingEnsaio} />
      <Content>
        <DadosGerais ... />
        <Seção1 ... />
        <Seção2 ... />
        <Resumo ... />
        <Actions ... />
      </Content>
    </Card>
  );
}
```

---

## ✅ Checklist por Ensaio

- [ ] Extrair funções puras em utils (calcular, formatar, validar)
- [ ] Escrever testes 100% cobertura em utils
- [ ] Criar useEnsaioTIPOData (carregamento + filtros)
- [ ] Criar useEnsaioTIPOForm (estado + handlers)
- [ ] Criar useEnsaioTIPOActions (save + cancel)
- [ ] Extrair Header (30-40 linhas)
- [ ] Extrair DadosGerais (120-150 linhas)
- [ ] Extrair seções específicas (Dimensões, Ensaios, Parâmetros, etc.)
- [ ] Extrair Resumo (40-50 linhas)
- [ ] Extrair Actions (20-30 linhas)
- [ ] Refatorar página em orquestrador (100-150 linhas)
- [ ] Testar 100% no navegador
- [ ] Documentar em REFACTORING_ENSAIO[TIPO].md

---

## 🎯 Próximas Páginas (em sequência)

1. ✅ **EnsaioTaxaMRAF** — COMPLETO (522 → 125 linhas, 76%)
2. **EnsaioTaxaPinturaImprimacao** (380 linhas)
3. **EnsaioVigaBenkelman** (290 linhas)
4. **EnsaioMRAF** (420 linhas)
5. **EnsaioProctor** (450 linhas)

---

## 💡 Dicas Finais

1. **Não refatore tudo de uma vez** — comece com utils + hooks
2. **Teste incrementalmente** — a cada hook criado, teste
3. **Reutilize padrões** — layouts, cards, grids são similares
4. **Documente mudanças** — REFACTORING_[TIPO].md por página
5. **Mantenha compatibilidade** — nenhuma funcionalidade deve quebrar

**Meta:** Padrão repetível que qualquer dev consegue aplicar em 2-3 horas.

---

**Versão:** 1.0  
**Data:** 2026-05-27  
**Status:** Template Pronto para Reuso