/**
 * Núcleo compartilhado da exportação para Excel.
 *
 * Cada tipo de registro tem um exportador sob medida em ./exporters, que
 * descreve suas abas com buildSheet() e devolve { filename, sheets }.
 * Este módulo cuida do estilo (header verde-oliva + labels em negrito),
 * das larguras de coluna e da escrita do arquivo.
 */

import * as XLSX from 'xlsx';

const OLIVE = 'BFCF99';
const NAVY = '00233B';

/** Data no formato pt-BR, sem deslocamento de fuso. */
export const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';

/** Valor exibível: vazio/nulo vira traço. */
export const val = (v) => (v === null || v === undefined || v === '' ? '-' : v);

/** Booleano em texto legível. */
export const boolText = (v) => (v === true ? 'Sim' : v === false ? 'Não' : '-');

/**
 * Monta a descrição de uma aba.
 * meta   → pares [label, valor] no topo (labels ficam em negrito)
 * header → linha de cabeçalho da tabela (recebe fundo verde-oliva)
 * rows   → linhas de dados
 * cols   → larguras das colunas
 */
export function buildSheet({ name, meta = [], header = null, rows = [], cols = [] }) {
  const aoa = meta.map(([label, value]) => [label, value]);
  const boldLabels = meta.map((_, i) => i);
  const headerRows = [];

  if (header) {
    aoa.push([]);
    headerRows.push(aoa.length);
    aoa.push(header);
  }
  rows.forEach((r) => aoa.push(r));

  return { name, aoa, headerRows, boldLabels, cols };
}

function applyStyles(ws, { headerRows = [], boldLabels = [], cols = [] }) {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

  headerRows.forEach((r) => {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (ws[ref]) {
        ws[ref].s = {
          fill: { fgColor: { rgb: OLIVE } },
          font: { bold: true, color: { rgb: NAVY } },
          alignment: { horizontal: 'center', wrapText: true },
        };
      }
    }
  });

  boldLabels.forEach((r) => {
    const ref = XLSX.utils.encode_cell({ r, c: 0 });
    if (ws[ref]) ws[ref].s = { font: { bold: true, color: { rgb: NAVY } } };
  });

  if (cols.length) ws['!cols'] = cols.map((wch) => ({ wch }));
}

/** Gera e baixa a planilha. */
export function downloadExcel({ filename, sheets }) {
  const wb = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const ws = XLSX.utils.aoa_to_sheet(sheet.aoa);
    applyStyles(ws, sheet);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
  });

  XLSX.writeFile(wb, filename);
}

/** Nome de arquivo padronizado: prefixo + data do registro. */
export function buildFileName(prefix, dateValue) {
  const d = dateValue ? fmtDate(dateValue).replace(/\//g, '-') : '';
  return `${prefix}${d ? `_${d}` : ''}.xlsx`;
}

/** Pares de identificação comuns a praticamente todos os registros. */
export function obraMeta(record) {
  return [
    ['Obra', val(record.obra_name)],
    ['Código da Obra', val(record.obra_code)],
    ['Responsável', val(record.laboratorista_name)],
  ];
}