import { buildSheet, buildFileName, fmtDate, val, boolText, obraMeta } from '../excelCore';
import { rawSheet, boldRowCells } from './transposedShared';
import { fmtN } from '@/utils/relatorioProctorUtils';

/**
 * Compactação — modo Higroscópico, clone da tabela transposta do PDF:
 * colunas = Umidade Higroscópica (Am.1/Am.2) + N cilindros + trio Cilindros.
 */
function compactacaoHigroSheet(ensaio) {
  const u0 = (ensaio.umidades || [])[0] || {};
  const densidades = ensaio.densidades || [];
  const N = densidades.length;
  if (!N) return null;

  const width = 7 + N;
  const base = 4 + N;

  const higRows = [
    ['Cápsula Nº', u0.capsula_numero_1 || '-', u0.capsula_numero_2 || '-'],
    ['C+S+A (g)', fmtN(u0.capsula_solo_umido_1), fmtN(u0.capsula_solo_umido_2)],
    ['C+S (g)', fmtN(u0.capsula_solo_seco_1), fmtN(u0.capsula_solo_seco_2)],
    ['A - Água (g)', fmtN(u0.capsula_solo_umido_1 - u0.capsula_solo_seco_1), fmtN(u0.capsula_solo_umido_2 - u0.capsula_solo_seco_2)],
    ['C - Cápsula (g)', fmtN(u0.peso_capsula_1), fmtN(u0.peso_capsula_2)],
    ['S - Solo (g)', fmtN(u0.capsula_solo_seco_1 - u0.peso_capsula_1), fmtN(u0.capsula_solo_seco_2 - u0.peso_capsula_2)],
    ['Umidade (%)', fmtN(u0.teor_umidade_1), fmtN(u0.teor_umidade_2)],
    ['Umidade média (%)', fmtN(u0.teor_umidade_media, 2), ''],
  ];

  const moldeRowLabels = [
    'Umidade calculada (%)', 'Água adicionada (g)', '% Água adicionada',
    'M+S+A (g)', 'S+A (g)', 'Dens. úmida (g/cm³)', 'Dens. seca (g/cm³)',
  ];
  const moldeRowValues = densidades.map((d) => {
    const pctAgua = (d.agua_adicionada_ml != null && d.peso_seco > 0)
      ? parseFloat((d.agua_adicionada_ml / d.peso_seco * 100).toFixed(1)) : null;
    return [
      fmtN(d.umidade_calculada, 1), fmtN(d.agua_adicionada_ml, 1), fmtN(pctAgua, 1),
      fmtN(d.cilindro_solo_umido, 1), fmtN(d.peso_solo_umido, 1),
      fmtN(d.dens_ap_umida, 3), fmtN(d.dens_ap_seca, 3),
    ];
  });

  const h0 = Array(width).fill('');
  h0[0] = 'UMIDADE HIGROSCÓPICA';
  h0[3] = `Nº MOLDES — ${densidades.map((d) => d.cilindro_numero || '?').join(' | ')}`;
  h0[base] = 'CILINDROS';
  const h1 = [
    'Campo', 'Am. 1', 'Am. 2', 'Campo',
    ...densidades.map((d, i) => d.cilindro_numero || i + 1),
    'Nº', 'Peso (g)', 'Vol (cm³)',
  ];

  const body = [h0, h1];
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 0, c: 3 + N } },
    { s: { r: 0, c: base }, e: { r: 0, c: base + 2 } },
  ];
  const labelCells = [];

  higRows.forEach(([label, am1, am2], ri) => {
    const isMedia = label === 'Umidade média (%)';
    const r = body.length;
    const row = Array(width).fill('');
    row[0] = label;
    row[1] = am1;
    if (!isMedia) row[2] = am2;
    else {
      merges.push({ s: { r, c: 1 }, e: { r, c: 2 } });
      labelCells.push({ r, c: 1 });
    }
    row[3] = moldeRowLabels[ri] || '';
    densidades.forEach((_, di) => { row[4 + di] = moldeRowValues[di]?.[ri] ?? '-'; });

    if (ri < N) {
      row[base] = densidades[ri].cilindro_numero || ri + 1;
      row[base + 1] = fmtN(densidades[ri].peso_cilindro, 1);
      row[base + 2] = fmtN(densidades[ri].volume_cilindro, 1);
    } else if (ri === N) {
      row[base] = 'Peso mat. (g)';
      row[base + 2] = fmtN(densidades[0]?.peso_amostra_umida, 1);
      merges.push({ s: { r, c: base }, e: { r, c: base + 1 } });
      labelCells.push({ r, c: base });
    } else if (ri === N + 1) {
      row[base] = 'Peso seco (g)';
      row[base + 2] = fmtN(densidades[0]?.peso_seco, 1);
      merges.push({ s: { r, c: base }, e: { r, c: base + 1 } });
      labelCells.push({ r, c: base });
    } else {
      merges.push({ s: { r, c: base }, e: { r, c: base + 2 } });
    }

    labelCells.push({ r, c: 0 }, { r, c: 3 });
    body.push(row);
  });

  return rawSheet({
    name: 'Compactação',
    title: 'Compactação',
    body,
    headerRows: [0, 1],
    tables: [{ r: 1, rows: higRows.length, width }],
    merges,
    labelCells,
    cols: [22, 11, 11, 22, ...Array(N).fill(12), 9, 11, 11],
  });
}

