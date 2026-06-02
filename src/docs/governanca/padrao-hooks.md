# Padrão de Hooks

## Objetivo

Os hooks representam a principal camada de lógica reutilizável da aplicação.

Seu objetivo é:

* centralizar regras;
* reduzir acoplamento;
* remover lógica das pages;
* aumentar reutilização;
* facilitar testes;
* melhorar previsibilidade.

---

# Arquitetura Esperada

Os módulos devem preferencialmente seguir a separação:

```txt id="jlwm4a"
useModuloData
useModuloForm
useModuloActions
```

---

# useModuloData

## Responsabilidade

Responsável por:

* carregamento de dados;
* consultas;
* derivação de dados;
* cache;
* sincronização de estado remoto;
* integração inicial.

---

## Responsabilidades Permitidas

Pode:

* buscar dados;
* transformar dados;
* derivar listas;
* preparar estruturas;
* controlar loading/error.

---

## Responsabilidades Proibidas

Não deve:

* renderizar interface;
* persistir diretamente na interface;
* controlar navegação visual;
* executar lógica pesada de renderização.

---

# useModuloForm

## Responsabilidade

Responsável por:

* gerenciamento de formulário;
* controle de estado;
* validações;
* cálculos derivados;
* atualização de campos;
* controle reativo.

---

## Responsabilidades Permitidas

Pode:

* controlar formData;
* atualizar nested objects;
* executar cálculos automáticos;
* validar entradas;
* preparar payloads.

---

## Responsabilidades Proibidas

Não deve:

* renderizar interface;
* persistir diretamente no backend;
* executar navegação.

---

# useModuloActions

## Responsabilidade

Responsável por:

* persistência;
* ações críticas;
* submissão;
* integração com services;
* controle de status;
* sincronização.

---

## Responsabilidades Permitidas

Pode:

* salvar registros;
* atualizar entidades;
* executar sincronização;
* controlar loading;
* processar submissões;
* executar regras de aprovação.

---

## Responsabilidades Proibidas

Não deve:

* renderizar interface;
* controlar layout;
* conter lógica visual.

---

# Benefícios Arquiteturais

A separação dos hooks proporciona:

* baixo acoplamento;
* maior reutilização;
* testes simplificados;
* manutenção facilitada;
* melhor previsibilidade;
* refatoração incremental segura.

---

# Exemplo Arquitetural

```txt id="jlwm0m"
EnsaioMRAF.jsx
├── useEnsaioMRAFData()
├── useEnsaioMRAFForm()
└── useEnsaioMRAFActions()
```

---

# Diretrizes de Complexidade

Hooks devem:

* possuir responsabilidade clara;
* evitar múltiplos contextos de domínio;
* permanecer previsíveis;
* evitar efeitos colaterais excessivos.

---

# Diretrizes de Performance

Preferencialmente utilizar:

* useMemo;
* useCallback;
* derivação controlada;
* atualização imutável.

Sempre evitando:

* renders desnecessários;
* dependências instáveis;
* efeitos excessivos.

---

# Diretrizes de Evolução

Quando hooks crescerem excessivamente:

* extrair lógica para utils;
* dividir hooks por responsabilidade;
* criar hooks especializados;
* separar cálculos puros.

---

# Objetivo Arquitetural Final

A arquitetura baseada em hooks busca transformar pages em:

* orquestradoras leves;
* altamente legíveis;
* previsíveis;
* desacopladas da lógica de domínio.
