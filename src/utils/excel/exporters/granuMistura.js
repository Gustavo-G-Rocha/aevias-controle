import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

/** Granulometria da mistura — peneiras, umidade, equivalente de areia e pulverulentos. */
export default function buildGranuMisturaExport(ensaio) {
  const umid = ensaio.umidade || {};
  const eqa = ensaio.equivalente_areia || {};
  const pulv = ensaio.materiais_pulverulentos || {};
  const sheets = [];

  sheets.push(
    buildSheet({
      name: 'Dados Gerais',
      title: 'Granulometria da Mistura — Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Horário', val(ensaio.horario)],
        ['Número do Projeto', val(ensaio.numero_projeto)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Camada', val(ensaio.camada)],
        ['Material', val(ensaio.material_outro || ensaio.material)],
        ['Local de Coleta', val(ensaio.local_coleta)],
        ['Pedreira', val(ensaio.pedreira)],
        ['Faixa', val(ensaio.faixa)],
        ['Peso da Amostra (g)', val(ensaio.peso_amostra)],
      ],
      cols: [28, 40],
    })
  );

  const peneiras = ensaio.peneiras || [];
  if (peneiras.length) {
    sheets.push(
      buildSheet({
        name: 'Granulometria',
        title: 'Peneiramento',
        header: ['Peneira (ASTM)', 'Abertura (mm)', 'Retido (g)', 'Passante (g)', '% Passante'],
        rows: peneiras.map((p) => [
          val(p.astm),
          val(p.abertura_mm),
          val(p.retido_g),
          val(p.passante_g),
          val(p.passante_pct),
        ]),
        cols: [18, 16, 14, 16, 14],
      })
    );
  }

  sheets.push(
    buildSheet({
      name: 'Ensaios Complementares',
      title: 'Umidade, Equivalente de Areia e Pulverulentos',
      meta: [
        ['Peso Úmido (g)', val(umid.peso_umido)],
        ['Peso Seco (g)', val(umid.peso_seco)],
        ['Peso de Água (g)', val(umid.peso_agua)],
        ['Umidade (%)', val(umid.umidade_pct)],
        ['Equivalente de Areia — Média (%)', val(eqa.media)],
        ['Pulverulentos — Peso Inicial (g)', val(pulv.peso_inicial)],
        ['Pulverulentos — Peso Após Lavagem (g)', val(pulv.peso_apos_lavagem)],
        ['Pulverulentos — Teor (%)', val(pulv.teor_pct)],
      ],
      cols: [38, 22],
    })
  );

  const medicoes = eqa.medicoes || [];
  if (medicoes.length) {
    sheets.push(
      buildSheet({
        name: 'Equivalente de Areia',
        title: 'Medições de Equivalente de Areia',
        header: ['Medição', 'Topo da Argila', 'Topo da Areia', 'Equivalente (%)'],
        rows: medicoes.map((m, i) => [i + 1, val(m.topo_argila), val(m.topo_areia), val(m.equivalente)]),
        cols: [12, 18, 18, 18],
      })
    );
  }

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('granulometria_mistura', ensaio.data_ensaio), sheets };
}