import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { rawSheet, boldRowCells } from './transposedShared';
import { calcularGranulometria, calcularMedia } from '@/utils/relatorioCAUQUtils';
import {
  fmtNum,
  temDadosRTCD,
  temDadosEstabilidade,
  extrairConstPrensa,
} from '@/utils/relatorioCAUQTabelasUtils';
import { carregarProject, carregarFaixaDoProject } from '@/services/relatorioContextService';

/**
 * Granulometria — clone da tabela do PDF (DNIT 412/2025):
 * PENEIRAS | RETIDO | PASS. | % PASS. | FAIXA TRABALHO MÍN/MÁX | FAIXA ESPEC. MÍN/MÁX
 */
function granulometriaSheet(ensaio, faixa, project) {
  const dados = calcularGranulometria(ensaio, faixa, project);
  if (!dados.length) return null;

  const espec = faixa?.especificacao ? ` ${faixa.especificacao}` : '';
  const body = [
    ['PENEIRAS ASTM (mm)', 'PESO DA AMOSTRA (g)', '', '', 'FAIXA DE TRABALHO', '', `FAIXA ESPECIFICADA${espec}`, ''],
    ['', 'RETIDO (g)', 'PASS. (g)', '% PASS.', 'MÍN. (%)', 'MÁX. (%)', 'MÍN. (%)', 'MÁX. (%)'],
    ...dados.map((d) => [
      d.astm,
      val(d.retido),
      val(d.passante),
      val(d.percentualPassante),
      fmtNum(d.faixaTrabalhoMin, 1),
      fmtNum(d.faixaTrabalhoMax, 1),
      fmtNum(d.limiteMin, 1),
      fmtNum(d.limiteMax, 1),
    ]),
  ];

  return rawSheet({
    name: 'Granulometria',
    title: 'Ensaio de Granulometria — DNIT 412/2025',
    body,
    headerRows: [0, 1],
    tables: [{ r: 1, rows: dados.length, width: 8 }],
    merges: [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 0, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 0, c: 5 } },
      { s: { r: 0, c: 6 }, e: { r: 0, c: 7 } },
    ],
    labelCells: dados.map((_, i) => ({ r: 2 + i, c: 0 })),
    cols: [16, 13, 13, 12, 12, 12, 12, 12],
  });
}

/**
 * Marshall — clone da tabela transposta do PDF (DNIT 447/2024):
 * linhas = parâmetros, colunas = CP 1…6 + Média + Proj. + Mín. + Máx.
 */
