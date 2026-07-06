# Padrão de Services

## Objetivo

Os services representam a camada de infraestrutura e acesso a dados do sistema.

Seu objetivo é centralizar:

* persistência;
* comunicação externa;
* integração com Base44;
* sincronização;
* uploads;
* cache;
* operações offline.

---

# Responsabilidades Arquiteturais

Services devem funcionar como:

* camada de infraestrutura;
* abstração de persistência;
* ponto central de integração;
* camada de comunicação externa.

---

# Responsabilidades Permitidas

Services podem:

* acessar Base44;
* persistir entidades;
* atualizar registros;
* realizar uploads;
* executar sincronização;
* acessar armazenamento local;
* controlar cache;
* integrar APIs externas;
* tratar erros de infraestrutura.

---

# Responsabilidades Proibidas

Services NÃO devem:

* renderizar interface;
* controlar navegação;
* manipular layout;
* conter lógica visual;
* controlar estados de componentes React;
* possuir acoplamento direto com pages.

---

# Arquitetura Esperada

O fluxo arquitetural esperado é:

```txt id="jlwm5h"
Page
↓
Hook
↓
Service
↓
Base44 / Persistência / API
```

---

# Padrão de Organização

Preferencialmente os services devem ser separados por domínio.

Exemplos identificados:

```txt id="jlwm1k"
ensaiosService.js
checklistsService.js
dashboardService.js
diarioObraService.js
faixasService.js
granuMisturaService.js
obrasService.js
produtividadeService.js
projectsService.js
recordsService.js
regionaisService.js
relatorioContextService.js
solicitacoesService.js
usuariosService.js
certificacaoUsinaService.js
```

---

# Services de Infraestrutura

O sistema possui services especializados de infraestrutura:

```txt id="jlwm9u"
offlineStorageService.js
syncService.js
uploadService.js
```

Esses services representam infraestrutura transversal do sistema.

---

# offlineStorageService

## Responsabilidade

Responsável por:

* persistência local;
* cache offline;
* armazenamento temporário;
* gerenciamento offline.

---

# syncService

## Responsabilidade

Responsável por:

* sincronização de dados;
* fila offline;
* retry de operações;
* reconciliação de persistência.

---

# uploadService

## Responsabilidade

Responsável por:

* upload de arquivos;
* upload de imagens;
* gerenciamento de anexos;
* controle de falhas de upload.

---

# Diretrizes de Acoplamento

Services devem possuir:

* baixo acoplamento;
* alta reutilização;
* independência visual;
* independência de componentes React.

---

# Diretrizes de Reutilização

Sempre que possível:

* centralizar persistência;
* evitar duplicação de chamadas;
* reutilizar integrações;
* consolidar acesso a entidades.

---

# Diretrizes de Complexidade

Quando um service crescer excessivamente:

* separar por domínio;
* extrair helpers;
* criar subservices;
* dividir infraestrutura e negócio.

---

# Tratamento de Erros

Services devem preferencialmente centralizar:

* tratamento de falhas;
* logs técnicos;
* retry;
* fallback offline;
* padronização de erros.

---

# Objetivos Arquiteturais

A camada de services busca:

* isolamento da persistência;
* desacoplamento da interface;
* simplificação da manutenção;
* maior previsibilidade;
* melhor testabilidade;
* suporte à evolução offline.

---

# Benefícios Arquiteturais

A separação via services proporciona:

* centralização da infraestrutura;
* reutilização de integrações;
* redução de duplicação;
* manutenção simplificada;
* evolução incremental segura.

---

# Diretriz Oficial

Nenhuma page deve acessar Base44 diretamente.

Toda persistência deve ocorrer preferencialmente através de:

* hooks;
* services;
* abstrações centralizadas.