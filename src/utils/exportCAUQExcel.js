/**
 * exportCAUQExcel.js
 * Gera planilha XLSX com o mesmo visual do relatório PDF do EnsaioCAUQ.
 * Usa a lib `xlsx` (SheetJS) já instalada no projeto.
 */

import * as XLSX from 'xlsx';
import { calcularGranulometria, calcularMedia, formatDate, PENEIRAS_CONFIG } from './relatorioCAUQUtils';
import {
  estáForaDaFaixa,
  estáAbaixoMin,
  estáForaDaFaixaMinMax,
  fmtNum,
  temDadosRTCD,
  temDadosEstabilidade,
  extrairConstPrensa,
} from './relatorioCAUQTabelasUtils';

// ─── Constantes de estilo ────────────────────────────────────────────────────

const NAVY   = '00233B';
const GREY_H = 'CBD5E1'; // slate-300 — cabeçalhos de seção
const GREY_L = 'F1F5F9'; // slate-100 — linhas alternadas
const WHITE  = 'FFFFFF';
const RED    = 'DC2626';
const BLUE_L = 'DBEAFE'; // blue-100
const BLUE_T = '1D4ED8'; // blue-700

const font      = { name: 'Arial', sz: 9 };
const fontBold  = { ...font, bold: true };
const fontSmall = { ...font, sz: 8 };
const fontTitle = { name: 'Arial', sz: 11, bold: true };

function cell(v, opts = {}) {
  return { v, t: typeof v === 'number' ? 'n' : 's', ...opts };
}

