# ADR-004 — Arquitetura Offline

## Status

Aceito

---

# Contexto

O sistema possui operação em cenários com conectividade limitada ou instável.

A dependência total de conexão gerava riscos como:

* perda de dados;
* interrupção operacional;
* falhas de sincronização;
* impossibilidade de uso em campo;
* baixa resiliência operacional.

Além disso, o crescimento do sistema exigiu uma estratégia centralizada de:

* persistência local;
* sincronização;
* retry;
* gerenciamento offline.

---

# Decisão

Adotar uma arquitetura offline transversal baseada em:

* persistência local;
* fila offline;
* sincronização posterior;
* retry automático;
* desacoplamento entre interface e conectividade.

---

# Arquitetura Adotada

A arquitetura offline segue preferencialmente:

```txt id="jlwm1r"
Interface
↓
Hooks
↓
Services
↓
Persistência Local
↓
Offline Queue
↓
Sync Service
↓
Base44
```

---

# Componentes Arquiteturais

## offlineStorageService

Responsável por:

* armazenamento local;
* cache operacional;
* persistência offline;
* recuperação local de dados.

---

## syncService

Responsável por:

* sincronização;
* retry;
* reenvio;
* reconciliação de persistência;
* processamento da fila offline.

---

## useOfflineDetection

Responsável por:

* detectar conectividade;
* informar estado online/offline;
* adaptar comportamento da aplicação.

---

## useOfflineSync

Responsável por:

* controlar sincronização automática;
* monitorar fila offline;
* disparar sincronizações.

---

# Objetivos Arquiteturais

A decisão busca:

* continuidade operacional;
* resiliência;
* redução de perda de dados;
* desacoplamento da rede;
* suporte operacional em campo;
* melhor experiência do usuário.

---

# Estratégia de Persistência

Quando offline:

```txt id="jlwm5v"
Operação
↓
Persistência local
↓
Fila offline
↓
Aguardar sincronização
```

Quando conectividade retorna:

```txt id="jlwm2n"
Fila offline
↓
syncService
↓
Retry
↓
Persistência remota
```

---

# Estratégia de Sincronização

A sincronização deve preferencialmente:

* tolerar falhas;
* permitir retry;
* evitar duplicidade;
* preservar integridade;
* suportar sincronização parcial.

---

# Consequências Positivas

A decisão proporciona:

* operação offline;
* maior resiliência;
* redução de interrupções;
* melhor experiência em campo;
* menor dependência de conectividade;
* proteção contra perda de dados.

---

# Consequências Negativas

A arquitetura pode gerar:

* maior complexidade;
* necessidade de reconciliação;
* risco de conflitos;
* maior esforço de testes;
* maior complexidade de persistência.

---

# Impacto Arquitetural

A decisão impacta diretamente:

* services;
* hooks;
* persistência;
* uploads;
* sincronização;
* testes;
* fluxo operacional.

---

# Diretrizes Oficiais

A aplicação deve preferencialmente:

* operar parcialmente sem conectividade;
* desacoplar UI da rede;
* evitar perda de dados;
* suportar sincronização posterior.

---

# Diretrizes de Implementação

Persistência remota deve preferencialmente ocorrer através de:

* services centralizados;
* fila offline;
* sincronização controlada.

---

# Estratégia de Testes

A arquitetura offline exige cobertura específica para:

* sincronização;
* retry;
* falhas de rede;
* fila offline;
* recuperação de estado;
* persistência local.

---

# Motivação Principal

A decisão foi tomada visando:

* continuidade operacional;
* robustez arquitetural;
* operação em campo;
* evolução sustentável do sistema;
* maior confiabilidade operacional.

---

# Observação Arquitetural

O suporte offline é tratado como infraestrutura transversal do sistema e não como feature isolada.
