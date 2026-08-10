import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { rawSheet } from './transposedShared';
import { calcularGranulometria, calcularPercentualEmulsao } from '@/utils/relatorioMRAFUtils';
import { fmtNum } from '@/utils/relatorioCAUQTabelasUtils';
import { carregarProject, carregarFaixaDoProject } from '@/services/relatorioContextService';

/**
 * Granulometria — clone da tabela do PDF (DNIT 412/2025):
 * PENEIRAS | RETIDO | PASS. | % PASS. | FAIXA DE TRABALHO | FAIXA ESPECIFICADA
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

/** Ensaio MRAF — extração de ligante (Rotarex) e granulometria, como no PDF. */
export default async function buildEnsaioMRAFExport(ensaio) {
  const ext = ensaio.extracao_ligante || {};

  // Contexto opcional do projeto/faixa (colunas de faixa de trabalho e especificada).
  let project = null;
  let faixa = null;
  try {
    if (ensaio.project_id) project = await carregarProject(ensaio.project_id);
    if (project) faixa = await carregarFaixaDoProject(project);
  } catch { /* contexto opcional */ }

  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      title: 'Ensaio MRAF — Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Horário', val(ensaio.horario)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Local de Coleta', val(ensaio.local_coleta)],
        ['Pedreira', val(ensaio.pedreira)],
        ['Placa do Caminhão', val(ensaio.placa_caminhao)],
        ['Tipo de Ligante', val(ensaio.tipo_ligante)],
        ['Emulsão Utilizada', val(project?.emulsao_utilizada)],
        ['Faixa Especificada', val(ensaio.faixa_especificada)],
        ['Ensaio Realizado Por', val(ensaio.ensaio_realizado_por)],
      ],
      cols: [28, 44],
    }),
  ];

  const gran = granulometriaSheet(ensaio, faixa, project);
  if (gran) sheets.push(gran);

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
        ['Resíduo da Emulsão (%)', val(ext.residuo_emulsao)],
        ['% de Emulsão', val(calcularPercentualEmulsao(ext.teor_ligante, ext.residuo_emulsao))],
      ],
      cols: [30, 22],
    })
  );

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('ensaio_mraf', ensaio.data_ensaio), sheets };
}