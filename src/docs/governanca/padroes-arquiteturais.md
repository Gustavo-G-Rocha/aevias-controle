# Padrões Arquiteturais

## Objetivo

Este documento define os padrões arquiteturais oficiais do projeto, visando:

* padronização;
* previsibilidade;
* desacoplamento;
* escalabilidade;
* manutenção simplificada;
* redução de regressões.

---

# Arquitetura Base do Sistema

O sistema segue majoritariamente a arquitetura:

```txt id="jxgfvu"
Page
↓
Hook
↓
Service
↓
Base44
↓
Persistência
```

Separando claramente:

* interface;
* regras de negócio;
* persistência;
* infraestrutura.

---

# Padrão de Pages

## Objetivo

As pages representam as telas da aplicação.

Devem funcionar como:

* orquestradoras;
* pontos de composição;
* controladoras de fluxo visual.

---

# Responsabilidades Permitidas

Pages podem:

* renderizar componentes;
* organizar layout;
* controlar navegação;
* integrar hooks;
* controlar fluxo visual;
* disparar ações de interface.

---

# Responsabilidades Proibidas

Pages NÃO devem:

* persistir dados diretamente;
* executar cálculos complexos;
* conter regras de negócio extensas;
* acessar Base44 diretamente;
* implementar lógica offline;
* conter lógica pesada de formulário.

---

# Estrutura Esperada

Uma page deve seguir preferencialmente:

```txt id="4jlwm0"
Page
├── Hooks
├── Components
├── Actions
└── Utils
```

---

# Exemplo Arquitetural

```txt id="jlwm2q"
EnsaioMRAF.jsx
↓
useEnsaioMRAFForm()
↓
useEnsaioMRAFActions()
↓
ensaioMRAFUtils.js
↓
ensaiosService.js
```

---

# Objetivos Arquiteturais

A separação de responsabilidades busca:

* reduzir acoplamento;
* aumentar reutilização;
* melhorar testabilidade;
* facilitar manutenção;
* simplificar refatorações.

---

# Diretrizes de Complexidade

Pages devem permanecer:

* pequenas;
* legíveis;
* previsíveis;
* focadas em renderização.

Sempre que lógica crescer significativamente, ela deve ser extraída para:

* hooks;
* utils;
* services;
* componentes especializados.
