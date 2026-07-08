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
  29  |     // ── Warmup: pré-carrega a página EnsaioCAUQ para o Vite otimizar deps ──────
  30  |     // O primeiro carregamento de uma página lazy pode causar 504 "Outdated
  31  |     // Optimize Dep" — o Vite descobre novas dependências, invalida o cache,
  32  |     // e re-otimiza. Iteramos até a página carregar com sucesso (máx 3 tentativas).
  33  |     for (let attempt = 0; attempt < 3; attempt++) {
  34  |       await page.goto('/EnsaioCAUQ');
  35  |       await page.waitForLoadState('networkidle').catch(() => {});
  36  |       // Se o ErrorBoundary ("Algo deu errado") aparecer, o Vite ainda está
  37  |       // re-otimizando — aguarda e tenta novamente.
  38  |       const hasError = await page.getByRole('heading', { name: /Algo deu errado/i }).isVisible().catch(() => false);
  39  |       if (!hasError) break;
  40  |       await page.waitForTimeout(3000);
  41  |     }
  42  | 
  43  |     // ═══════════════════════════════════════════════════════════════════════════
  44  |     // 1. ACESSAR MEUSENSAIOS — lista deve carregar sem erro
  45  |     // ═══════════════════════════════════════════════════════════════════════════
  46  |     await page.goto('/MeusEnsaios');
  47  |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 20_000 });
  48  | 
  49  |     // ═══════════════════════════════════════════════════════════════════════════
  50  |     // 2. CRIAR ENSAIO CAUQ — navegar para o formulário
  51  |     // ═══════════════════════════════════════════════════════════════════════════
  52  |     // Como admin, clica em "Novo Registro" → "Ensaio de CAUQ"
  53  |     // Scope to main content — a sidebar também tem um botão "Novo Registro"
  54  |     // (que abre um Dialog, não o dropdown com menuitem).
  55  |     await page.locator('main').getByRole('button', { name: /Novo Registro/i }).click();
  56  |     await page.getByRole('menuitem', { name: /Ensaio de CAUQ/i }).click();
  57  | 
  58  |     // Formulário deve carregar
