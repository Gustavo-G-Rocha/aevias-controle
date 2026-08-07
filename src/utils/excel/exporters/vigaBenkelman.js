import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

/** Levantamento deflectométrico — uma linha por posição medida. */
export default function buildVigaBenkelmanExport(ensaio) {
  const levantamentos = ensaio.levantamentos || [];

  const posicoes = [
    ['Bordo Esquerdo', 'bordo_esquerdo'],
    ['Eixo', 'eixo'],
    ['Bordo Direito', 'bordo_direito'],
  ];

  const rows = levantamentos.flatMap((l) =>
    posicoes.map(([label, key]) => [
      val(l.faixa_nome),
      val(l.estaca_km),
      label,
      val(l[key]?.leitura_inicial),
      val(l[key]?.leitura_final),
      val(l[key]?.diferenca),
      val(l[key]?.deflexao),
    ])
  );

  const sheet = buildSheet({
    name: 'Levantamentos',
    meta: [
      ...obraMeta(ensaio),
      ['Data', fmtDate(ensaio.data_realizacao || ensaio.data_ensaio)],
      ['Rodovia', val(ensaio.rodovia)],
      ['Trecho', val(ensaio.trecho)],
      ['Def. Admissível (x10⁻²mm)', val(ensaio.def_admissivel)],
    ],
    header: [
      'Faixa',
      'Local (Estaca/KM)',
      'Posição',
      'Leitura Inicial (A)',
      'Leitura Final (B)',
      'Diferença (C = A - B)',
      'Deflexão (x10⁻²mm)',
    ],
    rows,
    cols: [22, 22, 16, 20, 20, 22, 22],
  });

  return {
    filename: buildFileName('viga_benkelman', ensaio.data_realizacao || ensaio.data_ensaio),
    sheets: [sheet],
  };
}