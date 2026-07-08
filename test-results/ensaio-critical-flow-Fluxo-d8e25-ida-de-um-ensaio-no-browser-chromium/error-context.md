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

Locator: getByRole('heading', { name: /Novo Ensaio de CAUQ/i })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: /Novo Ensaio de CAUQ/i })

```

```yaml
- heading "Algo deu errado" [level=1]
- paragraph: Ocorreu um erro inesperado. A equipe técnica foi notificada automaticamente.
- button "Recarregar página"
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
  33  | 
  34  |     // ── Warmup: pré-carrega a página EnsaioCAUQ para o Vite otimizar deps ──────
  35  |     // O primeiro carregamento de uma página lazy pode causar 504 "Outdated
  36  |     // Optimize Dep" — o Vite descobre novas dependências, invalida o cache,
  37  |     // e recarrega a página. Tentamos até 3 vezes; após o reload do Vite,
  38  |     // as deps já estão otimizadas e a página carrega normalmente.
  39  |     for (let attempt = 0; attempt < 3; attempt++) {
  40  |       try {
  41  |         await page.goto('/EnsaioCAUQ');
  42  |         await page.waitForLoadState('networkidle').catch(() => {});
  43  |         // Se o formulário carregar (heading visível), warmup concluído
  44  |         const heading = page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i });
  45  |         const visible = await heading.isVisible({ timeout: 10_000 }).catch(() => false);
  46  |         if (visible) break;
  47  |       } catch { /* reload do Vite pode interromper o goto — tentar de novo */ }
  48  |       await page.waitForTimeout(2000);
  49  |     }
  50  | 
  51  |     // ═══════════════════════════════════════════════════════════════════════════
  52  |     // 1. ACESSAR MEUSENSAIOS — lista deve carregar sem erro
  53  |     // ═══════════════════════════════════════════════════════════════════════════
  54  |     await page.goto('/MeusEnsaios');
  55  |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 20_000 });
  56  | 
  57  |     // ═══════════════════════════════════════════════════════════════════════════
  58  |     // 2. CRIAR ENSAIO CAUQ — navegar para o formulário
  59  |     // ═══════════════════════════════════════════════════════════════════════════
  60  |     // Como admin, clica em "Novo Registro" → "Ensaio de CAUQ"
  61  |     // Scope to main content — a sidebar também tem um botão "Novo Registro"
  62  |     // (que abre um Dialog, não o dropdown com menuitem).
  63  |     await page.locator('main').getByRole('button', { name: /Novo Registro/i }).click();
  64  |     await page.getByRole('menuitem', { name: /Ensaio de CAUQ/i }).click();
  65  | 
  66  |     // Formulário deve carregar
