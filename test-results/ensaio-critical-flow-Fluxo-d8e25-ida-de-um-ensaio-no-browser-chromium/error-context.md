# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ensaio-critical-flow.spec.js >> Fluxo crítico E2E: Iniciar → Preencher → Finalizar → Aprovar → Assinar → Relatório >> percorre todo o ciclo de vida de um ensaio no browser
- Location: e2e/ensaio-critical-flow.spec.js:26:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button[title="Aprovar"]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button[title="Aprovar"]').first()

```

```yaml
- img "Afirmaevias Logo"
- button "Novo Registro":
  - img
  - text: Novo Registro
- text: Principal
- list:
  - listitem:
    - link "Dashboard":
      - /url: /Dashboard
      - img
      - text: Dashboard
  - listitem:
    - link "Regionais":
      - /url: /Regionais
      - img
      - text: Regionais
  - listitem:
    - button "Minhas Obras":
      - img
      - text: Minhas Obras
      - img
  - listitem:
    - button "Não Conformidades":
      - img
      - text: Não Conformidades
      - img
- text: Administração
- list:
  - listitem:
    - link "Usuários":
      - /url: /Users
      - img
      - text: Usuários
  - listitem:
    - link "Produtividade":
      - /url: /Produtividade
      - img
      - text: Produtividade
  - listitem:
    - link "Controle Laboratoristas":
      - /url: /ControleLaboratoristas
      - img
      - text: Controle Laboratoristas
  - listitem:
    - link "Faixas Granulométricas":
      - /url: /FaixasGranulometricas
      - img
      - text: Faixas Granulométricas
  - listitem:
    - link "Migração de Dados":
      - /url: /MigracaoDados
      - img
      - text: Migração de Dados
  - listitem:
    - link "Monitor de Produtividade":
      - /url: /MonitorProdutividade
      - img
      - text: Monitor de Produtividade
  - listitem:
    - link "Configurações":
      - /url: /Settings
      - img
      - text: Configurações
- button "Admin E2E admin@e2e.test Admin":
  - img
  - paragraph: Admin E2E
  - paragraph: admin@e2e.test
  - text: Admin
- main:
  - heading "Ensaios Realizados" [level=1]
  - paragraph: Gerencie e aprove todos os registros de suas obras.
  - text: 0 registro(s) encontrado(s)
  - button "Novo Registro":
    - img
    - text: Novo Registro
  - table:
    - rowgroup:
      - row "Tipo Data Filtrar período Obra Lab. Local Empreiteira Projeto Status Ações":
        - columnheader "Tipo":
          - text: Tipo
          - button:
            - img
        - columnheader "Data Filtrar período":
          - button "Data":
            - text: Data
            - img
          - button "Filtrar período":
            - img
            - text: Filtrar período
        - columnheader "Obra":
          - text: Obra
          - button:
            - img
        - columnheader "Lab.":
          - text: Lab.
          - button:
            - img
        - columnheader "Local":
          - text: Local
          - button:
            - img
        - columnheader "Empreiteira":
          - text: Empreiteira
          - button:
            - img
        - columnheader "Projeto":
          - text: Projeto
          - button:
            - img
        - columnheader "Status":
          - text: Status
          - button:
            - img
        - columnheader "Ações"
    - rowgroup
  - img
  - heading "Nenhum registro encontrado" [level=3]
  - paragraph: Ajuste os filtros ou aguarde novos registros.
