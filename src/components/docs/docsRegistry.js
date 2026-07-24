// Registro dos documentos de src/docs via Vite glob.
// Com assetsInclude (**/*.md) no vite.config.js, cada import resolve para a
// URL do asset; o conteúdo é obtido via fetch — funciona em dev e em produção.
const assetModules = import.meta.glob('/src/docs/**/*.md');

const modules = Object.fromEntries(
  Object.entries(assetModules).map(([path, load]) => [
    path,
    async () => {
      const mod = await load();
      const res = await fetch(mod.default);
      return res.text();
    },
  ])
);

export const FOLDER_ORDER = ['raiz', 'arquitetura', 'governanca', 'negocio', 'testes'];

export const FOLDER_LABELS = {
  raiz: 'Documento Principal (raiz)',
  arquitetura: 'Arquitetura',
  governanca: 'Governança',
  negocio: 'Negócio',
  testes: 'Testes',
};

export function getDocsByFolder() {
  const groups = {};
  Object.entries(modules).forEach(([path, loader]) => {
    const rel = path.replace('/src/docs/', '');
    const parts = rel.split('/');
    const folder = parts.length === 1 ? 'raiz' : parts[0];
    if (!groups[folder]) groups[folder] = [];
    groups[folder].push({ rel, name: parts[parts.length - 1], loader });
  });
  Object.values(groups).forEach((list) => list.sort((a, b) => a.rel.localeCompare(b.rel)));
  return groups;
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Junta vários arquivos em um único .md com separadores identificando cada arquivo.
export async function buildBundle(files) {
  const parts = await Promise.all(
    files.map(async (f) => {
      const content = await f.loader();
      return `\n\n---\n\n<!-- ══════ ARQUIVO: ${f.rel} ══════ -->\n\n${content}`;
    })
  );
  return parts.join('\n');
}