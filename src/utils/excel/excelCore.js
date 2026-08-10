/**
 * Núcleo compartilhado da exportação para Excel.
 *
 * Cada tipo de registro tem um exportador sob medida em ./exporters, que
 * descreve suas seções com buildSheet() e devolve { filename, sheets }.
 * Este módulo reproduz a anatomia dos PDFs do sistema:
 *   1. Faixa navy da empresa (como a barra do logo)
 *   2. Título do documento (como o cabeçalho central do PDF)
 *   3. Grade de identificação (pares rótulo/valor, 2 por linha, como o
 *      bloco "Dados da Obra" dos relatórios)
 *   4. Seções com faixa verde-oliva (como os títulos de seção dos PDFs)
 *   5. Tabelas com cabeçalho oliva, bordas e zebrado
 *   6. Rodapé de assinaturas (Laboratorista | Responsável | Cliente)
 */

import * as XLSX from 'xlsx-js-style';

const OLIVE = 'BFCF99';
const NAVY = '00233B';
const WHITE = 'FFFFFF';
const LIGHT = 'F0F2F5';
const BORDER_COLOR = 'C8D0D9';
const COMPANY = 'AFIRMA EVIAS — ENGENHARIA VIÁRIA';

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

/** Valores longos ocupam a linha inteira, como as observações nos PDFs. */
const isLong = (v) => String(v ?? '').length > 60;

/**
 * Monta a descrição de uma seção.
 * name   → nome da seção (vira faixa de título)
 * title  → título alternativo (linha mesclada no topo da seção)
 * meta   → pares [label, valor] de identificação (renderizados em grade 2x2)
 * header → linha de cabeçalho da tabela (recebe filtro automático)
 * rows   → linhas de dados
 * cols   → larguras das colunas
 */
export function buildSheet({ name, title = null, meta = [], header = null, rows = [], cols = [] }) {
  title = title ?? name;
  const aoa = [];
  const merges = [];
  const labelCells = [];
  const valueCells = [];
  const headerRows = [];
  const tables = [];
  const gridWidth = 4;
  const width = Math.max(cols.length, header?.length || 0, meta.length ? gridWidth : 0, 2);

  if (title) {
    aoa.push([title]);
    aoa.push([]);
  }

  // Grade de identificação: 2 pares por linha, como o bloco de dados dos PDFs.
  // Valores longos ganham linha inteira (valor mesclado até a última coluna da grade).
  let i = 0;
  while (i < meta.length) {
    const [l1, v1] = meta[i];
    const next = meta[i + 1];
    if (isLong(v1) || !next || isLong(next[1])) {
      const r = aoa.length;
      labelCells.push({ r, c: 0 });
      valueCells.push({ r, c: 1 });
      merges.push({ s: { r, c: 1 }, e: { r, c: gridWidth - 1 } });
      aoa.push([l1, v1]);
      i += 1;
    } else {
      const r = aoa.length;
      labelCells.push({ r, c: 0 }, { r, c: 2 });
      valueCells.push({ r, c: 1 }, { r, c: 3 });
      aoa.push([l1, v1, next[0], next[1]]);
      i += 2;
    }
  }

  if (header) {
    if (aoa.length) aoa.push([]);
    headerRows.push(aoa.length);
    tables.push({ r: aoa.length, rows: rows.length, width: header.length });
    aoa.push(header);
    rows.forEach((r) => aoa.push(r));
  }

  // Larguras: seções só de identificação usam a grade padrão; seções com
  // tabela garantem o mínimo da grade nas 4 primeiras colunas.
  let finalCols = cols;
  if (meta.length && !header) {
    finalCols = [24, 42, 24, 42];
  } else if (meta.length) {
    finalCols = [...cols];
    [22, 30, 22, 30].forEach((min, c) => {
      finalCols[c] = Math.max(finalCols[c] || 0, min);
    });
  }

  return { name, aoa, headerRows, labelCells, valueCells, tables, cols: finalCols, merges, titleRow: title ? 0 : null };
}

/**
 * Rodapé de aprovação/assinaturas, espelhando o SignatureFooter dos PDFs
 * (Laboratorista | Responsável pela Aprovação | Cliente).
 */
