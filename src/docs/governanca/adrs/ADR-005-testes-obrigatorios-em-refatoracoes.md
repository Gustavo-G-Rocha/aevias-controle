# ADR-005 — Testes Obrigatórios em Refatorações

## Status

Aceito

---

# Contexto

O sistema possui crescente complexidade arquitetural envolvendo:

* hooks customizados;
* persistência;
* sincronização offline;
* cálculos;
* regras de negócio;
* componentização;
* desacoplamento progressivo.

Refatorações estruturais sem cobertura adequada aumentam significativamente o risco de:

* regressões;
* quebra de comportamento;
* inconsistências;
* falhas operacionais;
* perda de previsibilidade arquitetural.

---

# Decisão

Toda refatoração significativa deve obrigatoriamente considerar:

* criação de testes;
* atualização de testes existentes;
* validação de regressão;
* preservação de comportamento.

---

# Escopo da Diretriz

A obrigatoriedade se aplica especialmente a alterações envolvendo:

* hooks;
* services;
* lógica de negócio;
* sincronização;
* persistência;
* cálculos;
* extração de componentes;
* refatorações arquiteturais.

---

# Diretriz Oficial

Nenhuma refatoração estrutural deve ser considerada concluída sem avaliação explícita de impacto nos testes automatizados.

---

# Estratégia Adotada

A estratégia preferencial consiste em:

```txt id="jlwm0t"
Refatoração
↓
Avaliação de impacto
↓
Criação/Atualização de testes
↓
Execução de regressão
↓
Validação final
```

---

# Objetivos Arquiteturais

A decisão busca:

* evolução incremental segura;
* redução de regressões;
* maior previsibilidade;
* manutenção sustentável;
* proteção arquitetural;
* segurança operacional.

---

# Áreas Prioritárias

Maior prioridade de cobertura para:

* hooks críticos;
* sincronização offline;
* persistência;
* services;
* cálculos;
* validações;
* fluxo operacional.

---

# Estratégia de Cobertura

Refatorações devem preferencialmente incluir:

* testes unitários;
* testes de hooks;
* testes de integração;
* testes de fluxo crítico.

---

# Consequências Positivas

A decisão proporciona:

* maior segurança em refatorações;
* redução de regressões;
* maior previsibilidade;
* desacoplamento sustentável;
* evolução arquitetural segura.

---

# Consequências Negativas

A decisão pode gerar:

* maior tempo inicial de desenvolvimento;
* aumento de esforço em mudanças estruturais;
* necessidade de manutenção contínua dos testes.

---

# Impacto Arquitetural

A decisão impacta diretamente:

* desenvolvimento;
* refatorações;
* revisão de código;
* manutenção;
* evolução arquitetural.

---

# Diretrizes de Implementação

Durante refatorações deve-se preferencialmente:

* preservar comportamento existente;
* validar fluxo operacional;
* evitar regressões silenciosas;
* manter previsibilidade do sistema.

---

# Relação com a Arquitetura

A decisão complementa diretamente:

* arquitetura baseada em hooks;
* separação de services;
* estratégia offline;
* componentização;
* desacoplamento progressivo.

---

# Motivação Principal

A decisão foi tomada visando:

* crescimento sustentável;
* proteção arquitetural;
* manutenção de longo prazo;
* evolução segura do sistema;
* estabilidade operacional.

---

# Observação Arquitetural

Testes automatizados são tratados como parte integrante da arquitetura do sistema e não apenas como etapa opcional de qualidade.
