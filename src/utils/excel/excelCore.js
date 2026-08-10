/**
 * Núcleo compartilhado da exportação para Excel.
 *
 * Cada tipo de registro tem um exportador sob medida em ./exporters, que
 * descreve suas abas com buildSheet() e devolve { filename, sheets }.
 * Este módulo cuida do layout (título mesclado, bloco de identificação,
 * cabeçalho de tabela com filtro), das larguras de coluna e da escrita.
 */

import * as XLSX from 'xlsx-js-style';

const OLIVE = 'BFCF99';
const NAVY = '00233B';
const WHITE = 'FFFFFF';
const LIGHT = 'F0F2F5';
const BORDER_COLOR = 'C8D0D9';

const thinBorder = {
  top: { style: 'thin', color: { rgb: BORDER_COLOR } },
  bottom: { style: 'thin', color: { rgb: BORDER_COLOR } },
  left: { style: 'thin', color: { rgb: BORDER_COLOR } },
  right: { style: 'thin', color: { rgb: BORDER_COLOR } },
};

/** Data no formato pt-BR, sem deslocamento de fuso. */
export const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';

/** Valor exibível: vazio/nulo vira traço. */
export const val = (v) => (v === null || v === undefined || v === '' ? '-' : v);

/** Booleano em texto legível. */
export const boolText = (v) => (v === true ? 'Sim' : v === false ? 'Não' : '-');

/**
 * Monta a descrição de uma aba.
 * name   → nome da aba
 * title  → título do documento (linha mesclada no topo)
 * meta   → pares [label, valor] de identificação
 * header → linha de cabeçalho da tabela (recebe filtro automático)
 * rows   → linhas de dados
 * cols   → larguras das colunas
 */
export function buildSheet({ name, title = null, meta = [], header = null, rows = [], cols = [] }) {
  title = title ?? name;
  const aoa = [];
  const merges = [];
  const boldLabels = [];
  const headerRows = [];
  const tables = [];
  const width = Math.max(cols.length, header?.length || 0, 2);

  if (title) {
    aoa.push([title]);
    merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: width - 1 } });
    aoa.push([]);
  }

  meta.forEach(([label, value]) => {
    boldLabels.push(aoa.length);
    aoa.push([label, value]);
  });

  if (header) {
    if (aoa.length) aoa.push([]);
    headerRows.push(aoa.length);
    tables.push({ r: aoa.length, rows: rows.length, width: header.length });
    aoa.push(header);
    rows.forEach((r) => aoa.push(r));
  }

  return { name, aoa, headerRows, boldLabels, tables, cols, merges, titleRow: title ? 0 : null };
}

function applyStyles(ws, { headerRows = [], boldLabels = [], cols = [], merges = [], titleRows = [], tables = [] }) {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

  // Título: faixa navy com texto branco, como o cabeçalho dos PDFs.
  titleRows.forEach((r) => {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (!ws[ref]) ws[ref] = { t: 's', v: '' };
      ws[ref].s = {
        fill: { fgColor: { rgb: NAVY } },
        font: { bold: true, sz: 14, color: { rgb: WHITE } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }
  });

  // Cabeçalho de tabela: verde-oliva com texto navy, como as tabelas dos PDFs.
  headerRows.forEach((r) => {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (ws[ref]) {
        ws[ref].s = {
          fill: { fgColor: { rgb: OLIVE } },
          font: { bold: true, color: { rgb: NAVY } },
          alignment: { horizontal: 'center', wrapText: true, vertical: 'center' },
          border: thinBorder,
        };
      }
    }
    // Filtro automático sobre a tabela — facilita a leitura de listas longas.
    if (!ws['!autofilter']) {
      ws['!autofilter'] = {
        ref: XLSX.utils.encode_range(
          { r, c: range.s.c },
          { r: range.e.r, c: range.e.c }
        ),
      };
    }
  });

  // Linhas de dados das tabelas: bordas finas + zebra suave, como nos PDFs.
  tables.forEach(({ r, rows, width }) => {
    for (let i = 1; i <= rows; i++) {
      const zebra = i % 2 === 0;
      for (let c = 0; c < width; c++) {
        const ref = XLSX.utils.encode_cell({ r: r + i, c });
        if (!ws[ref]) ws[ref] = { t: 's', v: '' };
        ws[ref].s = {
          border: thinBorder,
          font: { color: { rgb: NAVY } },
          alignment: { vertical: 'center', wrapText: true },
          ...(zebra ? { fill: { fgColor: { rgb: LIGHT } } } : {}),
        };
      }
    }
  });

  // Bloco de identificação: rótulo em navy sobre fundo claro, valor com borda.
  boldLabels.forEach((r) => {
    const labelRef = XLSX.utils.encode_cell({ r, c: 0 });
    if (ws[labelRef]) {
      ws[labelRef].s = {
        font: { bold: true, color: { rgb: NAVY } },
        fill: { fgColor: { rgb: LIGHT } },
        border: thinBorder,
        alignment: { vertical: 'center' },
      };
    }
    const valueRef = XLSX.utils.encode_cell({ r, c: 1 });
    if (!ws[valueRef]) ws[valueRef] = { t: 's', v: '' };
    ws[valueRef].s = {
      font: { color: { rgb: NAVY } },
      border: thinBorder,
      alignment: { vertical: 'center', wrapText: true },
    };
  });

  if (merges.length) ws['!merges'] = merges;
  if (cols.length) ws['!cols'] = cols.map((wch) => ({ wch }));
}

