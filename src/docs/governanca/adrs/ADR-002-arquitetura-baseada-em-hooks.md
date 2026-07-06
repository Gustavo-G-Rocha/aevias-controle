# ADR-002 — Arquitetura Baseada em Hooks

## Status

Aceito

---

# Contexto

O crescimento do sistema aumentou significativamente a complexidade das pages React.

A presença de:

* regras de negócio;
* gerenciamento de estado;
* persistência;
* cálculos;
* validações;
* sincronização;

diretamente nas pages gerava:

* alto acoplamento;
* baixa reutilização;
* dificuldade de testes;
* baixa previsibilidade;
* pages extensas.

---

# Decisão

Adotar hooks customizados como principal camada de lógica reutilizável da aplicação.

Os hooks passam a concentrar:

* gerenciamento de estado;
* regras de negócio;
* validações;
* cálculos;
* orquestração;
* transformação de dados;
* integração com services.

---

# Arquitetura Adotada

A arquitetura adotada segue preferencialmente:

```txt id="jlwm6s"
useModuloData
useModuloForm
useModuloActions
```

---

# Responsabilidades

## useModuloData

Responsável por:

* carregamento;
* derivação de dados;
* consultas;
* integração inicial;
* sincronização de estado.

---

## useModuloForm

Responsável por:

* controle de formulário;
* estado;
* cálculos;
* validações;
* transformação de payloads.

---

## useModuloActions

Responsável por:

* persistência;
* submissão;
* sincronização;
* ações críticas;
* integração com services.

---

# Objetivos Arquiteturais

A decisão busca:

* desacoplamento;
* reutilização;
* testabilidade;
* escalabilidade;
* previsibilidade;
* manutenção simplificada.

---

# Consequências Positivas

A decisão proporciona:

* pages menores;
* melhor separação de responsabilidades;
* refatoração incremental segura;
* maior reutilização de lógica;
* melhor isolamento de regras;
* testes mais simples.

---

# Consequências Negativas

A arquitetura pode gerar:

* aumento da quantidade de arquivos;
* maior granularidade estrutural;
* necessidade de forte padronização;
* curva de aprendizado arquitetural.

---

# Impacto Arquitetural

A decisão impacta diretamente:

* pages;
* services;
* testes;
* componentização;
* fluxo de dados;
* estratégia offline.

---

# Diretrizes Oficiais

Hooks devem preferencialmente:

* possuir responsabilidade única;
* evitar lógica visual;
* evitar renderização;
* centralizar regras de domínio;
* abstrair persistência da interface.

---

# Diretriz de Evolução

Sempre que pages crescerem excessivamente, a lógica deve preferencialmente ser extraída para:

* hooks;
* utils;
* services especializados.

---

# Evolução: Hooks Base Compartilhados

Quando múltiplos hooks de formulário compartilham lógica comum de carregamento de dados (usuário, obras, regionais, projetos), essa lógica foi extraída para um hook base reutilizável (`useFormDataLoader`). Os hooks derivados (`useEnsaioForm`, `useChecklistForm`) delegam ao base o carregamento compartilhado, mantendo suas particularidades.

---

# Motivação Principal

A decisão foi tomada visando:

* crescimento sustentável do sistema;
* evolução incremental;
* redução de regressões;
* maior previsibilidade arquitetural;
* simplificação de manutenção futura.