/**
 * Compactação — modo Ponto a Ponto, clone das duas tabelas transpostas do PDF:
 * parâmetros nas linhas, cilindros/pontos nas colunas.
 */
function compactacaoPontoSheet(ensaio) {
  const densidades = ensaio.densidades || [];
  const umidades = ensaio.umidades || [];
  if (!densidades.length && !umidades.length) return null;

  const densRows = [
    { label: 'Cilindro+Solo Úmido (g)', field: 'cilindro_solo_umido' },
    { label: 'Peso do Cilindro (g)', field: 'peso_cilindro' },
    { label: 'Peso do Solo Úmido (g)', sym: 'C=A-B', field: 'peso_solo_umido', calc: true },
    { label: 'Volume do Cilindro (cm³)', field: 'volume_cilindro' },
    { label: 'Dens. Apar. Úmida (g/cm³)', sym: 'E=C/D', field: 'dens_ap_umida', calc: true, dec: 3 },
  ];
  const umidRows = [
    { label: 'Cápsula Nº', field: 'capsula_numero_1', str: true },
    { label: 'Cápsula+Solo Úmido (g)', field: 'capsula_solo_umido_1' },
    { label: 'Cápsula+Solo Seco (g)', field: 'capsula_solo_seco_1' },
    { label: 'Peso da Cápsula (g)', field: 'peso_capsula_1' },
    { label: 'Teor de Umidade (%)', sym: 'K', field: 'teor_umidade_media', calc: true },
    { label: 'Dens. Apar. Seca (g/cm³)', sym: 'L=E/(100+K)', field: 'dens_ap_seca', calc: true, dec: 3 },
  ];

  const simbolos = { cilindro_solo_umido: 'A', peso_cilindro: 'B', volume_cilindro: 'D', capsula_numero_1: '-', capsula_solo_umido_1: 'F', capsula_solo_seco_1: 'G', peso_capsula_1: 'I' };

  const cilRealizado = (d) => d && d.cilindro_solo_umido != null && Number(d.cilindro_solo_umido) > 0;
  const umRealizado = (u) => u && u.capsula_solo_umido_1 != null && Number(u.capsula_solo_umido_1) > 0;

  const getCilVal = (d, row) => {
    if (row.str) return d[row.field] || '-';
    if (!cilRealizado(d)) return '-';
    const v = d[row.field];
    return (v != null && !isNaN(v)) ? fmtN(v, row.dec ?? 1) : '-';
  };
  const getUmVal = (u, d, row) => {
    if (row.str) return u[row.field] || '-';
    if (!umRealizado(u)) return '-';
    if (row.field === 'dens_ap_seca') {
      return (d?.dens_ap_seca != null && !isNaN(d.dens_ap_seca)) ? fmtN(d.dens_ap_seca, row.dec ?? 3) : '-';
    }
    const v = u[row.field];
    return (v != null && !isNaN(v)) ? fmtN(v, row.dec ?? 1) : '-';
  };

  const body = [];
  const labelCells = [];

  // Tabela de densidades (cilindros nas colunas)
  body.push(['Campo', 'Fórmula', ...densidades.map((d, i) => `Cil. ${d.cilindro_numero || i + 1}`)]);
  densRows.forEach((row) => {
    const r = body.length;
    body.push([row.label, row.sym || simbolos[row.field] || '-', ...densidades.map((d) => getCilVal(d, row))]);
    labelCells.push({ r, c: 0 });
    if (row.calc) labelCells.push(...boldRowCells(r, 2 + densidades.length));
  });

  body.push([]);

  // Tabela de umidades (pontos nas colunas)
  const headerUmidRow = body.length;
  body.push(['Campo', 'Fórmula', ...umidades.map((_, i) => `Ponto ${i + 1}`)]);
  umidRows.forEach((row) => {
    const r = body.length;
    body.push([row.label, row.sym || simbolos[row.field] || '-', ...umidades.map((u, ui) => getUmVal(u, densidades[ui], row))]);
    labelCells.push({ r, c: 0 });
    if (row.calc) labelCells.push(...boldRowCells(r, 2 + umidades.length));
  });

  return rawSheet({
    name: 'Compactação',
    title: 'Determinação da Umidade e Densidade',
    body,
    headerRows: [0, headerUmidRow],
    tables: [
      { r: 0, rows: densRows.length, width: 2 + densidades.length },
      { r: headerUmidRow, rows: umidRows.length, width: 2 + umidades.length },
    ],
    labelCells,
    cols: [30, 12, ...Array(Math.max(densidades.length, umidades.length)).fill(14)],
  });
}

