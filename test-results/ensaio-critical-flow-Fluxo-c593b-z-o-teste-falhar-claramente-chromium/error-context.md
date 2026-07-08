# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ensaio-critical-flow.spec.js >> Fluxo crítico E2E: Iniciar → Preencher → Finalizar → Aprovar → Assinar → Relatório >> regressão: remover o mock de criar ensaio faz o teste falhar claramente
- Location: e2e/ensaio-critical-flow.spec.js:137:3

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

# Test source

```ts
  63  |     // Formulário deve carregar
  64  |     await expect(page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i })).toBeVisible({ timeout: 20_000 });
  65  | 
  66  |     // ═══════════════════════════════════════════════════════════════════════════
  67  |     // 3. SALVAR PROGRESSO — cria rascunho
  68  |     // ═══════════════════════════════════════════════════════════════════════════
  69  |     // Preencher observações (campo sempre presente)
  70  |     await page.getByLabel(/Observações Gerais/i).fill('Ensaio E2E — dados de teste');
  71  | 
  72  |     // Clicar em "Salvar Progresso"
  73  |     await page.getByRole('button', { name: /Salvar Progresso/i }).click();
  74  | 
  75  |     // Toast de sucesso deve aparecer
  76  |     await expect(page.getByText(/Progresso salvo com sucesso/i)).toBeVisible({ timeout: 10_000 });
  77  | 
  78  |     // O título muda para "Editar" indicando que o ensaio foi criado e está em edição
  79  |     await expect(page.getByRole('heading', { name: /Editar Ensaio de CAUQ/i })).toBeVisible({ timeout: 10_000 });
  80  | 
  81  |     // ═══════════════════════════════════════════════════════════════════════════
  82  |     // 4. FINALIZAR REGISTRO — status → finalizado
  83  |     // ═══════════════════════════════════════════════════════════════════════════
  84  |     await page.getByRole('button', { name: /Finalizar Registro/i }).click();
  85  | 
  86  |     // Toast de sucesso
  87  |     await expect(page.getByText(/finalizado com sucesso/i)).toBeVisible({ timeout: 10_000 });
  88  | 
  89  |     // Deve redirecionar para MeusEnsaios
  90  |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 15_000 });
  91  | 
  92  |     // ═══════════════════════════════════════════════════════════════════════════
  93  |     // 5. APROVAR — admin aprova o ensaio finalizado
  94  |     // ═══════════════════════════════════════════════════════════════════════════
  95  |     // O registro recém-criado deve aparecer na lista (primeira linha da tabela)
  96  |     // O botão de aprovar tem title="Aprovar" e ícone CheckCircle
  97  |     const approveBtn = page.locator('button[title="Aprovar"]').first();
  98  |     await expect(approveBtn).toBeVisible({ timeout: 10_000 });
  99  | 
  100 |     // Confirmar o dialog de confirmação
  101 |     page.on('dialog', dialog => dialog.accept());
  102 |     await approveBtn.click();
  103 | 
  104 |     // Toast de aprovação
  105 |     await expect(page.getByText(/aprovado com sucesso/i)).toBeVisible({ timeout: 10_000 });
  106 | 
  107 |     // ═══════════════════════════════════════════════════════════════════════════
  108 |     // 6. ABRIR RELATÓRIO — página de relatório renderiza
  109 |     // ═══════════════════════════════════════════════════════════════════════════
  110 |     // Clicar no botão de relatório (ícone FileText, abre em nova aba)
  111 |     const reportLink = page.locator('a[target="_blank"]').first();
  112 |     const [reportPage] = await Promise.all([
  113 |       page.context().waitForEvent('page'),
  114 |       reportLink.click(),
  115 |     ]);
  116 |     await reportPage.waitForLoadState('networkidle');
  117 | 
  118 |     // Relatório deve carregar com o cabeçalho
  119 |     await expect(reportPage.getByText(/Relatório de Ensaio Marshall/i)).toBeVisible({ timeout: 15_000 });
  120 | 
  121 |     // ═══════════════════════════════════════════════════════════════════════════
  122 |     // 7. GERAR PDF — botão visível e clicável
  123 |     // ═══════════════════════════════════════════════════════════════════════════
  124 |     const pdfButton = reportPage.getByRole('button', { name: /Gerar PDF/i });
  125 |     await expect(pdfButton).toBeVisible({ timeout: 10_000 });
  126 | 
  127 |     // ═══════════════════════════════════════════════════════════════════════════
  128 |     // 8. ASSINATURA — cliente assina via AprovacaoBar no relatório
  129 |     // ═══════════════════════════════════════════════════════════════════════════
  130 |     // Como admin não pode assinar (apenas cliente), validamos que o AprovacaoBar
  131 |     // renderizou com status "Aprovado" — o ensaio foi aprovado na etapa 5.
  132 |     await expect(reportPage.getByText(/Aprovado/i).first()).toBeVisible({ timeout: 10_000 });
  133 | 
  134 |     await reportPage.close();
  135 |   });
  136 | 
  137 |   test('regressão: remover o mock de criar ensaio faz o teste falhar claramente', async ({ page }) => {
  138 |     // Este teste valida que o teste E2E é sensível a quebras no fluxo.
  139 |     // Se a função validarESalvarRegistro retornar erro, "Salvar Progresso"
  140 |     // deve mostrar mensagem de erro — provando que o teste detecta regressões.
  141 |     const ctx = setupMockApi(page, ADMIN_USER);
  142 | 
  143 |     // ── Warmup: pré-carrega a página EnsaioCAUQ ────────────────────────────────
  144 |     for (let attempt = 0; attempt < 2; attempt++) {
  145 |       try {
  146 |         await page.goto('/EnsaioCAUQ', { waitUntil: 'networkidle', timeout: 30_000 });
  147 |         const heading = page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i });
  148 |         if (await heading.isVisible({ timeout: 10_000 }).catch(() => false)) break;
  149 |       } catch { /* retry */ }
  150 |       await page.waitForTimeout(3000);
  151 |     }
  152 | 
  153 |     // Sobrescreve o mock da função para sempre retornar erro
  154 |     page.route('**/api/apps/*/functions/validarESalvarRegistro', async (route) => {
  155 |       return route.fulfill({
  156 |         status: 400,
  157 |         contentType: 'application/json',
  158 |         body: JSON.stringify({ error: 'Erro simulado: validação falhou' }),
  159 |       });
  160 |     });
  161 | 
  162 |     await page.goto('/MeusEnsaios');
> 163 |     await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 20_000 });
      |                                                                             ^ Error: expect(locator).toBeVisible() failed
  164 | 
  165 |     // Navegar para formulário
  166 |     await page.locator('main').getByRole('button', { name: /Novo Registro/i }).click();
  167 |     await page.getByRole('menuitem', { name: /Ensaio de CAUQ/i }).click();
  168 |     await expect(page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i })).toBeVisible({ timeout: 15_000 });
  169 | 
  170 |     // Preencher e tentar salvar
  171 |     await page.getByLabel(/Observações Gerais/i).fill('Teste de regressão');
  172 |     await page.getByRole('button', { name: /Salvar Progresso/i }).click();
  173 | 
  174 |     // Deve mostrar erro (toast) — provando que o teste detecta a falha
  175 |     await expect(page.getByText(/Erro ao salvar progresso/i)).toBeVisible({ timeout: 10_000 });
  176 | 
  177 |     // NÃO deve ter mudado para "Editar" — o ensaio não foi criado
  178 |     await expect(page.getByRole('heading', { name: /Editar Ensaio de CAUQ/i })).not.toBeVisible();
  179 |   });
  180 | });
```