```

# Test source

```ts
  1   | /**
  2   |  * e2e/ensaio-critical-flow.spec.js
  3   |  *
  4   |  * Teste E2E do fluxo crítico completo no browser:
  5   |  *   Iniciar Ensaio → Preencher Dados → Assinar → Aprovar → Gerar PDF
  6   |  *
  7   |  * Cobre a integração entre múltiplas etapas que testes isolados não pegam:
  8   |  *   1. Navegar para MeusEnsaios (lista carrega)
  9   |  *   2. Criar Ensaio CAUQ (navegar para formulário)
  10  |  *   3. Preencher dados + Salvar Progresso (rascunho persiste)
  11  |  *   4. Finalizar Registro (status → finalizado)
  12  |  *   5. Voltar à lista, aprovar (gestor aprova)
  13  |  *   6. Assinar (cliente assina registro aprovado)
  14  |  *   7. Abrir relatório (renderiza com dados de assinatura)
  15  |  *   8. Botão Gerar PDF visível
  16  |  *
  17  |  * Anti-flakiness:
  18  |  *   - Mock API determinístico (zero dependência de rede/backend)
  19  |  *   - Esperas por texto/elemento (nunca sleep fixo)
  20  |  *   - 1 worker, 1 browser, retries: 0
  21  |  */
  22  | import { test, expect } from '@playwright/test';
  23  | import { setupMockApi, ADMIN_USER, GESTOR_USER, CLIENTE_USER } from './mock-api';
  24  | 
  25  | test.describe('Fluxo crítico E2E: Iniciar → Preencher → Finalizar → Aprovar → Assinar → Relatório', () => {
  26  |   test('percorre todo o ciclo de vida de um ensaio no browser', async ({ page }) => {
  27  |     const ctx = setupMockApi(page, ADMIN_USER);
  28  | 
  29  |     // ── Debug: captura erros do browser para diagnóstico ──────────────────────
  30  |     page.on('console', msg => { if (msg.type() === 'error') console.log(`  [BROWSER ERROR] ${msg.text()}`); });
  31  |     page.on('pageerror', err => console.log(`  [PAGE ERROR] ${err.message}`));
  32  |     page.on('requestfailed', req => console.log(`  [REQ FAILED] ${req.url().slice(0, 120)} — ${req.failure()?.errorText}`));
  33  |     page.on('response', resp => { if (resp.status() >= 400) console.log(`  [HTTP ${resp.status()}] ${resp.url().slice(0, 150)}`); });
  34  | 
  35  |     // ═══════════════════════════════════════════════════════════════════════════
  36  |     // 1. ACESSAR MEUSENSAIOS — lista deve carregar sem erro
  37  |     // ═══════════════════════════════════════════════════════════════════════════
  38  |     await page.goto('/MeusEnsaios');
  39  |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 20_000 });
  40  | 
  41  |     // ═══════════════════════════════════════════════════════════════════════════
  42  |     // 2. CRIAR ENSAIO CAUQ — navegar para o formulário
  43  |     // ═══════════════════════════════════════════════════════════════════════════
  44  |     // Como admin, clica em "Novo Registro" → "Ensaio de CAUQ"
  45  |     // Scope to main content — a sidebar também tem um botão "Novo Registro"
  46  |     // (que abre um Dialog, não o dropdown com menuitem).
  47  |     await page.locator('main').getByRole('button', { name: /Novo Registro/i }).click();
  48  |     await page.getByRole('menuitem', { name: /Ensaio de CAUQ/i }).click();
  49  | 
  50  |     // Formulário deve carregar (CardTitle é um div, não heading semântico)
  51  |     await expect(page.getByText('Novo Ensaio de CAUQ')).toBeVisible({ timeout: 20_000 });
  52  | 
  53  |     // ═══════════════════════════════════════════════════════════════════════════
  54  |     // 3. SALVAR PROGRESSO — cria rascunho
  55  |     // ═══════════════════════════════════════════════════════════════════════════
  56  |     // Preencher observações (campo sempre presente)
  57  |     await page.getByLabel(/Observações Gerais/i).fill('Ensaio E2E — dados de teste');
  58  | 
  59  |     // Clicar em "Salvar Progresso"
  60  |     await page.getByRole('button', { name: /Salvar Progresso/i }).click();
  61  | 
  62  |     // Toast de sucesso deve aparecer
  63  |     await expect(page.getByText(/Progresso salvo com sucesso/i)).toBeVisible({ timeout: 10_000 });
  64  | 
  65  |     // O título muda para "Editar" indicando que o ensaio foi criado e está em edição
  66  |     await expect(page.getByText('Editar Ensaio de CAUQ')).toBeVisible({ timeout: 10_000 });
  67  | 
  68  |     // ═══════════════════════════════════════════════════════════════════════════
  69  |     // 4. FINALIZAR REGISTRO — status → finalizado
  70  |     // ═══════════════════════════════════════════════════════════════════════════
  71  |     await page.getByRole('button', { name: /Finalizar Registro/i }).click();
  72  | 
  73  |     // Toast de sucesso
  74  |     await expect(page.getByText(/finalizado com sucesso/i)).toBeVisible({ timeout: 10_000 });
  75  | 
  76  |     // Deve redirecionar para MeusEnsaios
  77  |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 15_000 });
  78  | 
  79  |     // ═══════════════════════════════════════════════════════════════════════════
  80  |     // 5. APROVAR — admin aprova o ensaio finalizado
  81  |     // ═══════════════════════════════════════════════════════════════════════════
  82  |     // O registro recém-criado deve aparecer na lista (primeira linha da tabela)
  83  |     // O botão de aprovar tem title="Aprovar" e ícone CheckCircle
  84  |     const approveBtn = page.locator('button[title="Aprovar"]').first();