function styleHeader(text, bgColor = NAVY) {
  return {
    v: text, t: 's',
    s: {
      font: { ...fontBold, color: { rgb: 'FFFFFF' }, sz: 10 },
      fill: { fgColor: { rgb: bgColor } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: allBorder(),
    },
  };
}

function styleSubHeader(text) {
  return {
    v: text, t: 's',
    s: {
      font: fontBold,
      fill: { fgColor: { rgb: GREY_H } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: allBorder(),
    },
  };
}

function styleCell(v, opts = {}) {
  const { bold = false, red = false, blue = false, bg = WHITE, align = 'center' } = opts;
  return {
    v: v ?? '-', t: 's',
    s: {
      font: {
        ...font,
        bold,
        color: { rgb: red ? RED : blue ? BLUE_T : '000000' },
      },
      fill: { fgColor: { rgb: bg } },
      alignment: { horizontal: align, vertical: 'center', wrapText: true },
      border: allBorder(),
    },
  };
}

function styleLabelCell(text) {
  return {
    v: text, t: 's',
    s: {
      font: fontBold,
      fill: { fgColor: { rgb: GREY_L } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border: allBorder(),
    },
  };
}

function allBorder() {
  const b = { style: 'thin', color: { rgb: '94A3B8' } };
  return { top: b, bottom: b, left: b, right: b };
}

// ─── Helpers de coordenada ────────────────────────────────────────────────────

function addr(col, row) {
  // col: 0-indexed → A, B, C…
  const colLetter = XLSX.utils.encode_col(col);
  return `${colLetter}${row + 1}`;
}

function setCell(ws, col, row, cellObj) {
  const key = addr(col, row);
  ws[key] = cellObj;
}

function merge(ws, r1, c1, r2, c2) {
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
}

// ─── Construtor principal ─────────────────────────────────────────────────────

/**
 * Gera e faz download do arquivo XLSX para o EnsaioCAUQ.
 * @param {{ ensaio, obra, regional, project, faixa }} dados
 */
export function exportarCAUQExcel({ ensaio, obra, regional, project, faixa }) {
  const wb = XLSX.utils.book_new();
  const ws = {};

  let row = 0; // linha atual (0-indexed)

  // ── 1. CABEÇALHO ─────────────────────────────────────────────────────────
  // linha 0: título principal
  const tituloTexto = ensaio.realizar_marshall || ensaio.realizar_densidade_rice
    ? 'ENSAIO DE EXTRAÇÃO E GRANULOMETRIA / PARÂMETROS MARSHALL E DENSIDADE RICE'
    : 'ENSAIO DE EXTRAÇÃO E GRANULOMETRIA';

  setCell(ws, 0, row, styleHeader(tituloTexto, NAVY));
  merge(ws, row, 0, row, 11);
  row++;

  // linha 1: dados da obra
  const obraInfo = `Obra: ${obra?.name || '-'}  |  Rodovia: ${ensaio.rodovia || '-'}  |  Trecho: ${ensaio.trecho || '-'}`;
  setCell(ws, 0, row, styleCell(obraInfo, { align: 'left', bg: GREY_L }));
  merge(ws, row, 0, row, 7);
  setCell(ws, 8, row, styleCell(`Data: ${formatDate(ensaio.data_ensaio)}`, { bold: true, align: 'center', bg: GREY_L }));
  merge(ws, row, 8, row, 11);
  row++;

  // linha 2: laboratorista / usina / placa
  const labInfo = `Laboratorista: ${ensaio.laboratorista_name || '-'}  |  Usina: ${ensaio.usina_fornecedora || '-'}  |  Placa: ${ensaio.placa_caminhao || '-'}`;
  setCell(ws, 0, row, styleCell(labInfo, { align: 'left', bg: GREY_L }));
  merge(ws, row, 0, row, 11);
  row++;

  // ── 2. SEÇÃO DADOS DO ENSAIO ─────────────────────────────────────────────
  setCell(ws, 0, row, styleHeader('DADOS DO ENSAIO'));
  merge(ws, row, 0, row, 11);
  row++;

  // ── 3. GRANULOMETRIA ─────────────────────────────────────────────────────
  const dadosGran = calcularGranulometria(ensaio, faixa, project);

  // Sub-header granulometria
  setCell(ws, 0, row, styleSubHeader('ENSAIO DE GRANULOMETRIA - DNIT 412/2025'));
  merge(ws, row, 0, row, 7);
  setCell(ws, 8, row, styleSubHeader('EXTRAÇÃO LIGANTE (ROTAREX)\nABNT NBR 16208/2013'));
  merge(ws, row, 8, row, 11);
  row++;

  // Cabeçalho das colunas granulometria
  const granHeaders = [
    'PENEIRAS ASTM (mm)', 'RETIDO (g)', 'PASS. (g)', '% PASS.',
    'FX. TRAB. MÍN. (%)', 'FX. TRAB. MÁX. (%)', 'FX. ESP. MÍN. (%)', 'FX. ESP. MÁX. (%)',
  ];
  granHeaders.forEach((h, c) => {
    setCell(ws, c, row, styleSubHeader(h));
  });
  // Cabeçalho extração
  setCell(ws, 8, row,  styleSubHeader('PARÂMETRO'));
  setCell(ws, 9, row,  styleSubHeader('VALOR'));
  merge(ws, row, 9, row, 11);
  row++;

  // Linhas granulometria + extração lado a lado
  const extracaoLinhas = buildExtracaoLinhas(ensaio, project);
  const maxLinhas = Math.max(dadosGran.length, extracaoLinhas.length);

  for (let i = 0; i < maxLinhas; i++) {
    const g = dadosGran[i];
    const e = extracaoLinhas[i];
    const bg = i % 2 === 0 ? WHITE : GREY_L;

    if (g) {
      const foraFaixa = estáForaDaFaixa(g.percentualPassante, g.faixaTrabalhoMin, g.faixaTrabalhoMax);
      setCell(ws, 0, row, styleCell(g.astm,                { bold: true, bg, align: 'center' }));
      setCell(ws, 1, row, styleCell(String(g.retido),       { bg }));
      setCell(ws, 2, row, styleCell(String(g.passante),     { bg }));
      setCell(ws, 3, row, styleCell(String(g.percentualPassante), { bold: true, red: foraFaixa, bg }));
      setCell(ws, 4, row, styleCell(fmtNum(g.faixaTrabalhoMin, 1), { bg }));
      setCell(ws, 5, row, styleCell(fmtNum(g.faixaTrabalhoMax, 1), { bg }));
      setCell(ws, 6, row, styleCell(fmtNum(g.limiteMin, 1), { bg }));
      setCell(ws, 7, row, styleCell(fmtNum(g.limiteMax, 1), { bg }));
    } else {
      for (let c = 0; c < 8; c++) setCell(ws, c, row, styleCell('', { bg }));
    }

    if (e) {
      setCell(ws, 8,  row, styleLabelCell(e.label));
      setCell(ws, 9,  row, styleCell(e.value, { bold: e.bold, red: e.red, blue: e.blue, bg }));
      merge(ws, row, 9, row, 11);
    } else {
      setCell(ws, 8,  row, styleCell('', { bg }));
      setCell(ws, 9,  row, styleCell('', { bg }));
      merge(ws, row, 9, row, 11);
    }

    row++;
  }

  // ── 4. MARSHALL ──────────────────────────────────────────────────────────
  if (ensaio.realizar_marshall) {
    row++; // espaço
    setCell(ws, 0, row, styleHeader('ENSAIO MARSHALL - MÉTODO DE ENSAIO DNIT 447/2024'));
    merge(ws, row, 0, row, 11);
    row++;

    // Cabeçalho CPs
    setCell(ws, 0, row, styleSubHeader('CORPO DE PROVA'));
    setCell(ws, 1, row, styleSubHeader('UN.'));
    for (let n = 1; n <= 6; n++) {
      setCell(ws, 1 + n, row, styleSubHeader(String(n)));
    }
    setCell(ws, 8,  row, styleSubHeader('MÉDIA'));
    setCell(ws, 9,  row, styleSubHeader('PROJ.'));
    setCell(ws, 10, row, styleSubHeader('MÍN.'));
    setCell(ws, 11, row, styleSubHeader('MÁX.'));
    row++;

    const cpsValidos = (ensaio.corpos_prova_marshall || []).slice(0, 6);
    const media = (campo) => calcularMedia(cpsValidos, campo);

    const marshallRows = buildMarshallRows(ensaio, project, cpsValidos, media);
    marshallRows.forEach(({ label, un, values, mediaVal, proj, min, max, mediaRed, bg: rowBg }, i) => {
      const bg = rowBg || (i % 2 === 0 ? WHITE : GREY_L);
      setCell(ws, 0, row, styleLabelCell(label));
      setCell(ws, 1, row, styleCell(un, { bg }));
      for (let c = 0; c < 6; c++) {
        setCell(ws, 2 + c, row, styleCell(values[c] ?? '-', { bg }));
      }
      setCell(ws, 8,  row, styleCell(mediaVal, { bold: true, red: mediaRed, bg }));
      setCell(ws, 9,  row, styleCell(proj,     { bg }));
      setCell(ws, 10, row, styleCell(min,      { bg }));
      setCell(ws, 11, row, styleCell(max,      { bg }));
      row++;
    });
  }

  // ── 5. DENSIDADE RICE ────────────────────────────────────────────────────
  if (ensaio.realizar_marshall && ensaio.densidade_rice) {
    row++;
    setCell(ws, 0, row, styleHeader('ENSAIO DE DENSIDADE RICE (DMT) - DNIT 427/20 - ABNT NBR 15619/16'));
    merge(ws, row, 0, row, 11);
    row++;

    const riceFields = [
      { label: 'FR+ÁGUA (g)',          val: ensaio.densidade_rice.frasco_agua         },
      { label: 'AMOSTRA (g)',           val: ensaio.densidade_rice.amostra             },
      { label: 'FR+ÁGUA+AMOSTRA (g)',   val: ensaio.densidade_rice.frasco_agua_amostra },
      { label: 'TEMP. ÁGUA (°C)',       val: ensaio.densidade_rice.temperatura_agua    },
      { label: 'DENS. ÁGUA (g/cm³)',    val: ensaio.densidade_rice.densidade_agua      },
      { label: 'DENS. RICE (g/cm³)',    val: ensaio.densidade_rice.densidade_rice, bold: true },
    ];

    // 2 colunas por campo (label + valor) → 6 pares em 12 colunas
    riceFields.forEach(({ label, val, bold }, i) => {
      const col = i * 2;
      setCell(ws, col,     row, styleLabelCell(label));
      setCell(ws, col + 1, row, styleCell(String(val ?? '-'), { bold }));
    });
    row++;
  }

  // ── 6. OBSERVAÇÕES ───────────────────────────────────────────────────────
  if (ensaio.observacoes) {
    row++;
    setCell(ws, 0, row, styleSubHeader('OBSERVAÇÕES'));
    merge(ws, row, 0, row, 11);
    row++;
    setCell(ws, 0, row, {
      v: ensaio.observacoes, t: 's',
      s: {
        font,
        fill: { fgColor: { rgb: WHITE } },
        alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
        border: allBorder(),
      },
    });
    merge(ws, row, 0, row, 11);
    row++;
  }

  // ── Larguras de colunas ──────────────────────────────────────────────────
  ws['!cols'] = [
    { wch: 22 }, // A — peneira / label
    { wch: 8  }, // B
    { wch: 9  }, // C
    { wch: 9  }, // D
    { wch: 10 }, // E
    { wch: 10 }, // F
    { wch: 10 }, // G
    { wch: 10 }, // H
    { wch: 20 }, // I — parâmetro extração / marshall label
    { wch: 10 }, // J
    { wch: 10 }, // K
    { wch: 10 }, // L
  ];

  // ── Ref ──────────────────────────────────────────────────────────────────
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: 11 } });

  const nomeArquivo = `CAUQ_${ensaio.id?.slice(-6) || 'ensaio'}_${ensaio.data_ensaio || 'data'}.xlsx`;
  XLSX.utils.book_append_sheet(wb, ws, 'Ensaio CAUQ');
  XLSX.writeFile(wb, nomeArquivo);
}

