/**
 * Helper para montar seções de Excel com layout customizado (tabelas
 * transpostas, cabeçalhos duplos com mesclas), produzindo o mesmo formato
 * de objeto que o excelCore.mergeSheets consome — sem alterar o excelCore.
 *
 * Índices em `headerRows`, `tables`, `merges`, `labelCells` e `valueCells`
 * são relativos ao início de `body` (0-based); o helper aplica o
 * deslocamento do título automaticamente.
 */
export function rawSheet({
  name,
  title = null,
  body = [],
  headerRows = [],
  tables = [],
  merges = [],
  cols = [],
  labelCells = [],
  valueCells = [],
}) {
  const offset = title ? 2 : 0;
  const aoa = title ? [[title], []] : [];
  body.forEach((r) => aoa.push(r));
  return {
    name,
    aoa,
    headerRows: headerRows.map((r) => r + offset),
    labelCells: labelCells.map(({ r, c }) => ({ r: r + offset, c })),
    valueCells: valueCells.map(({ r, c }) => ({ r: r + offset, c })),
    tables: tables.map((t) => ({ ...t, r: t.r + offset })),
    merges: merges.map((m) => ({
      s: { r: m.s.r + offset, c: m.s.c },
      e: { r: m.e.r + offset, c: m.e.c },
    })),
    cols,
    titleRow: title ? 0 : null,
  };
}

/** Células de uma linha inteira, para destacar linhas de resultado em negrito. */
export function boldRowCells(rowIndex, width) {
  return Array.from({ length: width }, (_, c) => ({ r: rowIndex, c }));
}

/**
 * Tabela transposta de parâmetros, como nos PDFs de taxa/ensaio:
 * linhas = parâmetros (rótulo | cálculo | unidade), colunas = determinações.
 *
 * rows: [{ label, calc, unit, values: [], bold }]
 */
export function paramSheet({
  name,
  title = null,
  columns = [],
  rows = [],
  labelHeader = 'PARÂMETRO',
  labelWidth = 30,
  colWidth = 12,
}) {
  if (!rows.length) return null;
  const width = 3 + columns.length;
  const body = [
    [labelHeader, 'CÁLCULOS', 'UNIDADE', ...columns],
    ...rows.map((r) => [
      r.label,
      r.calc ?? '–',
      r.unit ?? '–',
      ...columns.map((_, i) => (r.values?.[i] === undefined ? '-' : r.values[i])),
    ]),
  ];

  const labelCells = rows.map((_, i) => ({ r: 1 + i, c: 0 }));
  rows.forEach((r, i) => {
    if (r.bold) labelCells.push(...boldRowCells(1 + i, width));
  });

  return rawSheet({
    name,
    title,
    body,
    headerRows: [0],
    tables: [{ r: 0, rows: rows.length, width }],
    labelCells,
    cols: [labelWidth, 22, 12, ...columns.map(() => colWidth)],
  });
}

/**
 * Tabela com cabeçalho de dois níveis e grupos mesclados, como as tabelas
 * de bordos (Viga Benkelman) e de agregados (Granulometria Individual).
 *
 * leftCols: [{ label, width }] colunas fixas à esquerda (mescladas nas 2 linhas)
 * groups:   [{ label, subs: [string] }] grupos com subcolunas
 * rows:     matriz já na ordem [ ...esquerda, ...grupos ]
 */
export function groupedSheet({ name, title = null, leftCols = [], groups = [], rows = [], subWidth = 12 }) {
  if (!rows.length) return null;
  const width = leftCols.length + groups.reduce((s, g) => s + g.subs.length, 0);

  const top = leftCols.map((c) => c.label);
  const sub = leftCols.map(() => '');
  const merges = leftCols.map((_, c) => ({ s: { r: 0, c }, e: { r: 1, c } }));

  let c = leftCols.length;
  groups.forEach((g) => {
    top.push(g.label, ...g.subs.slice(1).map(() => ''));
    sub.push(...g.subs);
    if (g.subs.length > 1) merges.push({ s: { r: 0, c }, e: { r: 0, c: c + g.subs.length - 1 } });
    c += g.subs.length;
  });

  return rawSheet({
    name,
    title,
    body: [top, sub, ...rows],
    headerRows: [0, 1],
    tables: [{ r: 1, rows: rows.length, width }],
    merges,
    labelCells: rows.map((_, i) => ({ r: 2 + i, c: 0 })),
    cols: [...leftCols.map((lc) => lc.width || 16), ...groups.flatMap((g) => g.subs.map(() => subWidth))],
  });
}