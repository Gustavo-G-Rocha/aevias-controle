# ADR-001 — Pages como Orquestradoras

## Status

Aceito

---

# Contexto

O sistema possuía tendência de crescimento de lógica diretamente nas pages React.

Isso gerava:

* alto acoplamento;
* baixa reutilização;
* dificuldade de testes;
* pages extensas;
* dificuldade de manutenção.

---

# Decisão

Adotar pages com responsabilidade primária de:

* renderização;
* composição;
* navegação;
* orquestração visual.

Toda lógica complexa deve preferencialmente ser extraída para:

* hooks;
* services;
* utils;
* componentes especializados.

---

# Arquitetura Adotada

```txt id="jlwm2e"
Page
↓
Hooks
↓
Services
↓
Persistência
```

---

# Consequências Positivas

A decisão proporciona:

* menor acoplamento;
* maior reutilização;
* melhor testabilidade;
* pages menores;
* refatoração incremental segura;
* previsibilidade arquitetural.

---

# Consequências Negativas

A arquitetura pode gerar:

* maior número de arquivos;
* maior granularidade estrutural;
* necessidade de padronização rigorosa.

---

# Impacto Arquitetural

A decisão impacta diretamente:

* pages;
* hooks;
* services;
* testes;
* componentização.

---

# Diretriz Oficial

Pages não devem:

* persistir diretamente;
* acessar Base44;
* executar regras complexas;
* conter cálculos pesados;
* concentrar lógica de domínio.

---

# Motivação Principal

A decisão foi tomada visando:

* escalabilidade;
* manutenção de longo prazo;
* desacoplamento progressivo;
* evolução segura da arquitetura.
