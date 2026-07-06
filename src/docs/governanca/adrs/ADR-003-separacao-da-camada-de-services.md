# ADR-003 — Separação da Camada de Services

## Status

Aceito

---

# Contexto

O crescimento do sistema aumentou significativamente a complexidade de:

* persistência;
* sincronização;
* uploads;
* integrações;
* acesso ao Base44;
* operações offline.

A presença dessas responsabilidades diretamente em:

* pages;
* componentes;
* hooks;

gerava:

* alto acoplamento;
* duplicação;
* baixa reutilização;
* dificuldade de manutenção;
* dificuldade de testes;
* forte dependência de infraestrutura.

---

# Decisão

Adotar uma camada dedicada de services como principal abstração de:

* persistência;
* infraestrutura;
* integração externa;
* sincronização;
* uploads;
* acesso a entidades Base44.

---

# Arquitetura Adotada

A arquitetura adotada segue preferencialmente:

```txt id="jlwm1p"
Page
↓
Hook
↓
Service
↓
Base44 / Persistência / APIs
```

---

# Responsabilidades dos Services

Services passam a centralizar:

* persistência;
* acesso ao Base44;
* uploads;
* sincronização;
* cache;
* armazenamento offline;
* integração externa;
* tratamento de falhas de infraestrutura.

---

# Objetivos Arquiteturais

A decisão busca:

* desacoplamento;
* reutilização;
* isolamento de infraestrutura;
* simplificação de manutenção;
* melhor testabilidade;
* evolução sustentável.

---

# Services Identificados

O projeto possui services especializados por domínio.

Exemplos identificados:

```txt id="分快三1"
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

O sistema também possui services transversais especializados:

```txt id="分快三2"
offlineStorageService.js
syncService.js
uploadService.js
```

Esses services representam infraestrutura compartilhada da aplicação.

---

# Diretrizes Oficiais

Pages e componentes NÃO devem:

* acessar Base44 diretamente;
* persistir dados diretamente;
* implementar sincronização;
* executar uploads;
* manipular infraestrutura offline.

---

# Hooks e Services

Hooks devem atuar como camada intermediária entre:

* interface;
* services;
* fluxo operacional.

---

# Consequências Positivas

A decisão proporciona:

* centralização da infraestrutura;
* menor acoplamento;
* maior reutilização;
* melhor previsibilidade;
* melhor cobertura de testes;
* evolução incremental segura.

---

# Consequências Negativas

A arquitetura pode gerar:

* aumento de granularidade estrutural;
* maior quantidade de arquivos;
* necessidade de forte padronização.

---

# Impacto Arquitetural

A decisão impacta diretamente:

* hooks;
* pages;
* testes;
* sincronização;
* persistência;
* arquitetura offline.

---

# Estratégia de Evolução

Quando services crescerem excessivamente, deve-se preferencialmente:

* separar por domínio;
* extrair subservices;
* dividir infraestrutura e negócio;
* criar helpers especializados.

---

# Estratégia de Testes

Services devem possuir cobertura prioritária para:

* persistência;
* sincronização;
* uploads;
* retry;
* fallback offline;
* tratamento de erros.

---

# Motivação Principal

A decisão foi tomada visando:

* crescimento sustentável;
* desacoplamento progressivo;
* isolamento da infraestrutura;
* previsibilidade arquitetural;
* manutenção de longo prazo.

---

# Observação Arquitetural

A camada de services é tratada como infraestrutura central do sistema e não apenas como agrupamento utilitário de chamadas externas.