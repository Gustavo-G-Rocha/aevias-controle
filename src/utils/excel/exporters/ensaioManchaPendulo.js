import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

const num = (v, d = 1) => (v === null || v === undefined || v === '' ? '-' : Number(v).toFixed(d));

/** Classificação do VRD, igual à do PDF. */
function classificacaoVRD(vrd) {
  if (vrd === null || vrd === undefined || vrd === '') return '-';
  const v = parseFloat(vrd);
  if (v < 25) return 'Perigosa';
  if (v <= 31) return 'Muito Lisa';
  if (v <= 39) return 'Lisa';
  if (v <= 46) return 'Insuf. Rugosa';
  if (v <= 54) return 'Median. Rugosa';
  if (v <= 75) return 'Rugosa';
  return 'Muito Rugosa';
}

const media = (itens, campo, d) => {
  const vals = itens.map((e) => e?.[campo]).filter((v) => v !== null && v !== undefined && v !== '');
  if (!vals.length) return '-';
  return (vals.reduce((s, v) => s + Number(v), 0) / vals.length).toFixed(d);
};

/**
 * Ensaio de macrotextura e microtextura — clone das tabelas do PDF:
 * Mancha de Areia (ABNT NBR 16504:2016) e Pêndulo Britânico (ABNT NBR 16780:2019).
 */
export default function buildEnsaioManchaPenduloExport(ensaio) {
  const mancha = ensaio.ensaios_mancha || [];
  const pendulo = ensaio.ensaios_pendulo || [];

  const sheets = [
    buildSheet({
      name: 'Dados do Cliente',
      title: 'Ensaio de Macrotextura e Microtextura — Dados do Cliente',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Pista', val(ensaio.pista)],
        ['Camada', val(ensaio.camada)],
        ['Empreiteira', val(ensaio.empreiteira)],
        ['Órgão', val(ensaio.orgao)],
      ],
      cols: [28, 40],
    }),
  ];

  if (mancha.length) {
    sheets.push(
      buildSheet({
        name: 'Mancha de Areia',
        title: 'Mancha de Areia — Método ABNT NBR 16504:2016',
        header: [
          'DATA APLICAÇÃO', 'ESTACA', 'FAIXA / PISTA', 'BORDO', 'VOLUME DE AREIA (mm³)',
          'D1 (Ø) (mm)', 'D2 (Ø) (mm)', 'D3 (Ø) (mm)', 'D4 (Ø) (mm)',
          'D(Ø) MÉDIA (mm)', 'HS (mm)', 'TIPO DE SUPERFÍCIE',
        ],
        rows: mancha.map((e) => [
          e.data_aplicacao ? fmtDate(e.data_aplicacao) : '-',
          val(e.estaca),
          val(e.faixa_pista),
          val(e.bordo),
          '25000',
          num(e.d1), num(e.d2), num(e.d3), num(e.d4),
          num(e.d_media), num(e.hs_mm, 2),
          val(e.tipo_superficie),
        ]),
        cols: [16, 12, 13, 11, 16, 11, 11, 11, 11, 14, 11, 20],
      })
    );
  }

  if (pendulo.length) {
    sheets.push(
      buildSheet({
        name: 'Pêndulo Britânico',
        title: 'Pêndulo Britânico — Método ABNT NBR 16780:2019',
        header: [
          'DATA APLICAÇÃO', 'ESTACA', 'FAIXA / PISTA', 'BORDO', 'TEMP. DO PAVIMENTO (°C)',
          '1º', '2º', '3º', '4º', '5º', 'MÁXIMA', 'MÍNIMA', 'VRD', 'CLASSE',
        ],
        rows: pendulo.map((e) => [
          e.data_aplicacao ? fmtDate(e.data_aplicacao) : '-',
          val(e.estaca),
          val(e.faixa_pista),
          val(e.bordo),
          val(e.temp_pavimento),
          val(e.leitura_1), val(e.leitura_2), val(e.leitura_3), val(e.leitura_4), val(e.leitura_5),
          num(e.maxima), num(e.minima), num(e.vrd),
          classificacaoVRD(e.vrd),
        ]),
        cols: [16, 12, 13, 11, 17, 8, 8, 8, 8, 8, 12, 12, 10, 18],
      })
    );
  }

  sheets.push(
    buildSheet({
      name: 'Resultados',
      title: 'Resultados',
      meta: [
        ['Mancha de Areia — Limites', val(ensaio.limites_mancha || '0,6mm ≤ HS ≤ 1,2mm')],
        ['Mancha de Areia — Média HS (mm)', media(mancha, 'hs_mm', 2)],
        ['Pêndulo Britânico — Limites', val(ensaio.limites_pendulo || 'VRD ≥ 47')],
        ['Pêndulo Britânico — Média VRD', media(pendulo, 'vrd', 1)],
        ['Condição de Conformidade', val(ensaio.condicao_conformidade || 'NÃO INFORMADO')],
      ],
      cols: [34, 30],
    })
  );

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('mancha_pendulo', ensaio.data_ensaio), sheets };
}