> 59  |     await expect(page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i })).toBeVisible({ timeout: 20_000 });
      |                                                                               ^ Error: expect(locator).toBeVisible() failed
  60  | 
  61  |     // ═══════════════════════════════════════════════════════════════════════════
  62  |     // 3. SALVAR PROGRESSO — cria rascunho
  63  |     // ═══════════════════════════════════════════════════════════════════════════
  64  |     // Preencher observações (campo sempre presente)
  65  |     await page.getByLabel(/Observações Gerais/i).fill('Ensaio E2E — dados de teste');
  66  | 
  67  |     // Clicar em "Salvar Progresso"
  68  |     await page.getByRole('button', { name: /Salvar Progresso/i }).click();
  69  | 
  70  |     // Toast de sucesso deve aparecer
  71  |     await expect(page.getByText(/Progresso salvo com sucesso/i)).toBeVisible({ timeout: 10_000 });
  72  | 
  73  |     // O título muda para "Editar" indicando que o ensaio foi criado e está em edição
  74  |     await expect(page.getByRole('heading', { name: /Editar Ensaio de CAUQ/i })).toBeVisible({ timeout: 10_000 });
  75  | 
  76  |     // ═══════════════════════════════════════════════════════════════════════════
  77  |     // 4. FINALIZAR REGISTRO — status → finalizado
  78  |     // ═══════════════════════════════════════════════════════════════════════════
  79  |     await page.getByRole('button', { name: /Finalizar Registro/i }).click();
  80  | 
  81  |     // Toast de sucesso
  82  |     await expect(page.getByText(/finalizado com sucesso/i)).toBeVisible({ timeout: 10_000 });
  83  | 
  84  |     // Deve redirecionar para MeusEnsaios
  85  |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 15_000 });
  86  | 
  87  |     // ═══════════════════════════════════════════════════════════════════════════
  88  |     // 5. APROVAR — admin aprova o ensaio finalizado
  89  |     // ═══════════════════════════════════════════════════════════════════════════
  90  |     // O registro recém-criado deve aparecer na lista (primeira linha da tabela)
  91  |     // O botão de aprovar tem title="Aprovar" e ícone CheckCircle
  92  |     const approveBtn = page.locator('button[title="Aprovar"]').first();
  93  |     await expect(approveBtn).toBeVisible({ timeout: 10_000 });
  94  | 
  95  |     // Confirmar o dialog de confirmação
  96  |     page.on('dialog', dialog => dialog.accept());
  97  |     await approveBtn.click();
  98  | 
  99  |     // Toast de aprovação
  100 |     await expect(page.getByText(/aprovado com sucesso/i)).toBeVisible({ timeout: 10_000 });
  101 | 
  102 |     // ═══════════════════════════════════════════════════════════════════════════
  103 |     // 6. ABRIR RELATÓRIO — página de relatório renderiza
  104 |     // ═══════════════════════════════════════════════════════════════════════════
  105 |     // Clicar no botão de relatório (ícone FileText, abre em nova aba)
  106 |     const reportLink = page.locator('a[target="_blank"]').first();
  107 |     const [reportPage] = await Promise.all([
  108 |       page.context().waitForEvent('page'),
  109 |       reportLink.click(),
  110 |     ]);
  111 |     await reportPage.waitForLoadState('networkidle');
  112 | 
  113 |     // Relatório deve carregar com o cabeçalho
  114 |     await expect(reportPage.getByText(/Relatório de Ensaio Marshall/i)).toBeVisible({ timeout: 15_000 });
  115 | 
  116 |     // ═══════════════════════════════════════════════════════════════════════════
  117 |     // 7. GERAR PDF — botão visível e clicável
  118 |     // ═══════════════════════════════════════════════════════════════════════════
  119 |     const pdfButton = reportPage.getByRole('button', { name: /Gerar PDF/i });
  120 |     await expect(pdfButton).toBeVisible({ timeout: 10_000 });
  121 | 
  122 |     // ═══════════════════════════════════════════════════════════════════════════
  123 |     // 8. ASSINATURA — cliente assina via AprovacaoBar no relatório
  124 |     // ═══════════════════════════════════════════════════════════════════════════
  125 |     // Como admin não pode assinar (apenas cliente), validamos que o AprovacaoBar
  126 |     // renderizou com status "Aprovado" — o ensaio foi aprovado na etapa 5.
  127 |     await expect(reportPage.getByText(/Aprovado/i).first()).toBeVisible({ timeout: 10_000 });
  128 | 
  129 |     await reportPage.close();
  130 |   });
  131 | 
  132 |   test('regressão: remover o mock de criar ensaio faz o teste falhar claramente', async ({ page }) => {
  133 |     // Este teste valida que o teste E2E é sensível a quebras no fluxo.
  134 |     // Se a função validarESalvarRegistro retornar erro, "Salvar Progresso"
  135 |     // deve mostrar mensagem de erro — provando que o teste detecta regressões.
  136 |     const ctx = setupMockApi(page, ADMIN_USER);
  137 | 
  138 |     // ── Warmup: pré-carrega a página EnsaioCAUQ para o Vite otimizar deps ──────
  139 |     for (let attempt = 0; attempt < 3; attempt++) {
  140 |       await page.goto('/EnsaioCAUQ');
  141 |       await page.waitForLoadState('networkidle').catch(() => {});
  142 |       const hasError = await page.getByRole('heading', { name: /Algo deu errado/i }).isVisible().catch(() => false);
  143 |       if (!hasError) break;
  144 |       await page.waitForTimeout(3000);
  145 |     }
  146 | 
  147 |     // Sobrescreve o mock da função para sempre retornar erro
  148 |     page.route('**/api/apps/*/functions/validarESalvarRegistro', async (route) => {
  149 |       return route.fulfill({
  150 |         status: 400,
  151 |         contentType: 'application/json',
  152 |         body: JSON.stringify({ error: 'Erro simulado: validação falhou' }),
  153 |       });
  154 |     });
  155 | 
  156 |     await page.goto('/MeusEnsaios');
  157 |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 20_000 });
  158 | 
  159 |     // Navegar para formulário
```