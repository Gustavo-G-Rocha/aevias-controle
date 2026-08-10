import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { paramSheet } from './transposedShared';
import { fmtN, agruparEmSeries, resistenciaExemplar } from '@/utils/relatorioRompimentoConcretoUtils';

/**
 * Monta a tabela transposta de um ensaio de rompimento, como no PDF:
 * linhas = parâmetros, colunas = corpos de prova agrupados em séries.
 */
function ensaioSheet({ name, title, series, unidadeCarga, extras = [] }) {
  const cps = series.flat();
  if (!cps.length) return null;

  const porCp = (fn) => series.flatMap((s) => s.map(fn));
  // Resistência do exemplar: valor da série no 1º CP, demais em branco.
  const exemplar = series.flatMap((s) => s.map((_, i) => (i === 0 ? resistenciaExemplar(s) : '')));

  return paramSheet({
    name,
    title,
    labelHeader: 'PARÂMETRO',
    columns: cps.map((_, i) => `CP ${i + 1}`),
    rows: [
      { label: 'IDADE', unit: 'dias', values: porCp((cp) => val(cp.idade)) },
      { label: 'N° CP', values: porCp((cp) => val(cp.numero_cp)) },
      { label: 'DATA DA RUPTURA', values: porCp((cp) => (cp.data_ruptura ? fmtDate(cp.data_ruptura) : '-')) },
      ...extras.map((ex) => ({ ...ex, values: porCp(ex.value) })),
      { label: 'CARGA DE RUPTURA', unit: unidadeCarga, values: porCp((cp) => fmtN(cp.carga_ruptura, 2)) },
      { label: 'RESISTÊNCIA', unit: 'MPa', values: porCp((cp) => fmtN(cp.resistencia, 2)), bold: true },
      { label: 'RESIST. DO EXEMPLAR', unit: 'MPa', values: exemplar, bold: true },
    ],
    labelWidth: 28,
    colWidth: 13,
  });
}

/** Rompimento de concreto — clone das tabelas transpostas do PDF. */
export default function buildEnsaioRompimentoConcretoExport(ensaio) {
  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      title: 'Rompimento de Concreto — Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Cliente', val(ensaio.cliente)],
        ['Construtora', val(ensaio.construtora)],
        ['Fornecedor/Concreteira', val(ensaio.fornecedor)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Estrutura', val(ensaio.estrutura)],
        ['Estaca de Moldagem', val(ensaio.estaca_moldagem)],
        ['Número de Moldagem', val(ensaio.numero_moldagem)],
        ['Projeto/Traço', val(ensaio.projeto_trac)],
        ['Nota Fiscal', val(ensaio.nota_fiscal)],
        ['Volume Betonado (m³)', val(ensaio.volume_betonado)],
        ['Slump Test (mm)', val(ensaio.slump_test)],
        ['Temperatura Ambiente (°C)', val(ensaio.temperatura_ambiente)],
        ['Hora da Moldagem', val(ensaio.hora_moldagem)],
        ['Hora de Saída da Usina', val(ensaio.hora_saida_usina)],
        ['Hora de Chegada no Campo', val(ensaio.hora_chegada_campo)],
      ],
      cols: [30, 40],
    }),
  ];

  const axial = ensaioSheet({
    name: 'Compressão Axial',
    title: 'Ensaio de Resistência à Compressão Axial',
    series: agruparEmSeries(ensaio.compressao_axial),
    unidadeCarga: 'tf',
    extras: [
      { label: 'DIMENSÕES DO CP', unit: 'cm', value: (cp) => val(cp.dimensao) },
      { label: 'ÁREA DO CORPO DE PROVA', unit: 'cm²', value: (cp) => fmtN(cp.area_cp, 2) },
    ],
  });
  if (axial) sheets.push(axial);

  const flexao = ensaioSheet({
    name: 'Tração na Flexão',
    title: 'Ensaio de Resistência à Tração na Flexão — ABNT NBR 12142:2010',
    series: (ensaio.tracao_flexao || []).map((cp) => [cp]),
    unidadeCarga: 'kgf',
    extras: [
      { label: 'PONTO DE RUPTURA', value: (cp) => val(cp.ponto_ruptura) },
      { label: 'VÃO CENTRAL DO CP', unit: 'mm', value: (cp) => fmtN(cp.vao_central, 2) },
      { label: 'ALTURA DO CP', unit: 'mm', value: (cp) => fmtN(cp.altura_cp, 2) },
      { label: 'LARGURA DO CP', unit: 'mm', value: (cp) => fmtN(cp.largura_cp, 2) },
    ],
  });
  if (flexao) sheets.push(flexao);

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('rompimento_concreto', ensaio.data_ensaio), sheets };
}