// ─── Helpers de construção de linhas ─────────────────────────────────────────

function buildExtracaoLinhas(ensaio, project) {
  const linhas = [];
  const ex = ensaio.extracao_ligante;

  linhas.push({ label: 'TEMP. CAP (°C)', value: String(ensaio.temperatura_cap || '-') });
  linhas.push({ label: 'TIPO LIGANTE',   value: ensaio.tipo_ligante || '-' });

  if (ex) {
    linhas.push({ label: 'AM. C/ LIG. (g)', value: String(ex.amostra_com_ligante || '-') });
    linhas.push({ label: 'AM. S/ LIG. (g)', value: String(ex.amostra_sem_ligante || '-') });
    linhas.push({ label: 'FAT. CORREÇÃO',   value: String(ex.fator_correcao || '1.0000') });
    linhas.push({ label: 'PESO LIG. (g)',   value: String(ex.peso_ligante || '-') });

    const teorRed = estáForaDaFaixa(ex.teor_ligante, project?.teor_ligante?.min, project?.teor_ligante?.max);
    linhas.push({ label: 'TEOR LIG. (%)', value: `${ex.teor_ligante || '-'}%`, bold: true, red: teorRed });
    linhas.push({ label: 'FILLER/BETUME', value: String(ex.filler_betume || '-'), bold: true });

    if (ex.teor_ligante_real) {
      const realRed = estáForaDaFaixa(ex.teor_ligante_real, project?.teor_ligante?.min, project?.teor_ligante?.max);
      linhas.push({ label: 'TEOR LIG. REAL (%)', value: `${ex.teor_ligante_real}%`, bold: true, red: realRed, blue: !realRed });
    }
    if (ex.amostra_umida) {
      linhas.push({ label: 'UMIDADE (%)', value: `${ex.umidade || 0}%`, bold: true, blue: true });
    }
  }

  return linhas;
}