function marshallSheet(ensaio, project) {
  const cps = (ensaio.corpos_prova_marshall || []).slice(0, 6);
  if (!cps.length) return null;

  const media = (campo) => calcularMedia(cps, campo);
  const cp = (i, campo) => {
    const v = cps[i]?.[campo];
    return v === null || v === undefined || v === '' ? '-' : v;
  };
  const linha = (label, un, campo, m = '-', proj = '-', mn = '-', mx = '-') => [
    label, un, cp(0, campo), cp(1, campo), cp(2, campo), cp(3, campo), cp(4, campo), cp(5, campo), m, proj, mn, mx,
  ];

  const rows = [];
  const boldDataRows = [];
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    { s: { r: 0, c: 2 }, e: { r: 0, c: 7 } },
    { s: { r: 0, c: 8 }, e: { r: 1, c: 8 } },
    { s: { r: 0, c: 9 }, e: { r: 1, c: 9 } },
    { s: { r: 0, c: 10 }, e: { r: 1, c: 10 } },
    { s: { r: 0, c: 11 }, e: { r: 1, c: 11 } },
  ];

  rows.push(linha('PESO AR', 'g', 'peso_ar'));
  rows.push(linha('PESO IMERSO', 'g', 'peso_imerso'));
  rows.push(linha('PESO SSS', 'g', 'peso_sss'));
  rows.push(linha('VOLUME', 'cm³', 'volume'));
  boldDataRows.push(rows.length);
  rows.push(linha('DENSIDADE APARENTE', 'g/cm³', 'densidade_aparente',
    media('densidade_aparente'), val(project?.massa_especifica_aparente), '-', '-'));
  boldDataRows.push(rows.length);
  rows.push(linha('VOLUME DE VAZIOS', '%', 'volume_vazios',
    media('volume_vazios'),
    fmtNum(project?.volume_vazios?.min, 1),
    fmtNum(project?.volume_vazios?.max, 1),
    fmtNum(project?.volume_vazios?.otimo, 1)));
  rows.push(linha('V.C.B.', '%', 'vcb'));
  rows.push(linha('V.A.M.', '%', 'vam', '-',
    fmtNum(project?.vam?.projeto, 1), fmtNum(project?.vam?.min, 1), '-'));
  rows.push(linha('R.B.V.', '%', 'rbv', '-',
    fmtNum(project?.rbv?.projeto, 1), fmtNum(project?.rbv?.min, 1), fmtNum(project?.rbv?.max, 1)));
  rows.push(linha('ALTURA', 'cm', 'altura'));

  const temDiametral = temDadosRTCD(cps);
  const temEstabilidade = temDadosEstabilidade(cps);
  if (temDiametral || temEstabilidade) {
    const r = rows.length + 2; // índice no body (2 linhas de cabeçalho)
    rows.push(['CONST. PRENSA', '-', extrairConstPrensa(cps), '', '', '', '', '', '-', '-', '-', '-']);
    merges.push({ s: { r, c: 2 }, e: { r, c: 7 } });
  }
  if (temDiametral) {
    rows.push(linha('LEITURA (RTCD)', 'Kgf/cm²', 'rtcd_leitura'));
    boldDataRows.push(rows.length);
    rows.push(linha('RTCD', 'MPa', 'rtcd_valor', media('rtcd_valor'), '-',
      project?.rtcd?.min ? fmtNum(project.rtcd.min, 1) : '-', '-'));
  }
  if (temEstabilidade) {
    rows.push(linha('LEITURA (ESTABILIDADE)', 'Kgf/cm²', 'estabilidade_leitura'));
    boldDataRows.push(rows.length);
    rows.push(linha('ESTABILIDADE CORRIG.', 'Kgf/cm²', 'estabilidade_corrigida',
      media('estabilidade_corrigida'),
      project?.estabilidade?.projeto ? fmtNum(project.estabilidade.projeto, 1) : '-',
      project?.estabilidade?.min ? fmtNum(project.estabilidade.min, 1) : '-', '-'));
    boldDataRows.push(rows.length);
    rows.push(linha('FLUÊNCIA', 'mm', 'fluencia', media('fluencia'),
      project?.fluencia?.projeto ? fmtNum(project.fluencia.projeto, 1) : '-',
      project?.fluencia?.min ? fmtNum(project.fluencia.min, 1) : '-',
      project?.fluencia?.max ? fmtNum(project.fluencia.max, 1) : '-'));
  }

  const labelCells = rows.map((_, i) => ({ r: 2 + i, c: 0 }));
  boldDataRows.forEach((i) => labelCells.push(...boldRowCells(2 + i, 12)));

  const body = [
    ['CORPO DE PROVA', 'UN.', 'CORPO DE PROVA', '', '', '', '', '', 'MÉDIA', 'PROJ.', 'MÍN.', 'MÁX.'],
    ['', '', 1, 2, 3, 4, 5, 6, '', '', '', ''],
    ...rows,
  ];

  return rawSheet({
    name: 'Marshall',
    title: 'Ensaio Marshall — Método de Ensaio DNIT 447/2024',
    body,
    headerRows: [0, 1],
    tables: [{ r: 1, rows: rows.length, width: 12 }],
    merges,
    labelCells,
    cols: [24, 9, 10, 10, 10, 10, 10, 10, 11, 10, 10, 10],
  });
}

