# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ensaio-critical-flow.spec.js >> Fluxo crítico E2E: Iniciar → Preencher → Finalizar → Aprovar → Assinar → Relatório >> regressão: remover o mock de criar ensaio faz o teste falhar claramente
- Location: e2e/ensaio-critical-flow.spec.js:116:3

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('menuitem', { name: /Ensaio de CAUQ/i })

```

# Page snapshot

```yaml
- generic:
  - generic:
    - generic:
      - generic:
        - generic:
          - generic:
            - generic:
              - generic:
                - generic:
                  - img
              - generic:
                - button [expanded]:
                  - img
                  - text: Novo Registro
                - generic:
                  - generic: Principal
                  - generic:
                    - list:
                      - listitem:
                        - link:
                          - /url: /Dashboard
                          - img
                          - generic: Dashboard
                      - listitem:
                        - link:
                          - /url: /Regionais
                          - img
                          - generic: Regionais
                      - listitem:
                        - button:
                          - generic:
                            - img
                            - generic: Minhas Obras
                            - img
                      - listitem:
                        - button:
                          - generic:
                            - img
                            - generic: Não Conformidades
                            - img
                - generic:
                  - generic: Administração
                  - generic:
                    - list:
                      - listitem:
                        - link:
                          - /url: /Users
                          - img
                          - generic: Usuários
                      - listitem:
                        - link:
                          - /url: /Produtividade
                          - img
                          - generic: Produtividade
                      - listitem:
                        - link:
                          - /url: /ControleLaboratoristas
                          - img
                          - generic: Controle Laboratoristas
                      - listitem:
                        - link:
                          - /url: /FaixasGranulometricas
                          - img
                          - generic: Faixas Granulométricas
                      - listitem:
                        - link:
                          - /url: /MigracaoDados
                          - img
                          - generic: Migração de Dados
                      - listitem:
                        - link:
                          - /url: /MonitorProdutividade
                          - img
                          - generic: Monitor de Produtividade
                      - listitem:
                        - link:
                          - /url: /Settings
                          - img
                          - generic: Configurações
              - generic:
                - button:
                  - generic:
                    - img
                  - generic:
                    - paragraph: Admin E2E
                    - generic:
                      - paragraph: admin@e2e.test
                      - generic: Admin
        - main:
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - heading [level=1]: Ensaios Realizados
                        - paragraph: Gerencie e aprove todos os registros de suas obras.
                      - generic:
                        - generic:
                          - generic:
                            - generic: 0 registro(s) encontrado(s)
                          - button:
                            - img
                            - text: Novo Registro
                        - generic:
                          - generic:
                            - generic:
                              - table:
                                - rowgroup:
                                  - row:
                                    - columnheader:
                                      - generic:
                                        - generic: Tipo
                                        - button:
                                          - img
                                    - columnheader:
                                      - generic:
                                        - button:
                                          - generic: Data
                                          - img
                                        - button:
                                          - img
                                          - text: Filtrar período
                                    - columnheader:
                                      - generic:
                                        - generic: Obra
                                        - button:
                                          - img
                                    - columnheader:
                                      - generic:
                                        - generic: Lab.
                                        - button:
                                          - img
                                    - columnheader:
                                      - generic:
                                        - generic: Local
                                        - button:
                                          - img
                                    - columnheader:
                                      - generic:
                                        - generic: Empreiteira
                                        - button:
                                          - img
                                    - columnheader:
                                      - generic:
                                        - generic: Projeto
                                        - button:
                                          - img
                                    - columnheader:
                                      - generic:
                                        - generic: Status
                                        - button:
                                          - img
                                    - columnheader: Ações
                              - generic:
                                - img
                                - heading [level=3]: Nenhum registro encontrado
                                - paragraph: Ajuste os filtros ou aguarde novos registros.
  - dialog "Iniciar Novo Registro" [ref=e2]:
    - generic [ref=e3]:
      - heading "Iniciar Novo Registro" [level=2] [ref=e4]
      - paragraph [ref=e5]: Selecione o tipo de registro que deseja criar
    - generic [ref=e6]:
      - generic [ref=e7]:
        - heading "Registro Geral" [level=3] [ref=e8]:
          - img [ref=e9]
          - text: Registro Geral
        - button "Diário de Obra Registro diário de atividades" [active] [ref=e12] [cursor=pointer]:
          - img [ref=e14]
          - generic [ref=e16]:
            - paragraph [ref=e17]: Diário de Obra
            - paragraph [ref=e18]: Registro diário de atividades
      - generic [ref=e19]:
        - heading "Ensaios por Tipo de Obra" [level=3] [ref=e20]:
          - img [ref=e21]
          - text: Ensaios por Tipo de Obra
        - generic [ref=e23]:
          - generic [ref=e24]:
            - img [ref=e25]
            - heading "Supervisão" [level=4] [ref=e30]
          - generic [ref=e31]:
            - button "Checklist de Usina" [ref=e32] [cursor=pointer]:
              - img [ref=e33]
              - paragraph [ref=e36]: Checklist de Usina
            - button "Checklist de Aplicação" [ref=e37] [cursor=pointer]:
              - img [ref=e38]
              - paragraph [ref=e41]: Checklist de Aplicação
            - button "Checklist de MRAF" [ref=e42] [cursor=pointer]:
              - img [ref=e43]
              - paragraph [ref=e46]: Checklist de MRAF
            - button "Checklist de Concretagem" [ref=e47] [cursor=pointer]:
              - img [ref=e48]
              - paragraph [ref=e51]: Checklist de Concretagem
            - button "Checklist de Terraplanagem" [ref=e52] [cursor=pointer]:
              - img [ref=e53]
              - paragraph [ref=e56]: Checklist de Terraplanagem
            - button "Checklist de Reciclagem" [ref=e57] [cursor=pointer]:
              - img [ref=e58]
              - paragraph [ref=e61]: Checklist de Reciclagem
            - button "Ensaio de CAUQ" [ref=e62] [cursor=pointer]:
              - img [ref=e63]
              - paragraph [ref=e65]: Ensaio de CAUQ
            - button "Acompanhamento de Usinagem" [ref=e66] [cursor=pointer]:
              - img [ref=e67]
              - paragraph [ref=e69]: Acompanhamento de Usinagem
            - button "Taxa de Pintura/Imprimação" [ref=e70] [cursor=pointer]:
              - img [ref=e71]
              - paragraph [ref=e73]: Taxa de Pintura/Imprimação
            - button "Rompimento Concreto" [ref=e74] [cursor=pointer]:
              - img [ref=e75]
              - paragraph [ref=e77]: Rompimento Concreto
            - button "Mancha + Pêndulo" [ref=e78] [cursor=pointer]:
              - img [ref=e79]
              - paragraph [ref=e82]: Mancha + Pêndulo
            - button "Sondagem" [ref=e83] [cursor=pointer]:
              - img [ref=e84]
              - paragraph [ref=e87]: Sondagem
            - button "Viga Benkelman" [ref=e88] [cursor=pointer]:
              - img [ref=e89]
              - paragraph [ref=e92]: Viga Benkelman
            - button "Taxa MRAF" [ref=e93] [cursor=pointer]:
              - img [ref=e94]
              - paragraph [ref=e96]: Taxa MRAF
        - generic [ref=e97]:
          - generic [ref=e98]:
            - img [ref=e99]
            - heading "Implantação" [level=4] [ref=e104]
          - generic [ref=e105]:
            - button "Ensaio MRAF" [ref=e106] [cursor=pointer]:
              - img [ref=e107]
              - paragraph [ref=e109]: Ensaio MRAF
            - button "Acompanhamento de Usinagem" [ref=e110] [cursor=pointer]:
              - img [ref=e111]
              - paragraph [ref=e113]: Acompanhamento de Usinagem
            - button "Taxa de Pintura/Imprimação" [ref=e114] [cursor=pointer]:
              - img [ref=e115]
              - paragraph [ref=e117]: Taxa de Pintura/Imprimação
            - button "Granulometria Individual" [ref=e118] [cursor=pointer]:
              - img [ref=e119]
              - paragraph [ref=e121]: Granulometria Individual
            - button "Granulometria da Mistura" [ref=e122] [cursor=pointer]:
              - img [ref=e123]
              - paragraph [ref=e125]: Granulometria da Mistura
            - button "Rompimento Concreto" [ref=e126] [cursor=pointer]:
              - img [ref=e127]
              - paragraph [ref=e129]: Rompimento Concreto
            - button "Mancha + Pêndulo" [ref=e130] [cursor=pointer]:
              - img [ref=e131]
              - paragraph [ref=e134]: Mancha + Pêndulo
            - button "Densidade In Situ" [ref=e135] [cursor=pointer]:
              - img [ref=e136]
              - paragraph [ref=e139]: Densidade In Situ
            - button "Sondagem" [ref=e140] [cursor=pointer]:
              - img [ref=e141]
              - paragraph [ref=e144]: Sondagem
            - button "Viga Benkelman" [ref=e145] [cursor=pointer]:
              - img [ref=e146]
              - paragraph [ref=e149]: Viga Benkelman
            - button "Taxa MRAF" [ref=e150] [cursor=pointer]:
              - img [ref=e151]
              - paragraph [ref=e153]: Taxa MRAF
            - button "Ensaio Proctor" [ref=e154] [cursor=pointer]:
              - img [ref=e155]
              - paragraph [ref=e157]: Ensaio Proctor
        - generic [ref=e158]:
          - generic [ref=e159]:
            - img [ref=e160]
            - heading "Conservação" [level=4] [ref=e162]
          - generic [ref=e163]:
            - generic [ref=e164]:
              - paragraph [ref=e165]: Usina
              - generic [ref=e166]:
                - button "Ensaio de CAUQ" [ref=e167] [cursor=pointer]:
                  - img [ref=e168]
                  - paragraph [ref=e170]: Ensaio de CAUQ
                - button "Acompanhamento de Usinagem" [ref=e171] [cursor=pointer]:
                  - img [ref=e172]
                  - paragraph [ref=e174]: Acompanhamento de Usinagem
                - button "Rompimento Concreto" [ref=e175] [cursor=pointer]:
                  - img [ref=e176]
                  - paragraph [ref=e178]: Rompimento Concreto
                - button "Granulometria Individual" [ref=e179] [cursor=pointer]:
                  - img [ref=e180]
                  - paragraph [ref=e182]: Granulometria Individual
                - button "Granulometria da Mistura" [ref=e183] [cursor=pointer]:
                  - img [ref=e184]
                  - paragraph [ref=e186]: Granulometria da Mistura
                - button "Sondagem" [ref=e187] [cursor=pointer]:
                  - img [ref=e188]
                  - paragraph [ref=e191]: Sondagem
            - generic [ref=e192]:
              - paragraph [ref=e193]: MRAF
              - generic [ref=e194]:
                - button "Ensaio MRAF" [ref=e195] [cursor=pointer]:
                  - img [ref=e196]
                  - paragraph [ref=e198]: Ensaio MRAF
                - button "Taxa MRAF" [ref=e199] [cursor=pointer]:
                  - img [ref=e200]
                  - paragraph [ref=e202]: Taxa MRAF
                - button "Mancha + Pêndulo" [ref=e203] [cursor=pointer]:
                  - img [ref=e204]
                  - paragraph [ref=e207]: Mancha + Pêndulo
                - button "Granulometria Individual" [ref=e208] [cursor=pointer]:
                  - img [ref=e209]
                  - paragraph [ref=e211]: Granulometria Individual
                - button "Granulometria da Mistura" [ref=e212] [cursor=pointer]:
                  - img [ref=e213]
                  - paragraph [ref=e215]: Granulometria da Mistura
            - generic [ref=e216]:
              - paragraph [ref=e217]: Campo
              - generic [ref=e218]:
                - button "Ensaio de CAUQ" [ref=e219] [cursor=pointer]:
                  - img [ref=e220]
                  - paragraph [ref=e222]: Ensaio de CAUQ
                - button "Taxa de Pintura/Imprimação" [ref=e223] [cursor=pointer]:
                  - img [ref=e224]
                  - paragraph [ref=e226]: Taxa de Pintura/Imprimação
                - button "Acompanhamento de Cargas" [ref=e227] [cursor=pointer]:
                  - img [ref=e228]
                  - paragraph [ref=e230]: Acompanhamento de Cargas
                - button "Viga Benkelman" [ref=e231] [cursor=pointer]:
                  - img [ref=e232]
                  - paragraph [ref=e235]: Viga Benkelman
                - button "Densidade In Situ" [ref=e236] [cursor=pointer]:
                  - img [ref=e237]
                  - paragraph [ref=e240]: Densidade In Situ
                - button "Ensaio Proctor" [ref=e241] [cursor=pointer]:
                  - img [ref=e242]
                  - paragraph [ref=e244]: Ensaio Proctor
                - button "Mancha + Pêndulo" [ref=e245] [cursor=pointer]:
                  - img [ref=e246]
                  - paragraph [ref=e249]: Mancha + Pêndulo
        - generic [ref=e250]:
          - generic [ref=e251]:
            - img [ref=e252]
            - heading "Sondagem" [level=4] [ref=e255]
          - generic [ref=e256]:
            - button "Boletim de Sondagem (PI)" [ref=e257] [cursor=pointer]:
              - img [ref=e258]
              - paragraph [ref=e261]: Boletim de Sondagem (PI)
            - button "Boletim de Sondagem a Trado" [ref=e262] [cursor=pointer]:
              - img [ref=e263]
              - paragraph [ref=e266]: Boletim de Sondagem a Trado
            - button "Ensaio Proctor" [ref=e267] [cursor=pointer]:
              - img [ref=e268]
              - paragraph [ref=e270]: Ensaio Proctor
        - generic [ref=e271]:
          - generic [ref=e272]:
            - img [ref=e273]
            - heading "Levantamentos" [level=4] [ref=e276]
          - generic [ref=e277]:
            - button "Mancha + Pêndulo" [ref=e278] [cursor=pointer]:
              - img [ref=e279]
              - paragraph [ref=e282]: Mancha + Pêndulo
            - button "Viga Benkelman" [ref=e283] [cursor=pointer]:
              - img [ref=e284]
              - paragraph [ref=e287]: Viga Benkelman
        - generic [ref=e288]:
          - generic [ref=e289]:
            - img [ref=e290]
            - heading "Homologação de Usinas" [level=4] [ref=e292]
          - button "Certificação de Usina" [ref=e294] [cursor=pointer]:
            - img [ref=e295]
            - paragraph [ref=e298]: Certificação de Usina
    - button "Close" [ref=e299] [cursor=pointer]:
      - img [ref=e300]
      - generic [ref=e303]: Close
```

# Test source

```ts
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
  134 |     // Navegar para formulário
  135 |     await page.getByRole('button', { name: /Novo Registro/i }).click();
> 136 |     await page.getByRole('menuitem', { name: /Ensaio de CAUQ/i }).click();
      |                                                                   ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  137 |     await expect(page.getByRole('heading', { name: /Novo Ensaio de CAUQ/i })).toBeVisible({ timeout: 15_000 });
  138 | 
  139 |     // Preencher e tentar salvar
  140 |     await page.getByLabel(/Observações Gerais/i).fill('Teste de regressão');
  141 |     await page.getByRole('button', { name: /Salvar Progresso/i }).click();
  142 | 
  143 |     // Deve mostrar erro (toast) — provando que o teste detecta a falha
  144 |     await expect(page.getByText(/Erro ao salvar progresso/i)).toBeVisible({ timeout: 10_000 });
  145 | 
  146 |     // NÃO deve ter mudado para "Editar" — o ensaio não foi criado
  147 |     await expect(page.getByRole('heading', { name: /Editar Ensaio de CAUQ/i })).not.toBeVisible();
  148 |   });
  149 | });
```