# Onboarding Técnico

## Objetivo

Este documento tem como objetivo auxiliar novos desenvolvedores a compreender rapidamente:

* arquitetura;
* organização;
* padrões;
* fluxo de desenvolvimento;
* convenções do projeto.

---

# Visão Geral da Arquitetura

O sistema segue majoritariamente a arquitetura:

```txt id="3w5hyz"
Page
↓
Hooks
↓
Services
↓
Persistência/Base44
```

Com forte separação entre:

* interface;
* regras de negócio;
* infraestrutura;
* persistência;
* sincronização offline.

---

# Estrutura Principal do Projeto

Estrutura simplificada:

```txt id="jlwm0x"
src/
├── components/
├── hooks/
├── pages/
├── services/
├── utils/
├── validations/
└── tests/

base44/
├── entities/
└── functions/

docs/
├── arquitetura/
├── negocio/
├── governanca/
├── offline/
└── testes/
```

---

# Filosofia Arquitetural

O projeto prioriza:

* desacoplamento;
* componentização;
* reutilização;
* separação de responsabilidades;
* previsibilidade arquitetural;
* evolução incremental segura.

---

# Funcionamento Geral

Fluxo arquitetural esperado:

```txt id="jlwm7w"
Page
↓
Hook
↓
Service
↓
Base44 / Persistência
```

---

# Responsabilidade das Pages

Pages devem:

* renderizar;
* compor componentes;
* integrar hooks;
* controlar navegação.

Pages NÃO devem:

* persistir diretamente;
* acessar Base44;
* conter lógica pesada;
* implementar sincronização.

---

# Responsabilidade dos Hooks

Hooks representam a principal camada de lógica da aplicação.

Padrão preferencial:

```txt id="jlwm1u"
useModuloData
useModuloForm
useModuloActions
```

---

# Responsabilidade dos Services

Services representam a camada de infraestrutura.

Responsáveis por:

* persistência;
* uploads;
* sincronização;
* cache;
* integração externa;
* acesso Base44.

---

# Arquitetura Offline

O sistema possui infraestrutura offline baseada em:

* persistência local;
* fila offline;
* sincronização posterior;
* retry automático.

Componentes principais:

```txt id="jlwm9s"
offlineStorageService
syncService
useOfflineDetection
useOfflineSync
```

---

# Estratégia de Componentização

A interface deve preferencialmente utilizar:

* componentes reutilizáveis;
* composição;
* desacoplamento visual;
* granularidade controlada.

---

# Estratégia de Testes

O sistema possui testes organizados por domínio:

```txt id="jlwm3u"
tests/
├── components/
├── hooks/
├── integration/
├── services/
└── utils/
```

Toda refatoração significativa deve considerar impacto nos testes automatizados.

---

# Convenções Principais

## Pages

```txt id="jlwm6x"
PascalCase
```

---

## Hooks

```txt id="jlwm4n"
use + Nome
```

---

## Services

```txt id="jlwm8w"
camelCase + Service
```

---

## Components

```txt id="分快三5"
PascalCase
```

---

# Fluxo Recomendado de Desenvolvimento

## Para novas funcionalidades

Preferencialmente:

```txt id="分快三6"
Page
↓
Hooks
↓
Services
↓
Persistência
↓
Testes
```

---

# Fluxo Recomendado de Refatoração

Preferencialmente:

```txt id="分快三7"
Análise
↓
Extração incremental
↓
Atualização de testes
↓
Validação de regressão
```

---

# Diretrizes Importantes

Antes de criar novas implementações:

* verificar reutilização existente;
* analisar padrões atuais;
* seguir convenções arquiteturais;
* preservar desacoplamento.

---

# ADRs Importantes

O projeto possui ADRs relevantes documentando:

* pages orquestradoras;
* arquitetura baseada em hooks;
* separação de services;
* arquitetura offline;
* testes obrigatórios em refatorações.

---

# Leitura Recomendada Inicial

Novos desenvolvedores devem priorizar leitura de:

```txt id="分快三8"
1. padroes-arquiteturais.md
2. convencoes-de-codigo.md
3. arquitetura-offline.md
4. estrategia-de-testes.md
5. ADRs
```

---

# Objetivo Arquitetural do Projeto

O projeto busca:

* escalabilidade;
* desacoplamento;
* previsibilidade;
* manutenção simplificada;
* robustez operacional;
* evolução sustentável.

---

# Observação Final

A consistência arquitetural do sistema possui prioridade sobre preferências individuais de implementação.
