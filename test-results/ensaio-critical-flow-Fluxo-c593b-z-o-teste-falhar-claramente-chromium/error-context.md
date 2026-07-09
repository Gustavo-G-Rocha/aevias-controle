# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ensaio-critical-flow.spec.js >> Fluxo crítico E2E: Iniciar → Preencher → Finalizar → Aprovar → Assinar → Relatório >> regressão: remover o mock de criar ensaio faz o teste falhar claramente
- Location: e2e/ensaio-critical-flow.spec.js:130:3

# Error details

```
Error: browserType.launch: Executable doesn't exist at /root/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```