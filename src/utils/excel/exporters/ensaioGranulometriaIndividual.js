import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { PENEIRAS } from './peneirasShared';

const temValor = (agregado, key) => {
  const p = agregado.granulometria?.[key];
  return p && (p.retido !== null && p.retido !== undefined && p.retido !== '' ||
               p.passante !== null && p.passante !== undefined && p.passante !== '');
};

/** Granulometria individual — uma coluna de retido/passante por agregado. */
export default function buildGranulometriaIndividualExport(ensaio) {
  const agregados = ensaio.agregados || [];
  const eq = ensaio.equivalente_areia || {};

  const usadas = PENEIRAS.filter(([key]) => agregados.some((a) => temValor(a, key)));

  const header = ['Peneira'];
  agregados.forEach((a, i) => {
    const nome = a.nome || `Agregado ${i + 1}`;
    header.push(`${nome} — Retido (g)`, `${nome} — % Passante`);
  });

  const rows = usadas.map(([key, label]) => {
    const linha = [label];
    agregados.forEach((a) => {
      const p = a.granulometria?.[key] || {};
      linha.push(val(p.retido), val(p.passante));
    });
    return linha;
  });

  const sheets = [
    buildSheet({
      name: 'Granulometria',
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
      header,
      rows,
      cols: [22, ...agregados.flatMap(() => [20, 18])],
    }),
    buildSheet({
      name: 'Umidade dos Agregados',
      header: ['Agregado', 'Peso Úmido (g)', 'Peso Seco (g)', 'Água (g)', 'Umidade (%)'],
      rows: agregados.map((a, i) => [
        val(a.nome || `Agregado ${i + 1}`),
        val(a.peso_umido),
        val(a.peso_seco),
        val(a.agua),
        val(a.umidade),
      ]),
      cols: [30, 16, 16, 12, 14],
    }),
  ];

  const medicoes = eq.medicoes || [];
  if (medicoes.length) {
    sheets.push(
      buildSheet({
        name: 'Equivalente de Areia',
        meta: [['Média (%)', val(eq.media)]],
        header: ['Nº', 'Topo da Argila', 'Topo da Areia', 'Equivalente (%)'],
        rows: medicoes.map((m, i) => [
          i + 1,
          val(m.topo_argila),
          val(m.topo_areia),
          val(m.equivalente),
        ]),
        cols: [6, 18, 18, 18],
      })
    );
  }

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('granulometria_individual', ensaio.data_ensaio), sheets };
}