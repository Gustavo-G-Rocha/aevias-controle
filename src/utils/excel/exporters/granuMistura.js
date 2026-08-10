import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { rawSheet, paramSheet } from './transposedShared';
import { getNomeMaterial } from '@/utils/relatorioGranuMisturaUtils';

/**
 * Granulometria da mistura — clone da tabela do PDF (DNIT 412/25-ME):
 * ASTM | (mm) | RETIDO (g) | PASS. (g) | % PASS. [ | MÍN. | MÁX. ]
 */
function granulometriaSheet(record) {
  const peneiras = record.peneiras || [];
  if (!peneiras.length) return null;
  const mostraEspec = peneiras.some((p) => p.especMin != null || p.especMax != null);

  const header = ['ASTM', '(mm)', 'RETIDO (g)', 'PASS. (g)', '% PASS.'];
  if (mostraEspec) header.push('MÍN.', 'MÁX.');

  const rows = peneiras.map((p) => {
    const linha = [
      val(p.astm),
      val(p.abertura_mm),
      val(p.retido_g),
      val(p.passante_g),
      val(p.passante_pct),
    ];
    if (mostraEspec) linha.push(val(p.especMin), val(p.especMax));
    return linha;
  });

  return rawSheet({
    name: 'Granulometria',
    title: 'Ensaio de Granulometria — DNIT 412/25-ME',
    body: [
      ['PESO DA AMOSTRA (g)', val(record.peso_amostra)],
      [],
      header,
      ...rows,
    ],
    headerRows: [2],
    tables: [{ r: 2, rows: rows.length, width: header.length }],
    labelCells: [{ r: 0, c: 0 }, ...rows.map((_, i) => ({ r: 3 + i, c: 0 }))],
    valueCells: [{ r: 0, c: 1 }],
    cols: mostraEspec ? [16, 12, 14, 14, 12, 12, 12] : [18, 14, 16, 16, 14],
  });
}

/** Granulometria da mistura — granulometria, umidade, equivalente de areia e pulverulentos. */
export default function buildGranuMisturaExport(record) {
  const umid = record.umidade || {};
  const eqa = record.equivalente_areia || {};
  const pulv = record.materiais_pulverulentos || {};

  const sheets = [
    buildSheet({
      name: 'Dados da Obra',
      title: 'Granulometria da Mistura — Dados da Obra',
      meta: [
        ...obraMeta(record),
        ['Data do Ensaio', fmtDate(record.data_ensaio)],
        ['Horário', val(record.horario)],
        ['Número do Projeto', val(record.numero_projeto)],
        ['Rodovia', val(record.rodovia)],
        ['Trecho', val(record.trecho)],
        ['Camada', val(record.camada)],
        ['Material', getNomeMaterial(record)],
        ['Local de Coleta', val(record.local_coleta)],
        ['Pedreira', val(record.pedreira)],
        ['Faixa', val(record.faixa)],
      ],
      cols: [28, 40],
    }),
  ];

  const gran = granulometriaSheet(record);
  if (gran) sheets.push(gran);

  sheets.push(
    buildSheet({
      name: 'Determinação de Umidade',
      title: 'Determinação de Umidade',
      meta: [
        ['Peso Úmido (g)', val(umid.peso_umido)],
        ['Peso Seco (g)', val(umid.peso_seco)],
        ['Peso de Água (g)', val(umid.peso_agua)],
        ['Umidade (%)', val(umid.umidade_pct)],
      ],
      cols: [26, 20],
    })
  );

  const medicoes = eqa.medicoes || [];
  if (medicoes.length) {
    const eqSheet = paramSheet({
      name: 'Equivalente de Areia',
      title: 'Ensaio de Equivalente de Areia',
      columns: medicoes.map((_, i) => `Med. ${i + 1}`),
      rows: [
        { label: 'Topo Argila', calc: 'H₁', unit: 'cm', values: medicoes.map((m) => val(m.topo_argila)) },
        { label: 'Topo Areia', calc: 'H₂', unit: 'cm', values: medicoes.map((m) => val(m.topo_areia)) },
        { label: 'Equivalente Areia', calc: '(H₂/H₁)×100', unit: '%', values: medicoes.map((m) => val(m.equivalente)), bold: true },
        { label: 'Média', unit: '%', values: medicoes.map((_, i) => (i === 0 ? val(eqa.media) : '')), bold: true },
      ],
      colWidth: 13,
    });
    if (eqSheet) sheets.push(eqSheet);
  }

  if (pulv.peso_inicial != null || pulv.teor_pct != null) {
    sheets.push(
      buildSheet({
        name: 'Materiais Pulverulentos',
        title: 'Materiais Pulverulentos',
        meta: [
          ['Peso Inicial (g)', val(pulv.peso_inicial)],
          ['Peso Após Lavagem (g)', val(pulv.peso_apos_lavagem)],
          ['Teor (%)', val(pulv.teor_pct)],
        ],
        cols: [28, 20],
      })
    );
  }

  if (record.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', record.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('granulometria_mistura', record.data_ensaio), sheets };
}