# Fluxo de Dados da Aplicação

## Objetivo

Este documento descreve como os dados trafegam dentro do sistema, desde a interface do usuário até a persistência final.

---

# Arquitetura Geral

O sistema segue majoritariamente a arquitetura:

Interface → Hook → Service → Base44 → Persistência

---

# Fluxo Principal

## 1. Interface (Pages)

As páginas representam as telas do sistema.

Responsabilidades:

* Renderização
* Navegação
* Composição de componentes
* Interação com hooks

Exemplo:

```txt
Usuário preenche formulário
↓
Página captura evento
↓
Hook processa regra de negócio
```

---

## 2. Hooks

Os hooks concentram:

* Estado
* Validações
* Regras de negócio
* Orquestração
* Processamento de dados

Responsabilidades:

* Reduzir acoplamento das páginas
* Reutilização de lógica
* Centralização de comportamento

Exemplo:

```txt
Página
↓
useEnsaioMRAF()
↓
Valida dados
↓
Chama service
```

---

## 3. Services

Os services representam a camada de acesso a dados.

Responsabilidades:

* Comunicação com Base44
* Persistência
* Uploads
* Sincronização
* Cache

Services identificados:

* checklistsService.js
* dashboardService.js
* ensaiosService.js
* obrasService.js
* offlineStorageService.js
* projectsService.js
* recordsService.js
* regionaisService.js
* syncService.js
* uploadService.js
* usuariosService.js

---

# Fluxo de Persistência

## Fluxo Online

```txt
Usuário
↓
Página
↓
Hook
↓
Service
↓
Base44
↓
Banco/Persistência
```

---

# Estratégia Offline

Foram identificados indícios de suporte offline no sistema.

Arquivos relacionados:

* offlineStorageService.js
* syncService.js

Possíveis responsabilidades:

* Armazenamento local
* Cache de registros
* Sincronização posterior
* Fila de operações pendentes

Fluxo esperado:

```txt
Sem internet
↓
Dados armazenados localmente
↓
Fila de sincronização
↓
Internet retorna
↓
syncService envia dados
↓
Base44 atualiza persistência
```

---

# Uploads

O sistema possui uploadService.js.

Responsabilidades esperadas:

* Upload de imagens
* Upload de anexos
* Controle de falhas
* Integração com persistência

---

# Separação de Responsabilidades

## Pages

Responsáveis apenas por:

* Interface
* Navegação
* Composição visual

---

## Hooks

Responsáveis por:

* Estado
* Processamento
* Regras
* Orquestração

---

## Services

Responsáveis por:

* Persistência
* Comunicação externa
* Cache
* Sincronização

---

# Benefícios Arquiteturais

A arquitetura atual permite:

* Escalabilidade
* Reutilização
* Testabilidade
* Baixo acoplamento
* Melhor manutenção
* Evolução incremental

---

# Pontos Arquiteturais Identificados

## Pontos Fortes

* Forte componentização
* Separação de responsabilidades
* Estrutura modular
* Presença de camada de services
* Uso extensivo de hooks

## Possíveis Evoluções Futuras

* Padronização completa dos hooks
* Centralização de regras de domínio
* Ampliação da estratégia offline
* Cobertura total de testes automatizados
* Documentação automática de entidades