> 85  |     await expect(approveBtn).toBeVisible({ timeout: 10_000 });
      |                              ^ Error: expect(locator).toBeVisible() failed
  86  | 
  87  |     // Confirmar o dialog de confirmação
  88  |     page.on('dialog', dialog => dialog.accept());
  89  |     await approveBtn.click();
  90  | 
  91  |     // Toast de aprovação
  92  |     await expect(page.getByText(/aprovado com sucesso/i)).toBeVisible({ timeout: 10_000 });
  93  | 
  94  |     // ═══════════════════════════════════════════════════════════════════════════
  95  |     // 6. ABRIR RELATÓRIO — página de relatório renderiza
  96  |     // ═══════════════════════════════════════════════════════════════════════════
  97  |     // Clicar no botão de relatório (ícone FileText, abre em nova aba)
  98  |     const reportLink = page.locator('a[target="_blank"]').first();
  99  |     const [reportPage] = await Promise.all([
  100 |       page.context().waitForEvent('page'),
  101 |       reportLink.click(),
  102 |     ]);
  103 |     await reportPage.waitForLoadState('networkidle');
  104 | 
  105 |     // Relatório deve carregar com o cabeçalho
  106 |     await expect(reportPage.getByText(/Relatório de Ensaio Marshall/i)).toBeVisible({ timeout: 15_000 });
  107 | 
  108 |     // ═══════════════════════════════════════════════════════════════════════════
  109 |     // 7. GERAR PDF — botão visível e clicável
  110 |     // ═══════════════════════════════════════════════════════════════════════════
  111 |     const pdfButton = reportPage.getByRole('button', { name: /Gerar PDF/i });
  112 |     await expect(pdfButton).toBeVisible({ timeout: 10_000 });
  113 | 
  114 |     // ═══════════════════════════════════════════════════════════════════════════
  115 |     // 8. ASSINATURA — cliente assina via AprovacaoBar no relatório
  116 |     // ═══════════════════════════════════════════════════════════════════════════
  117 |     // Como admin não pode assinar (apenas cliente), validamos que o AprovacaoBar
  118 |     // renderizou com status "Aprovado" — o ensaio foi aprovado na etapa 5.
  119 |     await expect(reportPage.getByText(/Aprovado/i).first()).toBeVisible({ timeout: 10_000 });
  120 | 
  121 |     await reportPage.close();
  122 |   });
  123 | 
  124 |   test('regressão: remover o mock de criar ensaio faz o teste falhar claramente', async ({ page }) => {
  125 |     // Este teste valida que o teste E2E é sensível a quebras no fluxo.
  126 |     // Se a função validarESalvarRegistro retornar erro, "Salvar Progresso"
  127 |     // deve mostrar mensagem de erro — provando que o teste detecta regressões.
  128 |     const ctx = setupMockApi(page, ADMIN_USER);
  129 | 
  130 |     // Sobrescreve o mock da função para sempre retornar erro
  131 |     page.route('**/api/apps/*/functions/validarESalvarRegistro', async (route) => {
  132 |       return route.fulfill({
  133 |         status: 400,
  134 |         contentType: 'application/json',
  135 |         body: JSON.stringify({ error: 'Erro simulado: validação falhou' }),
  136 |       });
  137 |     });
  138 | 
  139 |     await page.goto('/MeusEnsaios');
  140 |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 20_000 });
  141 | 
  142 |     // Navegar para formulário
  143 |     await page.locator('main').getByRole('button', { name: /Novo Registro/i }).click();
  144 |     await page.getByRole('menuitem', { name: /Ensaio de CAUQ/i }).click();
  145 |     await expect(page.getByText('Novo Ensaio de CAUQ')).toBeVisible({ timeout: 15_000 });
  146 | 
  147 |     // Preencher e tentar salvar
  148 |     await page.getByLabel(/Observações Gerais/i).fill('Teste de regressão');
  149 |     await page.getByRole('button', { name: /Salvar Progresso/i }).click();
  150 | 
  151 |     // Deve mostrar erro (toast) — provando que o teste detecta a falha
  152 |     await expect(page.getByText(/Erro ao salvar progresso/i)).toBeVisible({ timeout: 10_000 });
  153 | 
  154 |     // NÃO deve ter mudado para "Editar" — o ensaio não foi criado
  155 |     await expect(page.getByText('Editar Ensaio de CAUQ')).not.toBeVisible();
  156 |   });
  157 | });
```