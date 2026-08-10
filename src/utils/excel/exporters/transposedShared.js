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