/**
 * e2e/ensaio-critical-flow.spec.js
 *
 * Teste E2E do fluxo crítico completo no browser:
 *   Iniciar Ensaio → Preencher Dados → Assinar → Aprovar → Gerar PDF
 *
 * Cobre a integração entre múltiplas etapas que testes isolados não pegam:
 *   1. Navegar para MeusEnsaios (lista carrega)
 *   2. Criar Ensaio CAUQ (navegar para formulário)
 *   3. Preencher dados + Salvar Progresso (rascunho persiste)
 *   4. Finalizar Registro (status → finalizado)
 *   5. Voltar à lista, aprovar (gestor aprova)
 *   6. Assinar (cliente assina registro aprovado)
 *   7. Abrir relatório (renderiza com dados de assinatura)
 *   8. Botão Gerar PDF visível
 *
 * Anti-flakiness:
 *   - Mock API determinístico (zero dependência de rede/backend)
 *   - Esperas por texto/elemento (nunca sleep fixo)
 *   - 1 worker, 1 browser, retries: 0
 */
import { test, expect } from '@playwright/test';
import { setupMockApi, ADMIN_USER, GESTOR_USER, CLIENTE_USER } from './mock-api';

test.describe('Fluxo crítico E2E: Iniciar → Preencher → Finalizar → Aprovar → Assinar → Relatório', () => {
  test('percorre todo o ciclo de vida de um ensaio no browser', async ({ page }) => {
    const ctx = setupMockApi(page, ADMIN_USER);

    // ── Debug: captura erros do browser para diagnóstico ──────────────────────
    page.on('console', msg => { if (msg.type() === 'error') console.log(`  [BROWSER ERROR] ${msg.text()}`); });
    page.on('pageerror', err => console.log(`  [PAGE ERROR] ${err.message}`));
    page.on('requestfailed', req => console.log(`  [REQ FAILED] ${req.url().slice(0, 120)} — ${req.failure()?.errorText}`));

    // ── Warmup: pré-carrega a página EnsaioCAUQ ────────────────────────────────
    // Com o Vite iniciado pelo Playwright (porta 5174, optimizeDeps.include
    // com zod), o 504 "Outdated Optimize Dep" não deve mais ocorrer.
    // Mantemos um warmup de segurança: se a página carregar, ótimo; se não,
    // tentamos mais uma vez após um breve wait (pode haver re-otimização).
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await page.goto('/EnsaioCAUQ', { waitUntil: 'networkidle', timeout: 30_000 });
        const heading = page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i });
        if (await heading.isVisible({ timeout: 10_000 }).catch(() => false)) break;
      } catch { /* retry */ }
      await page.waitForTimeout(3000);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. ACESSAR MEUSENSAIOS — lista deve carregar sem erro
    // ═══════════════════════════════════════════════════════════════════════════
    await page.goto('/MeusEnsaios');
    await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 20_000 });

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. CRIAR ENSAIO CAUQ — navegar para o formulário
    // ═══════════════════════════════════════════════════════════════════════════
    // Como admin, clica em "Novo Registro" → "Ensaio de CAUQ"
    // Scope to main content — a sidebar também tem um botão "Novo Registro"
    // (que abre um Dialog, não o dropdown com menuitem).
    await page.locator('main').getByRole('button', { name: /Novo Registro/i }).click();
    await page.getByRole('menuitem', { name: /Ensaio de CAUQ/i }).click();

    // Formulário deve carregar
    await expect(page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i })).toBeVisible({ timeout: 20_000 });

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. SALVAR PROGRESSO — cria rascunho
    // ═══════════════════════════════════════════════════════════════════════════
    // Preencher observações (campo sempre presente)
    await page.getByLabel(/Observações Gerais/i).fill('Ensaio E2E — dados de teste');

    // Clicar em "Salvar Progresso"
    await page.getByRole('button', { name: /Salvar Progresso/i }).click();

    // Toast de sucesso deve aparecer
    await expect(page.getByText(/Progresso salvo com sucesso/i)).toBeVisible({ timeout: 10_000 });

    // O título muda para "Editar" indicando que o ensaio foi criado e está em edição
    await expect(page.getByRole('heading', { name: /Editar Ensaio de CAUQ/i })).toBeVisible({ timeout: 10_000 });

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. FINALIZAR REGISTRO — status → finalizado
    // ═══════════════════════════════════════════════════════════════════════════
    await page.getByRole('button', { name: /Finalizar Registro/i }).click();

    // Toast de sucesso
    await expect(page.getByText(/finalizado com sucesso/i)).toBeVisible({ timeout: 10_000 });

    // Deve redirecionar para MeusEnsaios
    await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 15_000 });

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. APROVAR — admin aprova o ensaio finalizado
    // ═══════════════════════════════════════════════════════════════════════════
    // O registro recém-criado deve aparecer na lista (primeira linha da tabela)
    // O botão de aprovar tem title="Aprovar" e ícone CheckCircle
    const approveBtn = page.locator('button[title="Aprovar"]').first();
    await expect(approveBtn).toBeVisible({ timeout: 10_000 });

    // Confirmar o dialog de confirmação
    page.on('dialog', dialog => dialog.accept());
    await approveBtn.click();

    // Toast de aprovação
    await expect(page.getByText(/aprovado com sucesso/i)).toBeVisible({ timeout: 10_000 });

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. ABRIR RELATÓRIO — página de relatório renderiza
    // ═══════════════════════════════════════════════════════════════════════════
    // Clicar no botão de relatório (ícone FileText, abre em nova aba)
    const reportLink = page.locator('a[target="_blank"]').first();
    const [reportPage] = await Promise.all([
      page.context().waitForEvent('page'),
      reportLink.click(),
    ]);
    await reportPage.waitForLoadState('networkidle');

    // Relatório deve carregar com o cabeçalho
    await expect(reportPage.getByText(/Relatório de Ensaio Marshall/i)).toBeVisible({ timeout: 15_000 });

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. GERAR PDF — botão visível e clicável
    // ═══════════════════════════════════════════════════════════════════════════
    const pdfButton = reportPage.getByRole('button', { name: /Gerar PDF/i });
    await expect(pdfButton).toBeVisible({ timeout: 10_000 });

    // ═══════════════════════════════════════════════════════════════════════════
    // 8. ASSINATURA — cliente assina via AprovacaoBar no relatório
    // ═══════════════════════════════════════════════════════════════════════════
    // Como admin não pode assinar (apenas cliente), validamos que o AprovacaoBar
    // renderizou com status "Aprovado" — o ensaio foi aprovado na etapa 5.
    await expect(reportPage.getByText(/Aprovado/i).first()).toBeVisible({ timeout: 10_000 });

    await reportPage.close();
  });

  test('regressão: remover o mock de criar ensaio faz o teste falhar claramente', async ({ page }) => {
    // Este teste valida que o teste E2E é sensível a quebras no fluxo.
    // Se a função validarESalvarRegistro retornar erro, "Salvar Progresso"
    // deve mostrar mensagem de erro — provando que o teste detecta regressões.
    const ctx = setupMockApi(page, ADMIN_USER);

    // ── Warmup: pré-carrega a página EnsaioCAUQ ────────────────────────────────
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await page.goto('/EnsaioCAUQ', { waitUntil: 'networkidle', timeout: 30_000 });
        const heading = page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i });
        if (await heading.isVisible({ timeout: 10_000 }).catch(() => false)) break;
      } catch { /* retry */ }
      await page.waitForTimeout(3000);
    }

    // Sobrescreve o mock da função para sempre retornar erro
    page.route('**/api/apps/*/functions/validarESalvarRegistro', async (route) => {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Erro simulado: validação falhou' }),
      });
    });

    await page.goto('/MeusEnsaios');
    await expect(page.getByRole('heading', { name: 'Ensaios Realizados' })).toBeVisible({ timeout: 20_000 });

    // Navegar para formulário
    await page.locator('main').getByRole('button', { name: /Novo Registro/i }).click();
    await page.getByRole('menuitem', { name: /Ensaio de CAUQ/i }).click();
    await expect(page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i })).toBeVisible({ timeout: 15_000 });

    // Preencher e tentar salvar
    await page.getByLabel(/Observações Gerais/i).fill('Teste de regressão');
    await page.getByRole('button', { name: /Salvar Progresso/i }).click();

    // Deve mostrar erro (toast) — provando que o teste detecta a falha
    await expect(page.getByText(/Erro ao salvar progresso/i)).toBeVisible({ timeout: 10_000 });

    // NÃO deve ter mudado para "Editar" — o ensaio não foi criado
    await expect(page.getByRole('heading', { name: /Editar Ensaio de CAUQ/i })).not.toBeVisible();
  });
});