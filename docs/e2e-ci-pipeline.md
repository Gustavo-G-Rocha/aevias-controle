# Pipeline de CI para Testes E2E

## Configuração do GitHub Actions

> **Nota:** O arquivo `.github/workflows/e2e.yml` não pode ser criado diretamente pelo
> editor por restrição de permissões do GitHub App. Crie-o manualmente no repositório
> com o conteúdo abaixo, ou peça ao admin do workspace para adicioná-lo.

```yaml
# .github/workflows/e2e.yml
name: E2E — Fluxo Crítico

on:
  pull_request:
    paths:
      - 'src/**'
      - 'e2e/**'
      - 'base44/**'
      - 'playwright.config.js'
      - 'package.json'

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install chromium --with-deps
      - run: npm run test:e2e:ci
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-traces
          path: |
            test-results/
            playwright-report/
          retention-days: 7
```

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run test:e2e` | Roda Playwright local (reporter: list) |
| `npm run test:e2e:ci` | Instala browsers + roda Playwright (reporter: line) |

## Estratégia anti-flakiness

- **1 browser** (chromium) — consistência e velocidade
- **1 worker** — isolamento total entre testes (store em memória resetado)
- **retries: 0** em CI — flakiness deve ser investigada, não mascarada
- **Mock API determinístico** — zero dependência de rede/backend real
- **Esperas por texto/elemento** — nunca `sleep` fixo
- **Trace on-first-retry** — debug local com `--retries`

## Critério de quando rodar

- **PRs** que tocam `src/`, `e2e/`, `base44/`, ou config do Playwright
- **Não roda em push direto** para main — não bloqueia commits intermediários
- **Timeout de 10min** no job — falha rápido se algo travar

## Fluxo coberto

```
Iniciar Ensaio → Preencher Dados → Salvar Progresso → Finalizar →
Aprovar (gestor) → Abrir Relatório → Gerar PDF → Validar Integridade
```

## Teste de regressão do próprio teste

O segundo teste (`regressão: remover o mock de criar ensaio faz o teste falhar claramente`)
quebra proposicialmente o endpoint de salvamento e valida que o teste E2E
detecta a falha — provando que o teste é sensível a regressões.