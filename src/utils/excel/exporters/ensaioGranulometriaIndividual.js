import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { groupedSheet, paramSheet } from './transposedShared';
import { PENEIRAS } from './peneirasShared';

const temValor = (agregado, key) => {
  const p = agregado.granulometria?.[key];
  return !!p && (
    (p.retido !== null && p.retido !== undefined && p.retido !== '') ||
    (p.passante !== null && p.passante !== undefined && p.passante !== '')
  );
};

/**
 * Granulometria individual — clone das tabelas do PDF:
 * PENEIRA | mm | por agregado: Ret (g) / Pass % (cabeçalho de dois níveis),
 * determinação de umidade e equivalente de areia transposto.
 */
export default function buildGranulometriaIndividualExport(ensaio) {
  const agregados = ensaio.agregados || [];
  const eq = ensaio.equivalente_areia || {};
  const usadas = PENEIRAS.filter(([key]) => agregados.some((a) => temValor(a, key)));

  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      title: 'Granulometria Individual — Ensaio de Granulometria do Agregado',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Horário', val(ensaio.horario)],
        ['Tipo de Material', val(ensaio.tipo_material)],
        ['Faixa', val(ensaio.faixa)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Pedreira', val(ensaio.pedreira)],
        ['Local de Coleta', val(ensaio.local_coleta)],
        ['Engenheiro Responsável', val(ensaio.engenheiro_responsavel)],
      ],
      cols: [28, 40],
    }),
  ];

  const gran = groupedSheet({
    name: 'Granulometria',
    title: 'Método de Ensaio de Granulometria — DNIT 412/2025-ME',
    leftCols: [{ label: 'PENEIRA', width: 22 }],
    groups: agregados.map((a, i) => ({
      label: a.nome || `Agregado ${i + 1}`,
      subs: ['Ret (g)', 'Pass %'],
    })),
    rows: usadas.map(([key, label]) => {
      const linha = [label];
      agregados.forEach((a) => {
        const p = a.granulometria?.[key] || {};
        linha.push(val(p.retido), val(p.passante));
      });
      return linha;
    }),
    subWidth: 14,
  });
  if (gran) sheets.push(gran);

  if (agregados.some((a) => a.umidade != null || a.peso_umido != null)) {
    sheets.push(
      buildSheet({
        name: 'Determinação de Umidade',
        title: 'Determinação de Umidade',
        header: ['Agregado', 'Amostra Úmida (g)', 'Amostra Seca (g)', 'Água (g)', 'Umidade (%)'],
        rows: agregados.map((a, i) => [
          val(a.nome || `Agregado ${i + 1}`),
          val(a.peso_umido),
          val(a.peso_seco),
          val(a.agua),
          val(a.umidade),
        ]),
        cols: [30, 20, 20, 14, 16],
      })
    );
  }

  const medicoes = eq.medicoes || [];
  if (medicoes.length) {
    const eqSheet = paramSheet({
      name: 'Equivalente de Areia',
      title: 'Método de Ensaio de Equivalente de Areia — DNIT 450/2024',
      labelHeader: 'PARÂMETRO',
      columns: medicoes.map((_, i) => `Med. ${i + 1}`),
      rows: [
        { label: 'Topo Argila', calc: 'H₁', unit: 'cm', values: medicoes.map((m) => val(m.topo_argila)) },
        { label: 'Topo Areia', calc: 'H₂', unit: 'cm', values: medicoes.map((m) => val(m.topo_areia)) },
        { label: 'Equivalente Areia', calc: '(H₂/H₁)×100', unit: '%', values: medicoes.map((m) => val(m.equivalente)), bold: true },
        { label: 'Média', unit: '%', values: medicoes.map((_, i) => (i === 0 ? val(eq.media) : '')), bold: true },
      ],
      colWidth: 13,
    });
    if (eqSheet) sheets.push(eqSheet);
  }

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('granulometria_individual', ensaio.data_ensaio), sheets };
}