/** Ensaio Proctor — compactação, umidades, densidades, CBR e expansão. */
export default function buildEnsaioProctorExport(ensaio) {
  const sheets = [];

  sheets.push(
    buildSheet({
      name: 'Dados Gerais',
      title: 'Ensaio Proctor — Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Horário', val(ensaio.horario)],
        ['Cliente', val(ensaio.cliente)],
        ['Contrato', val(ensaio.contrato)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Local de Coleta', val(ensaio.local_coleta)],
        ['Camada', val(ensaio.camada)],
        ['Material', val(ensaio.material)],
        ['Procedência', val(ensaio.procedencia)],
        ['Disco Especial', val(ensaio.disco_especial)],
        ['Soquete', val(ensaio.soquete)],
        ['Número de Golpes', val(ensaio.num_golpes)],
        ['Energia de Compactação', val(ensaio.energia_compactacao)],
        ['Umidade Higroscópica (%)', val(ensaio.umidade_higroscopica)],
        ['Densidade Máxima Seca (g/cm³)', val(ensaio.densidade_maxima_seca)],
        ['Umidade Ótima (%)', val(ensaio.umidade_otima)],
        ['ISC/CBR (%)', val(ensaio.isc_cbr)],
        ['Expansão (%)', val(ensaio.expansao)],
        ['Realizou CBR/Expansão', boolText(ensaio.realizar_cbr_expansao)],
      ],
      cols: [32, 30],
    })
  );

  // ── Compactação — clone da tabela transposta do PDF ──
  const isHigro = ensaio.correcao_densidade === 'higroscopica';
  const compactacao = isHigro ? compactacaoHigroSheet(ensaio) : compactacaoPontoSheet(ensaio);
  if (compactacao) sheets.push(compactacao);

  const cbr = ensaio.cbr_cilindros || [];
  if (cbr.length) {
    sheets.push(
      buildSheet({
        name: 'CBR',
        title: 'CBR / ISC por Cilindro',
        meta: [['Fator do Anel (global)', val(ensaio.cbr_fator_anel)]],
        header: ['Cilindro', 'Fator do Anel', 'ISC 2,54mm (%)', 'ISC 5,08mm (%)', 'ISC Adotado (%)'],
        rows: cbr.map((c) => [
          val(c.cilindro_numero),
          val(c.fator_anel),
          val(c.isc254),
          val(c.isc508),
          val(c.isc),
        ]),
        cols: [14, 16, 18, 18, 18],
      })
    );
  }

  const exp = ensaio.expansao_cilindros || [];
  if (exp.length) {
    sheets.push(
      buildSheet({
        name: 'Expansão',
        title: 'Expansão por Cilindro',
        header: [
          'Cilindro',
          'Data',
          'Hora',
          'Altura Inicial (mm)',
          'Leitura 1º dia',
          'Leitura 2º dia',
          'Leitura 3º dia',
          'Leitura 4º dia',
          'Diferença',
          'Expansão (%)',
          'Massa Final do Solo (g)',
        ],
        rows: exp.map((e) => [
          val(e.cilindro_numero),
          fmtDate(e.data),
          val(e.hora),
          val(e.altura_inicial),
          val(e.leitura_1dia),
          val(e.leitura_2dia),
          val(e.leitura_3dia),
          val(e.leitura_4dia),
          val(e.diferenca),
          val(e.expansao_pct),
          val(e.massa_solo_final),
        ]),
        cols: [14, 14, 10, 18, 14, 14, 14, 14, 12, 14, 22],
      })
    );
  }

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('ensaio_proctor', ensaio.data_ensaio), sheets };
}