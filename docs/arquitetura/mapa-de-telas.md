# Mapa de Telas do Sistema

## Objetivo

Este documento descreve as principais telas e módulos do sistema, suas responsabilidades e integrações.

---

# Estrutura Geral

O sistema é dividido em módulos organizados por domínio de negócio.

Principais categorias identificadas:

* Checklists
* Ensaios
* Operacional
* Dashboard
* Gestão de Obras
* Controle Laboratorial

---

# Módulos Identificados

| Módulo                 | Objetivo                           | Tipo           |
| ---------------------- | ---------------------------------- | -------------- |
| Dashboard              | Visão geral operacional do sistema | Dashboard      |
| DiarioObra             | Registro operacional diário        | Operacional    |
| AcompanhamentoCarga    | Controle de cargas                 | Operacional    |
| AcompanhamentoUsinagem | Controle de usinagem               | Operacional    |
| ControleLaboratoristas | Gestão de laboratoristas           | Administrativo |

---

# Checklists

| Tela                   | Objetivo                      |
| ---------------------- | ----------------------------- |
| ChecklistAplicacao     | Controle de aplicação         |
| ChecklistConcretagem   | Controle de concretagem       |
| ChecklistMRAF          | Controle relacionado ao MRAF  |
| ChecklistReciclagem    | Controle de reciclagem        |
| ChecklistTerraplanagem | Controle de terraplanagem     |
| ChecklistUsina         | Controle operacional da usina |

---

# Ensaios

| Tela                          | Objetivo                      |
| ----------------------------- | ----------------------------- |
| EnsaioCAUQ                    | Registro de ensaio CAUQ       |
| EnsaioDensidade               | Registro de densidade         |
| EnsaioDensidadeInSitu         | Registro de densidade in situ |
| EnsaioGranulometriaIndividual | Registro granulométrico       |
| EnsaioMRAF                    | Registro de ensaio MRAF       |
| EnsaioManchaPendulo           | Registro de mancha/pêndulo    |

---

# Observações Arquiteturais

O projeto segue majoritariamente a arquitetura:

Página → Hook → Service → Base44

Os módulos apresentam forte separação entre:

* Interface
* Lógica
* Persistência
* Componentização

Também há indícios de:

* Estratégia offline
* Sincronização local
* Testes automatizados
* Refatoração para hooks reutilizáveis
