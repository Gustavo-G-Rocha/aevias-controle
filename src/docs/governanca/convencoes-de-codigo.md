# Convenções de Código

## Objetivo

Este documento define as convenções oficiais de desenvolvimento do projeto, visando:

* padronização;
* previsibilidade;
* legibilidade;
* manutenção simplificada;
* escalabilidade;
* redução de inconsistências.

---

# Filosofia Geral

O código do sistema deve priorizar:

* clareza;
* separação de responsabilidades;
* previsibilidade;
* desacoplamento;
* consistência arquitetural.

---

# Convenções de Naming

## Pages

Pages devem utilizar:

```txt
PascalCase
```

Exemplos:

```txt
Dashboard.jsx
EnsaioMRAF.jsx
ChecklistMRAF.jsx
```

---

# Hooks

Hooks devem obrigatoriamente iniciar com:

```txt
use
```

Preferencialmente utilizando:

```txt
useModuloData
useModuloForm
useModuloActions
```

Exemplos:

```txt
useEnsaioMRAFForm
useOfflineSync
useDashboardData
```

---

# Services

Services devem utilizar o padrão:

```txt
camelCase + Service
```

Exemplos:

```txt
ensaiosService.js
syncService.js
uploadService.js
```

---

# Utils

Utils devem representar:

* lógica pura;
* helpers reutilizáveis;
* cálculos;
* transformações.

Padrão recomendado:

```txt
moduloUtils.js
```

Exemplos:

```txt
ensaioMRAFUtils.js
dashboardUtils.js
```

---

# Components

Componentes devem utilizar:

```txt
PascalCase
```

Exemplos:

```txt
EnsaioMRAFHeader
SidebarMenu
ProjectCard
```

---

# Estrutura de Arquivos

Arquivos devem preferencialmente possuir:

* responsabilidade única;
* baixo acoplamento;
* alta legibilidade;
* previsibilidade estrutural.

---

# Estrutura de Pages

Pages devem preferencialmente:

* orquestrar;
* renderizar;
* integrar hooks;
* compor componentes.

Pages NÃO devem:

* persistir diretamente;
* conter regras complexas;
* acessar infraestrutura.

---

# Estrutura de Hooks

Hooks devem:

* centralizar lógica;
* controlar estado;
* abstrair comportamento;
* integrar services.

---

# Estrutura de Services

Services devem:

* centralizar persistência;
* abstrair infraestrutura;
* integrar Base44;
* controlar sincronização;
* tratar uploads.

---

# Estrutura de Components

Componentes devem:

* focar em interface;
* evitar lógica pesada;
* receber props previsíveis;
* possuir composição clara.

---

# Convenções de Complexidade

Sempre que um arquivo crescer excessivamente deve-se avaliar:

* extração de hooks;
* criação de subcomponentes;
* separação de services;
* extração de utils.

---

# Convenções de Responsabilidade

Cada módulo deve possuir responsabilidade clara e previsível.

Evitar:

* arquivos genéricos excessivos;
* lógica compartilhada sem contexto;
* mistura de infraestrutura e interface.

---

# Convenções de Reutilização

Antes de criar novas implementações deve-se avaliar:

* reutilização existente;
* abstrações atuais;
* alinhamento arquitetural.

---

# Convenções de Imports

Preferencialmente:

* imports organizados;
* remoção de imports não utilizados;
* dependências explícitas;
* baixo acoplamento entre módulos.

---

# Convenções de Testes

Toda alteração estrutural relevante deve considerar:

* atualização de testes;
* cobertura mínima;
* validação de regressão.

---

# Convenções Offline

Toda lógica offline deve preferencialmente permanecer centralizada em:

* services;
* hooks especializados;
* infraestrutura dedicada.

---

# Convenções de Evolução

Novos módulos devem seguir preferencialmente:

```txt
Page
↓
Hooks
↓
Services
↓
Persistência
```

---

# Benefícios Arquiteturais

As convenções proporcionam:

* previsibilidade;
* manutenção simplificada;
* onboarding facilitado;
* redução de inconsistências;
* evolução sustentável.

---

# Relação com a Governança

Estas convenções complementam diretamente:

* ADRs;
* padrões arquiteturais;
* estratégia de testes;
* componentização;
* arquitetura offline.

---

# Diretriz Oficial

Consistência arquitetural possui prioridade sobre preferências individuais de implementação.
