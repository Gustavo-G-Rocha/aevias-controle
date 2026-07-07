#!/usr/bin/env node
/**
 * check-pages-registration.js
 *
 * Verifica se todo arquivo de página em src/pages/ está registrado em
 * pages.config.js (lazy import) ou em App.jsx (import estático — ex.: auth).
 *
 * Se uma página não estiver registrada em nenhum dos dois, o script emite
 * erro e sai com código 1, falhando o build.
 *
 * Páginas de entrada reconhecidas:
 *   - src/pages/MyPage.jsx          → chave "MyPage"
 *   - src/pages/SubDir/index.jsx    → chave "SubDir/index"
 *
 * Uso: node scripts/check-pages-registration.js
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const PAGES_DIR = join(ROOT, 'src', 'pages');
const PAGES_CONFIG_PATH = join(ROOT, 'src', 'pages.config.js');
const APP_JSX_PATH = join(ROOT, 'src', 'App.jsx');

/**
 * Percorre src/pages/ coletando arquivos de entrada de página.
 * Retorna um Set de chaves normalizadas (ex.: "MyPage", "SubDir/index").
 */
function collectPageFiles() {
  const pages = new Set();
  const entries = readdirSync(PAGES_DIR);

  for (const entry of entries) {
    // Ignora arquivos não-JSX (ex.: README, .DS_Store)
    if (entry.startsWith('.')) continue;

    const fullPath = join(PAGES_DIR, entry);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isFile() && entry.endsWith('.jsx')) {
      // Página direta: src/pages/MyPage.jsx → "MyPage"
      pages.add(entry.replace(/\.jsx$/, ''));
    } else if (stat.isDirectory()) {
      // Subdiretório: verifica se tem index.jsx
      try {
        statSync(join(fullPath, 'index.jsx'));
        pages.add(`${entry}/index`);
      } catch {
        // Sem index.jsx — não é página (pode conter apenas componentes)
      }
    }
  }
  return pages;
}

/**
 * Extrai todos os caminhos registrados em pages.config.js via lazy(() => import('./pages/...')).
 */
function extractFromPagesConfig() {
  const content = readFileSync(PAGES_CONFIG_PATH, 'utf-8');
  const registered = new Set();
  const regex = /import\(\s*['"]\.\/pages\/([^'"]+)['"]\s*\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    registered.add(match[1]);
  }
  return registered;
}

/**
 * Extrai páginas registradas em App.jsx — imports estáticos e lazy.
 * Cobertura: from '@/pages/...' | from './pages/...' | import('@/pages/...') | import('./pages/...')
 */
function extractFromAppJsx() {
  const content = readFileSync(APP_JSX_PATH, 'utf-8');
  const registered = new Set();

  const staticRegex = /from\s+['"](?:@\/|\.\/)pages\/([^'"]+)['"]/g;
  let match;
  while ((match = staticRegex.exec(content)) !== null) {
    registered.add(match[1]);
  }

  const lazyRegex = /import\(\s*['"](?:@\/|\.\/)pages\/([^'"]+)['"]\s*\)/g;
  while ((match = lazyRegex.exec(content)) !== null) {
    registered.add(match[1]);
  }
  return registered;
}

// ── Execução ──
const pageFiles = collectPageFiles();
const registered = new Set([
  ...extractFromPagesConfig(),
  ...extractFromAppJsx(),
]);

const unregistered = [];
for (const page of pageFiles) {
  if (registered.has(page)) continue;
  // Subdiretórios podem ser registrados sem o sufixo "/index"
  if (page.endsWith('/index')) {
    const altName = page.replace(/\/index$/, '');
    if (registered.has(altName)) continue;
  }
  unregistered.push(page);
}

if (unregistered.length > 0) {
  console.error('\n❌ Páginas não registradas em pages.config.js ou App.jsx:\n');
  for (const page of unregistered) {
    console.error(`   • src/pages/${page}.jsx`);
  }
  console.error('\n Registre cada página em src/pages.config.js seguindo o');
  console.error(' checklist no topo do arquivo, ou importe-a estaticamente em');
  console.error(' src/App.jsx (ex.: páginas de autenticação).\n');
  process.exit(1);
}

console.log(`✓ ${pageFiles.size} páginas verificadas — todas registradas.`);