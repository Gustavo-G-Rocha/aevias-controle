# Estrutura de Pastas da Aplicação

## Objetivo

Este documento descreve a organização estrutural do projeto, responsabilidades de cada diretório e padrões arquiteturais utilizados.

---

# Estrutura Geral

```txt id="30m2tb"
src/
├── api/
├── components/
├── constants/
├── docs/
├── hooks/
├── lib/
├── pages/
├── services/
├── tests/
└── utils/

base44/
├── entities/
└── functions/
```

---

# src/pages

Responsável pelas telas do sistema.

Características:

* Representam rotas da aplicação
* Devem possuir pouca lógica
* Funcionam como orquestradoras
* Consomem hooks e componentes

Responsabilidades:

* Renderização
* Navegação
* Organização visual
* Integração entre componentes

Exemplo arquitetural:

```txt id="e5z2np"
Página
↓
Hook
↓
Service
↓
Persistência
```

---

# src/components

Responsável pelos componentes reutilizáveis da interface.

Características:

* Reutilização
* Componentização
* Isolamento visual
* Baixo acoplamento

Tipos esperados:

* Inputs
* Cards
* Modais
* Tabelas
* Botões
* Layouts

---

# src/hooks

Responsável pela lógica reutilizável da aplicação.

Responsabilidades:

* Gerenciamento de estado
* Regras de negócio
* Processamento
* Validações
* Integração com services

Objetivo arquitetural:

Remover lógica complexa das páginas.

---

# src/services

Responsável pela camada de acesso a dados.

Responsabilidades:

* Comunicação com Base44
* Persistência
* Cache
* Uploads
* Sincronização
* Estratégia offline

Services identificados:

* certificacaoUsinaService.js
* checklistsService.js
* dashboardService.js
* diarioObraService.js
* ensaiosService.js
* faixasService.js
* granuMisturaService.js
* obrasService.js
* offlineStorageService.js
* produtividadeService.js
* projectsService.js
* recordsService.js
* regionaisService.js
* relatorioContextService.js
* solicitacoesService.js
* syncService.js
* uploadService.js
* usuariosService.js

---

# src/utils

Responsável por funções auxiliares reutilizáveis.

Exemplos:

* Formatação
* Conversões
* Helpers
* Cálculos utilitários

---

# src/constants

Responsável por constantes globais do sistema.

Exemplos:

* Enumerações
* Configurações
* Chaves
* Status
* Valores fixos

---

# src/lib

Responsável por infraestrutura transversal da aplicação.

Responsabilidades:

* Sessão do usuário (AuthContext)
* Cliente Base44 inicializado
* Query client (React Query)
* Configurações de layout
* Roteamento auxiliar

---

# src/tests

Responsável pelos testes automatizados.

Tipos esperados:

* Testes unitários
* Testes de hooks
* Testes de integração

Objetivos:

* Garantir estabilidade
* Reduzir regressões
* Validar regras críticas

---

# Validações

As validações centralizadas residem em `src/utils/` (ex: checklistValidation.js, ensaioValidation.js).

Responsabilidades:

* Schema validation
* Regras de formulário
* Sanitização de dados

---

# src/api

Responsável por integrações externas e abstrações de API.

Possíveis responsabilidades:

* Clientes HTTP
* Configuração de requests
* Interceptors
* Tokens

---

# base44/entities

Responsável pelas entidades persistidas no Base44.

Responsabilidades:

* Modelagem de dados
* Estrutura de persistência
* Representação das entidades do domínio

---

# base44/functions

Responsável pelas funções server-side do Base44.

Possíveis responsabilidades:

* Processamento server-side
* Regras críticas
* Automação
* Integrações

---

# Padrões Arquiteturais Identificados

O projeto demonstra:

* Forte separação de responsabilidades
* Arquitetura modular
* Componentização extensiva
* Uso intensivo de hooks
* Camada de services bem definida
* Estrutura preparada para escalabilidade

---

# Diretrizes Arquiteturais

## Pages

Devem conter o mínimo possível de lógica.

---

## Hooks

Devem concentrar:

* Estado
* Regras
* Orquestração

---

## Components

Devem ser reutilizáveis e desacoplados.

---

## Services

Devem centralizar persistência e comunicação externa.

---

# Benefícios da Estrutura Atual

* Escalabilidade
* Facilidade de manutenção
* Melhor organização
* Maior reutilização
* Melhor testabilidade
* Redução de acoplamento