/**
 * Junta todas as seções em uma única aba, empilhadas na vertical e
 * separadas por uma linha em branco. Cada seção mantém seu título,
 * cabeçalho e destaques — apenas deixam de virar abas separadas.
 */
function mergeSheets(sheets) {
  const aoa = [];
  const headerRows = [];
  const boldLabels = [];
  const merges = [];
  const titleRows = [];
  const tables = [];
  const cols = [];

  sheets.forEach((sheet, i) => {
    if (i > 0) {
      aoa.push([]);
      aoa.push([]);
    }
    const offset = aoa.length;

    sheet.aoa.forEach((row) => aoa.push(row));
    sheet.headerRows.forEach((r) => headerRows.push(r + offset));
    sheet.boldLabels.forEach((r) => boldLabels.push(r + offset));
    (sheet.tables || []).forEach((t) => tables.push({ ...t, r: t.r + offset }));
    sheet.merges.forEach((m) =>
      merges.push({
        s: { r: m.s.r + offset, c: m.s.c },
        e: { r: m.e.r + offset, c: m.e.c },
      })
    );
    if (sheet.titleRow !== null) titleRows.push(sheet.titleRow + offset);

    sheet.cols.forEach((w, c) => {
      cols[c] = Math.max(cols[c] || 0, w);
    });
  });

  return { aoa, headerRows, boldLabels, merges, titleRows, tables, cols: cols.map((w) => w || 18) };
}

/** Gera e baixa a planilha — sempre com uma única aba. */
export function downloadExcel({ filename, sheets }) {
  const wb = XLSX.utils.book_new();
  const merged = mergeSheets(sheets);
  const ws = XLSX.utils.aoa_to_sheet(merged.aoa);
  applyStyles(ws, merged);
  XLSX.utils.book_append_sheet(wb, ws, 'Registro');
  XLSX.writeFile(wb, filename);
}

/** Caracteres proibidos em nome de aba + limite de 31 caracteres do Excel. */
function safeSheetName(name, used) {
  let base = String(name || 'Registro').replace(/[[\]:*?/\\]/g, ' ').trim().slice(0, 28) || 'Registro';
  let final = base;
  let n = 2;
  while (used.has(final)) {
    final = `${base.slice(0, 28)} ${n++}`;
  }
  used.add(final);
  return final;
}

/**
 * Gera e baixa uma planilha com várias abas — uma por registro.
 * tabs: [{ name, sheets }] onde sheets é o mesmo formato de downloadExcel.
 */
export function downloadExcelWorkbook({ filename, tabs }) {
  const wb = XLSX.utils.book_new();
  const used = new Set();
  tabs.forEach((tab) => {
    const merged = mergeSheets(tab.sheets);
    const ws = XLSX.utils.aoa_to_sheet(merged.aoa);
    applyStyles(ws, merged);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName(tab.name, used));
  });
  XLSX.writeFile(wb, filename);
}

/** Nome de arquivo padronizado: prefixo + data do registro. */
export function buildFileName(prefix, dateValue) {
  const d = dateValue ? fmtDate(dateValue).replace(/\//g, '-') : '';
  return `${prefix}${d ? `_${d}` : ''}.xlsx`;
}

/**
 * Tabela automática para listas cujo formato é livre: usa as chaves
 * presentes nos itens como colunas, com rótulos opcionais.
 */
export function autoRows(items, labels = {}) {
  const keys = [];
  items.forEach((it) => Object.keys(it || {}).forEach((k) => {
    if (!keys.includes(k)) keys.push(k);
  }));
  const header = keys.map((k) => labels[k] || k.replace(/_/g, ' '));
  const rows = items.map((it) => keys.map((k) => val(it?.[k])));
  return { header, rows, cols: keys.map(() => 18) };
}

/** Pares de identificação comuns a praticamente todos os registros. */
export function obraMeta(record) {
  return [
    ['Obra', val(record.obra_name)],
    ['Código da Obra', val(record.obra_code)],
    ['Responsável', val(record.laboratorista_name)],
  ];
}