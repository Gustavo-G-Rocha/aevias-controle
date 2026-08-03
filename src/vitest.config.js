import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // JSX automático (como o Vite em runtime) — componentes .jsx do projeto
  // não importam React explicitamente.
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/vitest.setup.js'],
    // e2e/ contém specs do Playwright (test runner próprio) — não são
    // compatíveis com o vitest e quebram a suíte se incluídos.
    exclude: ['**/node_modules/**', 'e2e/**', 'test-results/**'],
    // Imports dinâmicos de componentes pesados (relatórios, contextos)
    // ultrapassam o default de 5s em ambientes com I/O limitado.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: [
      // Módulos virtuais @/functions/* (gerados pelo vite-plugin do Base44
      // em runtime) não existem no vitest — redireciona para o stub.
      {
        find: /^@\/functions\/.*$/,
        replacement: resolve(__dirname, 'tests/stubs/base44FunctionsStub.js'),
      },
      // O cliente real do SDK faz chamadas de rede na inicialização —
      // inviável em Node/vitest ("Invalid URL" + timeouts). Stub inerte.
      {
        find: /^@\/api\/base44Client$/,
        replacement: resolve(__dirname, 'tests/stubs/base44ClientStub.js'),
      },
      // Este arquivo vive em src/, então __dirname JÁ É src/ — o alias '@'
      // deve apontar para o próprio diretório (antes apontava para src/src).
      { find: '@', replacement: resolve(__dirname, '.') },
    ],
  },
});