export function assinaturasSheet(record) {
  const status =
    record.approved === true ? 'Aprovado' : record.approved === false ? 'Reprovado' : 'Pendente';
  const ap = record.approver_details || {};
  const cs = record.client_signature || {};
  const meta = [['Status de Aprovação', status]];
  if (record.rejection_reason) meta.push(['Motivo da Reprovação', record.rejection_reason]);

  return buildSheet({
    name: 'Assinaturas',
    meta,
    header: ['', 'Laboratorista', 'Responsável', 'Cliente'],
    rows: [
      ['Nome', val(record.laboratorista_name), val(ap.name), val(cs.engineer_name)],
      ['E-mail', val(record.created_by), val(record.approved_by), val(cs.signed_by)],
      ['Cargo / CREA', '-', val(ap.crea_number || ap.position), val(cs.crea_number)],
      ['Data', fmtDate(record.created_date), fmtDate(record.approved_date), fmtDate(cs.signed_date)],
    ],
    cols: [16, 30, 30, 30],
  });
}

function applyStyles(ws, {
  companyRow = null, titleRows = [], sectionRows = [], headerRows = [],
  labelCells = [], valueCells = [], tables = [], cols = [], merges = [],
}) {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

  const bandStyle = (fill, fontColor, sz) => ({
    fill: { fgColor: { rgb: fill } },
    font: { bold: true, sz, color: { rgb: fontColor } },
    alignment: { horizontal: 'center', vertical: 'center' },
  });

  const styleBand = (r, style) => {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (!ws[ref]) ws[ref] = { t: 's', v: '' };
      ws[ref].s = style;
    }
  };

  // Faixa da empresa: navy com texto branco, como a barra do logo dos PDFs.
  if (companyRow !== null) styleBand(companyRow, bandStyle(NAVY, WHITE, 12));

  // Título do documento: destaque navy, como o cabeçalho central do PDF.
  titleRows.forEach((r) => styleBand(r, bandStyle(NAVY, WHITE, 14)));

  // Títulos de seção: faixa verde-oliva, como os títulos de seção dos PDFs.
  sectionRows.forEach((r) => styleBand(r, bandStyle(OLIVE, NAVY, 11)));

  // Cabeçalho de tabela: verde-oliva com texto navy e bordas.
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

  // Grade de identificação: rótulo destacado + valor com borda.
  labelCells.forEach(({ r, c }) => {
    const ref = XLSX.utils.encode_cell({ r, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = {
      font: { bold: true, color: { rgb: NAVY } },
      fill: { fgColor: { rgb: LIGHT } },
      border: thinBorder,
      alignment: { vertical: 'center' },
    };
  });
  valueCells.forEach(({ r, c }) => {
    const ref = XLSX.utils.encode_cell({ r, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: '' };
    ws[ref].s = {
      font: { color: { rgb: NAVY } },
      border: thinBorder,
      alignment: { vertical: 'center', wrapText: true },
    };
  });

  if (merges.length) ws['!merges'] = merges;
  if (cols.length) ws['!cols'] = cols.map((wch) => ({ wch }));
}

/**
 * Junta todas as seções em uma única aba, empilhadas na vertical, com a
 * faixa da empresa no topo — reproduzindo a página do PDF.
 */
function mergeSheets(sheets) {
  const aoa = [[COMPANY]];
  const companyRow = 0;
  const headerRows = [];
  const labelCells = [];
  const valueCells = [];
  const merges = [];
  const titleRows = [];
  const sectionRows = [];
  const tables = [];
  const cols = [];

  sheets.forEach((sheet, i) => {
    aoa.push([]);
    const offset = aoa.length;

    sheet.aoa.forEach((row) => aoa.push(row));
    sheet.headerRows.forEach((r) => headerRows.push(r + offset));
    (sheet.labelCells || []).forEach(({ r, c }) => labelCells.push({ r: r + offset, c }));
    (sheet.valueCells || []).forEach(({ r, c }) => valueCells.push({ r: r + offset, c }));
    (sheet.tables || []).forEach((t) => tables.push({ ...t, r: t.r + offset }));
    sheet.merges.forEach((m) =>
      merges.push({
        s: { r: m.s.r + offset, c: m.s.c },
        e: { r: m.e.r + offset, c: m.e.c },
      })
    );
    // Primeira seção = título do documento; demais = faixas de seção.
    if (sheet.titleRow !== null) {
      (i === 0 ? titleRows : sectionRows).push(sheet.titleRow + offset);
    }

    sheet.cols.forEach((w, c) => {
      cols[c] = Math.max(cols[c] || 0, w);
    });
  });

  // Faixas (empresa, título e seções) mescladas na largura total do documento.
  const width = Math.max(cols.length, 2);
  [companyRow, ...titleRows, ...sectionRows].forEach((r) => {
    merges.push({ s: { r, c: 0 }, e: { r, c: width - 1 } });
  });

  return {
    aoa, companyRow, headerRows, labelCells, valueCells, merges,
    titleRows, sectionRows, tables, cols: cols.map((w) => w || 18),
  };
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