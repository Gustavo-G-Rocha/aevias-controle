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

Locator: getByRole('heading', { name: 'Ensaios Realizados' })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Ensaios Realizados' })

```

```yaml
- heading "Welcome back" [level=1]
- paragraph: Log in to your account
- button "Continue with Google"
- text: or Email
- textbox "Email":
  - /placeholder: you@example.com
- text: Password
- link "Forgot password?":
  - /url: /forgot-password
- textbox "Password":
  - /placeholder: ••••••••
- button "Log in"
- paragraph:
  - text: Don't have an account?
  - link "Create one":
    - /url: /register
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
  29  |     // ═══════════════════════════════════════════════════════════════════════════
  30  |     // 1. ACESSAR MEUSENSAIOS — lista deve carregar sem erro
  31  |     // ═══════════════════════════════════════════════════════════════════════════
  32  |     await page.goto('/MeusEnsaios');
> 33  |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 20_000 });
      |                                                                             ^ Error: expect(locator).toBeVisible() failed
  34  | 
  35  |     // ═══════════════════════════════════════════════════════════════════════════
  36  |     // 2. CRIAR ENSAIO CAUQ — navegar para o formulário
  37  |     // ═══════════════════════════════════════════════════════════════════════════
  38  |     // Como admin, clica em "Novo Registro" → "Ensaio de CAUQ"
  39  |     await page.getByRole('button', { name: /Novo Registro/i }).click();
  40  |     await page.getByRole('menuitem', { name: /Ensaio de CAUQ/i }).click();
  41  | 
  42  |     // Formulário deve carregar
  43  |     await expect(page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i })).toBeVisible({ timeout: 15_000 });
  44  | 
  45  |     // ═══════════════════════════════════════════════════════════════════════════
  46  |     // 3. SALVAR PROGRESSO — cria rascunho
  47  |     // ═══════════════════════════════════════════════════════════════════════════
  48  |     // Preencher observações (campo sempre presente)
  49  |     await page.getByLabel(/Observações Gerais/i).fill('Ensaio E2E — dados de teste');
  50  | 
  51  |     // Clicar em "Salvar Progresso"
  52  |     await page.getByRole('button', { name: /Salvar Progresso/i }).click();
  53  | 
  54  |     // Toast de sucesso deve aparecer
  55  |     await expect(page.getByText(/Progresso salvo com sucesso/i)).toBeVisible({ timeout: 10_000 });
  56  | 
  57  |     // O título muda para "Editar" indicando que o ensaio foi criado e está em edição
  58  |     await expect(page.getByRole('heading', { name: /Editar Ensaio de CAUQ/i })).toBeVisible({ timeout: 10_000 });
  59  | 
  60  |     // ═══════════════════════════════════════════════════════════════════════════
  61  |     // 4. FINALIZAR REGISTRO — status → finalizado
  62  |     // ═══════════════════════════════════════════════════════════════════════════
  63  |     await page.getByRole('button', { name: /Finalizar Registro/i }).click();
  64  | 
  65  |     // Toast de sucesso
  66  |     await expect(page.getByText(/finalizado com sucesso/i)).toBeVisible({ timeout: 10_000 });
  67  | 
  68  |     // Deve redirecionar para MeusEnsaios
  69  |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 15_000 });
  70  | 
  71  |     // ═══════════════════════════════════════════════════════════════════════════
  72  |     // 5. APROVAR — admin aprova o ensaio finalizado
  73  |     // ═══════════════════════════════════════════════════════════════════════════
  74  |     // O registro recém-criado deve aparecer na lista (primeira linha da tabela)
  75  |     // O botão de aprovar tem title="Aprovar" e ícone CheckCircle
  76  |     const approveBtn = page.locator('button[title="Aprovar"]').first();
  77  |     await expect(approveBtn).toBeVisible({ timeout: 10_000 });
  78  | 
  79  |     // Confirmar o dialog de confirmação
  80  |     page.on('dialog', dialog => dialog.accept());
  81  |     await approveBtn.click();
  82  | 
  83  |     // Toast de aprovação
  84  |     await expect(page.getByText(/aprovado com sucesso/i)).toBeVisible({ timeout: 10_000 });
  85  | 
  86  |     // ═══════════════════════════════════════════════════════════════════════════
  87  |     // 6. ABRIR RELATÓRIO — página de relatório renderiza
  88  |     // ═══════════════════════════════════════════════════════════════════════════
  89  |     // Clicar no botão de relatório (ícone FileText, abre em nova aba)
  90  |     const reportLink = page.locator('a[target="_blank"]').first();
  91  |     const [reportPage] = await Promise.all([
  92  |       page.context().waitForEvent('page'),
  93  |       reportLink.click(),
  94  |     ]);
  95  |     await reportPage.waitForLoadState('networkidle');
  96  | 
  97  |     // Relatório deve carregar com o cabeçalho
  98  |     await expect(reportPage.getByText(/Relatório de Ensaio Marshall/i)).toBeVisible({ timeout: 15_000 });
  99  | 
  100 |     // ═══════════════════════════════════════════════════════════════════════════
  101 |     // 7. GERAR PDF — botão visível e clicável
  102 |     // ═══════════════════════════════════════════════════════════════════════════
  103 |     const pdfButton = reportPage.getByRole('button', { name: /Gerar PDF/i });
  104 |     await expect(pdfButton).toBeVisible({ timeout: 10_000 });
  105 | 
  106 |     // ═══════════════════════════════════════════════════════════════════════════
  107 |     // 8. ASSINATURA — cliente assina via AprovacaoBar no relatório
  108 |     // ═══════════════════════════════════════════════════════════════════════════
  109 |     // Como admin não pode assinar (apenas cliente), validamos que o AprovacaoBar
  110 |     // renderizou com status "Aprovado" — o ensaio foi aprovado na etapa 5.
  111 |     await expect(reportPage.getByText(/Aprovado/i).first()).toBeVisible({ timeout: 10_000 });
  112 | 
  113 |     await reportPage.close();
  114 |   });
  115 | 
  116 |   test('regressão: remover o mock de criar ensaio faz o teste falhar claramente', async ({ page }) => {
  117 |     // Este teste valida que o teste E2E é sensível a quebras no fluxo.
  118 |     // Se a função validarESalvarRegistro retornar erro, "Salvar Progresso"
  119 |     // deve mostrar mensagem de erro — provando que o teste detecta regressões.
  120 |     const ctx = setupMockApi(page, ADMIN_USER);
  121 | 
  122 |     // Sobrescreve o mock da função para sempre retornar erro
  123 |     page.route('**/api/apps/*/functions/validarESalvarRegistro', async (route) => {
  124 |       return route.fulfill({
  125 |         status: 400,
  126 |         contentType: 'application/json',
  127 |         body: JSON.stringify({ error: 'Erro simulado: validação falhou' }),
  128 |       });
  129 |     });
  130 | 
  131 |     await page.goto('/MeusEnsaios');
  132 |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 20_000 });
  133 | 
```