/** Ensaio CAUQ — extração de ligante, granulometria, RICE e Marshall. */
export default async function buildEnsaioCAUQExport(ensaio) {
  const ext = ensaio.extracao_ligante || {};
  const rice = ensaio.densidade_rice || {};

  // Contexto do projeto/faixa (colunas de faixa de trabalho e especificada).
  // Falha isolada não impede a exportação — as colunas ficam com '-'.
  let project = null;
  let faixa = null;
  try {
    if (ensaio.project_id) project = await carregarProject(ensaio.project_id);
    if (project) faixa = await carregarFaixaDoProject(project);
  } catch { /* contexto opcional */ }

  const sheets = [];

  // ── Dados gerais ──
  sheets.push(
    buildSheet({
      name: 'Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Horário', val(ensaio.horario)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Local de Coleta', val(ensaio.local_coleta)],
        ['Usina Fornecedora', val(ensaio.usina_fornecedora)],
        ['Pedreira', val(ensaio.pedreira)],
        ['Placa do Caminhão', val(ensaio.placa_caminhao)],
        ['Tipo de Ligante', val(ensaio.tipo_ligante)],
        ['Temperatura do CAP (°C)', val(ensaio.temperatura_cap)],
        ['Faixa Especificada', val(ensaio.faixa_especificada)],
        ['Ensaio Realizado Por', val(ensaio.ensaio_realizado_por)],
      ],
      cols: [28, 44],
    })
  );

  // ── Extração de ligante (grade de pares rótulo/valor, como no PDF) ──
  sheets.push(
    buildSheet({
      name: 'Extração de Ligante',
      title: 'Extração Ligante (Rotarex) — ABNT NBR 16208/2013',
      meta: [
        ['Peso da Amostra (g)', val(ext.peso_amostra)],
        ['Amostra Úmida (g)', val(ext.amostra_umida)],
        ['Amostra Seca (g)', val(ext.amostra_seca)],
        ['Umidade (%)', val(ext.umidade)],
        ['Amostra com Ligante (g)', val(ext.amostra_com_ligante)],
        ['Amostra sem Ligante (g)', val(ext.amostra_sem_ligante)],
        ['Fator de Correção', val(ext.fator_correcao)],
        ['Peso do Ligante (g)', val(ext.peso_ligante)],
        ['Teor de Ligante (%)', val(ext.teor_ligante)],
        ['Teor de Ligante Real (%)', val(ext.teor_ligante_real)],
        ['Relação Filler/Betume', val(ext.filler_betume)],
      ],
      cols: [30, 22],
    })
  );

  // ── Granulometria (clone do PDF, 8 colunas) ──
  const gran = granulometriaSheet(ensaio, faixa, project);
  if (gran) sheets.push(gran);

  // ── Densidade RICE ──
  if (ensaio.realizar_densidade_rice) {
    sheets.push(
      buildSheet({
        name: 'Densidade RICE',
        title: 'Ensaio de Densidade RICE (DMT) — DNIT 427/20 - ABNT NBR 15619/16',
        meta: [
          ['Frasco + Água (g)', val(rice.frasco_agua)],
          ['Amostra (g)', val(rice.amostra)],
          ['Frasco + Água + Amostra (g)', val(rice.frasco_agua_amostra)],
          ['Temperatura da Água (°C)', val(rice.temperatura_agua)],
          ['Densidade da Água (g/cm³)', val(rice.densidade_agua)],
          ['Densidade RICE (g/cm³)', val(rice.densidade_rice)],
        ],
        cols: [32, 20],
      })
    );
  }

  // ── Marshall transposto (clone do PDF) ──
  const marshall = marshallSheet(ensaio, project);
  if (marshall) sheets.push(marshall);

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('ensaio_cauq', ensaio.data_ensaio), sheets };
}