# Estratégia de Testes

## Objetivo

A estratégia de testes do projeto busca garantir:

* estabilidade;
* previsibilidade;
* redução de regressões;
* segurança em refatorações;
* validação de regras críticas;
* confiabilidade operacional.

---

# Estrutura de Testes

O projeto organiza os testes por domínio arquitetural.

Estrutura identificada:

```txt id="jlwm4t"
tests/
├── components/
├── hooks/
├── integration/
├── services/
└── utils/
```

---

# Filosofia Arquitetural

A estratégia de testes segue a separação de responsabilidades da aplicação.

Cada camada deve ser testada de forma isolada sempre que possível.

---

# Testes de Components

## Objetivo

Validar comportamento visual e interação de componentes.

---

## Responsabilidades

Os testes de componentes devem validar:

* renderização;
* comportamento visual;
* eventos;
* estados;
* interação do usuário;
* composição de props.

---

## Devem evitar

Testes de componentes NÃO devem:

* persistir dados reais;
* depender de infraestrutura externa;
* testar regras complexas de negócio;
* acoplar-se ao backend.

---

# Testes de Hooks

## Objetivo

Validar lógica reutilizável da aplicação.

---

## Responsabilidades

Os testes de hooks devem validar:

* gerenciamento de estado;
* cálculos;
* efeitos;
* regras de negócio;
* transformação de dados;
* comportamento reativo.

---

## Benefícios

Hooks testáveis proporcionam:

* refatoração segura;
* desacoplamento;
* previsibilidade;
* validação isolada da lógica.

---

# Testes de Services

## Objetivo

Validar infraestrutura e persistência.

---

## Responsabilidades

Os testes de services devem validar:

* persistência;
* sincronização;
* uploads;
* integração;
* tratamento de erros;
* fallback offline.

---

# Testes de Integração

## Objetivo

Validar comunicação entre módulos do sistema.

## Fluxos Críticos de Negócio

Os fluxos críticos de negócio (aprovação de ensaio, assinatura do cliente e
geração de relatório) possuem cobertura determinística em
`tests/integration/criticalFlows.test.js`, exercitando os serviços e utilitários
ponta-a-ponta contra um store em memória.

> **E2E em navegador (Playwright/Cypress):** adiado. Browser-E2E exige binários
> de navegador, um servidor da aplicação em execução e um backend descartável
> autenticado — pré-requisitos não disponíveis no ambiente atual de build/CI.
> A cobertura de fluxo roda no gate `test:run` e captura regressões nas regras
> críticas; quando houver ambiente CI com navegador + backend de teste, os
> mesmos três fluxos devem ser espelhados em specs Playwright.

---

## Responsabilidades

Os testes de integração devem validar:

* fluxo completo;
* integração entre hooks e services;
* sincronização;
* persistência;
* cenários operacionais reais.

---

# Testes de Utils

## Objetivo

Validar lógica pura reutilizável.

---

## Responsabilidades

Os testes de utils devem validar:

* cálculos;
* transformações;
* helpers;
* derivação de dados;
* regras puras.

---

# Estratégia Offline

A arquitetura offline deve possuir cobertura específica.

Cenários importantes:

* operação sem conexão;
* sincronização posterior;
* retry;
* fila offline;
* falha parcial;
* recuperação de estado.

---

# Estratégia de Refatoração

Toda refatoração significativa deve incluir:

* atualização de testes existentes;
* novos testes quando necessário;
* validação de regressão.

---

# Diretriz Oficial

Nenhuma refatoração estrutural deve ocorrer sem avaliação de impacto nos testes automatizados.

---

# Prioridades de Cobertura

Maior prioridade para:

* hooks críticos;
* services críticos;
* sincronização offline;
* persistência;
* cálculos;
* regras de negócio.

---

# Benefícios Arquiteturais

A estratégia de testes proporciona:

* evolução incremental segura;
* redução de regressões;
* maior previsibilidade;
* manutenção simplificada;
* confiança em refatorações.

---

# Diretrizes de Qualidade

Testes devem preferencialmente ser:

* pequenos;
* previsíveis;
* desacoplados;
* legíveis;
* determinísticos.

---

# Diretrizes de Mocking

Mocks devem ser utilizados para:

* infraestrutura externa;
* persistência;
* uploads;
* integrações;
* sincronização remota.

---

# Objetivo Arquitetural Final

A estratégia de testes busca permitir:

* evolução contínua do sistema;
* refatoração segura;
* desacoplamento progressivo;
* crescimento sustentável da arquitetura.