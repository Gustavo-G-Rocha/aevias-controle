import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { groupedSheet } from './transposedShared';

const POSICOES = [
  ['BORDO ESQUERDO', 'bordo_esquerdo'],
  ['EIXO', 'eixo'],
  ['BORDO DIREITO', 'bordo_direito'],
];
const SUBS = ['Leitura Inicial (A)', 'Leitura Final (B)', 'Diferença (C = A - B)', 'Deflexão (x10⁻²mm)'];

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

/** Estatísticas de um conjunto de deflexões, como o bloco do PDF. */
function stats(levantamentos, key) {
  const arr = levantamentos
    .map((l) => num(l[key]?.deflexao))
    .filter((v) => v !== null && v > 0);
  const qt = arr.length;
  const media = qt ? arr.reduce((a, b) => a + b, 0) / qt : 0;
  const desv = qt ? Math.sqrt(arr.reduce((s, v) => s + (v - media) ** 2, 0) / qt) : 0;
  return { qt, media: media.toFixed(0), desv: desv.toFixed(0) };
}

/**
 * Levantamento deflectométrico por Viga Benkelman — clone da tabela do PDF:
 * Estaca/km + três grupos de bordos com cabeçalho mesclado, uma seção por faixa,
 * seguida do controle estatístico.
 */
export default function buildVigaBenkelmanExport(ensaio) {
  const levantamentos = ensaio.levantamentos || [];

  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      title: 'Levantamento Deflectométrico por Viga Benkelman',
      meta: [
        ...obraMeta(ensaio),
        ['Data da Aplicação', fmtDate(ensaio.data_ensaio)],
        ['Data de Realização', fmtDate(ensaio.data_realizacao)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Empreiteira', val(ensaio.empreiteira)],
        ['Material', val(ensaio.material)],
        ['Procedência', val(ensaio.procedencia)],
        ['Pista / Faixa', val(ensaio.pista_faixa)],
        ['Camada', val(ensaio.camada)],
        ['Cte. da Viga', val(ensaio.cte_viga)],
        ['Def. Admissível (x10⁻²mm)', val(ensaio.def_admissivel)],
      ],
      cols: [28, 40],
    }),
  ];

  // Uma seção por faixa, como as páginas do PDF.
  const faixas = [...new Set(levantamentos.map((l) => l.faixa_nome || ''))];
  faixas.forEach((faixaNome) => {
    const doGrupo = levantamentos.filter((l) => (l.faixa_nome || '') === faixaNome);
    const tabela = groupedSheet({
      name: faixaNome ? `Faixa ${faixaNome}` : 'Levantamentos',
      title: faixaNome
        ? `Levantamento Deflectométrico — Faixa ${faixaNome}`
        : 'Levantamento Deflectométrico',
      leftCols: [{ label: 'Estaca / km', width: 18 }],
      groups: POSICOES.map(([label]) => ({ label, subs: SUBS })),
      rows: doGrupo.map((l) => [
        val(l.estaca_km),
        ...POSICOES.flatMap(([, key]) => [
          val(l[key]?.leitura_inicial),
          val(l[key]?.leitura_final),
          val(l[key]?.diferenca),
          val(l[key]?.deflexao),
        ]),
      ]),
      subWidth: 13,
    });
    if (tabela) sheets.push(tabela);

    const be = stats(doGrupo, 'bordo_esquerdo');
    const ei = stats(doGrupo, 'eixo');
    const bd = stats(doGrupo, 'bordo_direito');
    sheets.push(
      buildSheet({
        name: 'Controle Estatístico',
        title: faixaNome
          ? `Controle Estatístico — Faixa ${faixaNome}`
          : 'Controle Estatístico',
        header: ['', 'Bordo Esquerdo', 'Eixo', 'Bordo Direito'],
        rows: [
          ['Qt. Leituras', be.qt, ei.qt, bd.qt],
          ['Média', be.media, ei.media, bd.media],
          ['Desv. Pad.', be.desv, ei.desv, bd.desv],
        ],
        cols: [20, 20, 20, 20],
      })
    );
  });

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return {
    filename: buildFileName('viga_benkelman', ensaio.data_realizacao || ensaio.data_ensaio),
    sheets,
  };
}