> 67  |     await expect(page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i })).toBeVisible({ timeout: 20_000 });
      |                                                                               ^ Error: expect(locator).toBeVisible() failed
  68  | 
  69  |     // ═══════════════════════════════════════════════════════════════════════════
  70  |     // 3. SALVAR PROGRESSO — cria rascunho
  71  |     // ═══════════════════════════════════════════════════════════════════════════
  72  |     // Preencher observações (campo sempre presente)
  73  |     await page.getByLabel(/Observações Gerais/i).fill('Ensaio E2E — dados de teste');
  74  | 
  75  |     // Clicar em "Salvar Progresso"
  76  |     await page.getByRole('button', { name: /Salvar Progresso/i }).click();
  77  | 
  78  |     // Toast de sucesso deve aparecer
  79  |     await expect(page.getByText(/Progresso salvo com sucesso/i)).toBeVisible({ timeout: 10_000 });
  80  | 
  81  |     // O título muda para "Editar" indicando que o ensaio foi criado e está em edição
  82  |     await expect(page.getByRole('heading', { name: /Editar Ensaio de CAUQ/i })).toBeVisible({ timeout: 10_000 });
  83  | 
  84  |     // ═══════════════════════════════════════════════════════════════════════════
  85  |     // 4. FINALIZAR REGISTRO — status → finalizado
  86  |     // ═══════════════════════════════════════════════════════════════════════════
  87  |     await page.getByRole('button', { name: /Finalizar Registro/i }).click();
  88  | 
  89  |     // Toast de sucesso
  90  |     await expect(page.getByText(/finalizado com sucesso/i)).toBeVisible({ timeout: 10_000 });
  91  | 
  92  |     // Deve redirecionar para MeusEnsaios
  93  |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 15_000 });
  94  | 
  95  |     // ═══════════════════════════════════════════════════════════════════════════
  96  |     // 5. APROVAR — admin aprova o ensaio finalizado
  97  |     // ═══════════════════════════════════════════════════════════════════════════
  98  |     // O registro recém-criado deve aparecer na lista (primeira linha da tabela)
  99  |     // O botão de aprovar tem title="Aprovar" e ícone CheckCircle
  100 |     const approveBtn = page.locator('button[title="Aprovar"]').first();
  101 |     await expect(approveBtn).toBeVisible({ timeout: 10_000 });
  102 | 
  103 |     // Confirmar o dialog de confirmação
  104 |     page.on('dialog', dialog => dialog.accept());
  105 |     await approveBtn.click();
  106 | 
  107 |     // Toast de aprovação
  108 |     await expect(page.getByText(/aprovado com sucesso/i)).toBeVisible({ timeout: 10_000 });
  109 | 
  110 |     // ═══════════════════════════════════════════════════════════════════════════
  111 |     // 6. ABRIR RELATÓRIO — página de relatório renderiza
  112 |     // ═══════════════════════════════════════════════════════════════════════════
  113 |     // Clicar no botão de relatório (ícone FileText, abre em nova aba)
  114 |     const reportLink = page.locator('a[target="_blank"]').first();
  115 |     const [reportPage] = await Promise.all([
  116 |       page.context().waitForEvent('page'),
  117 |       reportLink.click(),
  118 |     ]);
  119 |     await reportPage.waitForLoadState('networkidle');
  120 | 
  121 |     // Relatório deve carregar com o cabeçalho
  122 |     await expect(reportPage.getByText(/Relatório de Ensaio Marshall/i)).toBeVisible({ timeout: 15_000 });
  123 | 
  124 |     // ═══════════════════════════════════════════════════════════════════════════
  125 |     // 7. GERAR PDF — botão visível e clicável
  126 |     // ═══════════════════════════════════════════════════════════════════════════
  127 |     const pdfButton = reportPage.getByRole('button', { name: /Gerar PDF/i });
  128 |     await expect(pdfButton).toBeVisible({ timeout: 10_000 });
  129 | 
  130 |     // ═══════════════════════════════════════════════════════════════════════════
  131 |     // 8. ASSINATURA — cliente assina via AprovacaoBar no relatório
  132 |     // ═══════════════════════════════════════════════════════════════════════════
  133 |     // Como admin não pode assinar (apenas cliente), validamos que o AprovacaoBar
  134 |     // renderizou com status "Aprovado" — o ensaio foi aprovado na etapa 5.
  135 |     await expect(reportPage.getByText(/Aprovado/i).first()).toBeVisible({ timeout: 10_000 });
  136 | 
  137 |     await reportPage.close();
  138 |   });
  139 | 
  140 |   test('regressão: remover o mock de criar ensaio faz o teste falhar claramente', async ({ page }) => {
  141 |     // Este teste valida que o teste E2E é sensível a quebras no fluxo.
  142 |     // Se a função validarESalvarRegistro retornar erro, "Salvar Progresso"
  143 |     // deve mostrar mensagem de erro — provando que o teste detecta regressões.
  144 |     const ctx = setupMockApi(page, ADMIN_USER);
  145 | 
  146 |     // ── Warmup: pré-carrega a página EnsaioCAUQ para o Vite otimizar deps ──────
  147 |     for (let attempt = 0; attempt < 3; attempt++) {
  148 |       try {
  149 |         await page.goto('/EnsaioCAUQ');
  150 |         const heading = page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i });
  151 |         const visible = await heading.isVisible({ timeout: 10_000 }).catch(() => false);
  152 |         if (visible) break;
  153 |       } catch { /* reload do Vite pode interromper o goto */ }
  154 |       await page.waitForTimeout(2000);
  155 |     }
  156 | 
  157 |     // Sobrescreve o mock da função para sempre retornar erro
  158 |     page.route('**/api/apps/*/functions/validarESalvarRegistro', async (route) => {
  159 |       return route.fulfill({
  160 |         status: 400,
  161 |         contentType: 'application/json',
  162 |         body: JSON.stringify({ error: 'Erro simulado: validação falhou' }),
  163 |       });
  164 |     });
  165 | 
  166 |     await page.goto('/MeusEnsaios');
  167 |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 20_000 });
```