function buildMarshallRows(ensaio, project, cpsValidos, media) {
  const cpVals = (campo) => Array.from({ length: 6 }, (_, i) => {
    const v = cpsValidos[i]?.[campo];
    return v != null ? String(v) : '-';
  });

  const rows = [];

  // Linhas simples
  [
    { label: 'PESO AR',     un: 'g',   campo: 'peso_ar'     },
    { label: 'PESO IMERSO', un: 'g',   campo: 'peso_imerso' },
    { label: 'PESO SSS',    un: 'g',   campo: 'peso_sss'    },
    { label: 'VOLUME',      un: 'cm³', campo: 'volume'      },
  ].forEach(({ label, un, campo }, i) => {
    rows.push({ label, un, values: cpVals(campo), mediaVal: '-', proj: '-', min: '-', max: '-', bg: i % 2 === 0 ? WHITE : GREY_L });
  });

  // Densidade aparente
  const densMediaRed = false;
  rows.push({
    label: 'DENSIDADE APARENTE', un: 'g/cm³',
    values: cpVals('densidade_aparente'),
    mediaVal: media('densidade_aparente'),
    proj: String(project?.massa_especifica_aparente || '-'), min: '-', max: '-',
    mediaRed: densMediaRed, bg: WHITE,
  });

  // Volume de vazios
  const vvMedia = media('volume_vazios');
  const vvRed = estáForaDaFaixa(vvMedia, project?.volume_vazios?.min, project?.volume_vazios?.max);
  rows.push({
    label: 'VOLUME DE VAZIOS', un: '%',
    values: cpVals('volume_vazios'),
    mediaVal: vvMedia, mediaRed: vvRed,
    proj: fmtNum(project?.volume_vazios?.otimo, 1),
    min: fmtNum(project?.volume_vazios?.min, 1),
    max: fmtNum(project?.volume_vazios?.max, 1),
    bg: GREY_L,
  });

  // VCB
  rows.push({ label: 'V.C.B.', un: '%', values: cpVals('vcb'), mediaVal: '-', proj: '-', min: '-', max: '-', bg: WHITE });

  // VAM
  rows.push({
    label: 'V.A.M.', un: '%',
    values: cpVals('vam'),
    mediaVal: '-',
    proj: fmtNum(project?.vam?.projeto, 1),
    min: fmtNum(project?.vam?.min, 1), max: '-', bg: GREY_L,
  });

  // RBV
  rows.push({
    label: 'R.B.V.', un: '%',
    values: cpVals('rbv'),
    mediaVal: '-',
    proj: fmtNum(project?.rbv?.projeto, 1),
    min: fmtNum(project?.rbv?.min, 1),
    max: fmtNum(project?.rbv?.max, 1),
    bg: WHITE,
  });

  // Altura
  rows.push({ label: 'ALTURA', un: 'cm', values: cpVals('altura'), mediaVal: '-', proj: '-', min: '-', max: '-', bg: GREY_L });

  // RTCD / Estabilidade
  const temDiam = temDadosRTCD(cpsValidos);
  const temEstab = temDadosEstabilidade(cpsValidos);
  const constPrensa = extrairConstPrensa(cpsValidos);

  if (temDiam || temEstab) {
    rows.push({ label: 'CONST. PRENSA', un: '-', values: Array(6).fill(constPrensa), mediaVal: '-', proj: '-', min: '-', max: '-', bg: WHITE });
  }

  if (temDiam) {
    rows.push({ label: 'LEITURA RTCD', un: 'Kgf/cm²', values: cpVals('rtcd_leitura'), mediaVal: '-', proj: '-', min: '-', max: '-', bg: GREY_L });
    const rtcdMedia = media('rtcd_valor');
    const rtcdRed = project?.rtcd && rtcdMedia !== '-' && estáAbaixoMin(rtcdMedia, project.rtcd.min);
    rows.push({
      label: 'RTCD', un: 'MPa',
      values: cpVals('rtcd_valor'),
      mediaVal: rtcdMedia, mediaRed: rtcdRed,
      proj: '-',
      min: project?.rtcd?.min ? fmtNum(project.rtcd.min, 1) : '-', max: '-',
      bg: WHITE,
    });
  }

  if (temEstab) {
    rows.push({ label: 'LEITURA ESTAB.', un: 'Kgf/cm²', values: cpVals('estabilidade_leitura'), mediaVal: '-', proj: '-', min: '-', max: '-', bg: GREY_L });
    const estabMedia = media('estabilidade_corrigida');
    const estabRed = project?.estabilidade && estabMedia !== '-' && estáAbaixoMin(estabMedia, project.estabilidade.min);
    rows.push({
      label: 'ESTABILIDADE CORRIG.', un: 'Kgf/cm²',
      values: cpVals('estabilidade_corrigida'),
      mediaVal: estabMedia, mediaRed: estabRed,
      proj: project?.estabilidade?.projeto ? fmtNum(project.estabilidade.projeto, 1) : '-',
      min: project?.estabilidade?.min ? fmtNum(project.estabilidade.min, 1) : '-', max: '-',
      bg: WHITE,
    });

    const fluMedia = media('fluencia');
    const fluRed = project?.fluencia && fluMedia !== '-' && estáForaDaFaixaMinMax(fluMedia, project.fluencia.min, project.fluencia.max);
    rows.push({
      label: 'FLUÊNCIA', un: 'mm',
      values: cpVals('fluencia'),
      mediaVal: fluMedia, mediaRed: fluRed,
      proj: project?.fluencia?.projeto ? fmtNum(project.fluencia.projeto, 1) : '-',
      min: project?.fluencia?.min ? fmtNum(project.fluencia.min, 1) : '-',
      max: project?.fluencia?.max ? fmtNum(project.fluencia.max, 1) : '-',
      bg: GREY_L,
    });
  }

  return rows;
}