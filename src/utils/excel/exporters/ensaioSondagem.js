import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { groupedSheet } from './transposedShared';

const fmt = (v, d = 2) =>
  v === null || v === undefined || v === '' || isNaN(parseFloat(v)) ? '-' : parseFloat(v).toFixed(d);

/**
 * Ensaio de sondagem (corpos de prova extraídos) — clone da tabela
 * "DADOS DO ENSAIO" do PDF, com cabeçalho de dois níveis:
 * LOCALIZAÇÃO | ESPESSURA | DETERM. DENS. APARENTE C.P. | ROMPIMENTO.
 */
export default function buildEnsaioSondagemExport(ensaio) {
  const cps = ensaio.corpos_prova || [];

  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      title: 'Ensaio de Sondagem — Corpos de Prova Extraídos',
      meta: [
        ...obraMeta(ensaio),
        ['Data', fmtDate(ensaio.data)],
        ['Método de Ensaio', val(ensaio.metodo_ensaio)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Serviço', val(ensaio.servico)],
        ['Usina Fornecedora', val(ensaio.usina_fornecedora)],
        ['Fator de Correção da Prensa', val(ensaio.fator_correcao_prensa)],
        ['Densidade da Água a 25°C (g/cm³)', val(ensaio.dens_agua_25c)],
        ['Vv de Projeto (%)', val(ensaio.volume_vazios_projeto)],
        ['Dens. Aparente de Projeto (g/cm³)', val(ensaio.dens_aparente_projeto)],
        ['Dens. RICE de Projeto (g/cm³)', val(ensaio.dens_rice_projeto)],
        ['Espessura de Projeto (cm)', val(ensaio.espessura_projeto)],
      ],
      cols: [34, 40],
    }),
  ];

  const tabela = groupedSheet({
    name: 'Dados do Ensaio',
    title: 'DADOS DO ENSAIO',
    leftCols: [{ label: 'Nº', width: 6 }],
    groups: [
      { label: 'LOCALIZAÇÃO', subs: ['EST.', 'L.'] },
      { label: 'DATA EXEC.', subs: [''] },
      { label: 'ESPESSURA', subs: ['MED.', 'MÉD. (cm)'] },
      { label: 'DETERM. DENS. APARENTE C.P.', subs: ['P. AR (g)', 'P. IM. (g)', 'P. SAT. (g)'] },
      { label: 'VOL. (cm³)', subs: [''] },
      { label: 'DENS. (g/cm³)', subs: [''] },
      { label: 'G.C PROJ. (%)', subs: [''] },
      { label: 'RICE DIA (g/cm³)', subs: [''] },
      { label: 'G.C RICE (%)', subs: [''] },
      { label: 'VOL. VAZ. (%)', subs: [''] },
      { label: 'ROMPIMENTO', subs: ['LEIT. (Kgf)', 'RTCD (MPa)'] },
    ],
    rows: cps.map((cp, i) => {
      const medidas = (cp.medidas_espessura || []).filter((m) => m || m === 0);
      return [
        val(cp.numero ?? i + 1),
        val(cp.estaca),
        cp.lado === 'direito' ? 'D' : cp.lado === 'esquerdo' ? 'E' : '-',
        cp.data_execucao ? fmtDate(cp.data_execucao) : '-',
        medidas.length ? medidas.join(' / ') : '-',
        val(cp.media_espessura),
        val(cp.peso_ao_ar),
        val(cp.peso_imerso),
        val(cp.peso_saturado),
        val(cp.volume),
        fmt(cp.densidade, 3),
        fmt(cp.gc_dens_projeto, 1),
        fmt(cp.dens_rice_do_dia, 3),
        fmt(cp.gc_dens_rice_dia, 1),
        fmt(cp.volume_vazios, 1),
        val(cp.leitura),
        val(cp.rtcd_25c),
      ];
    }),
    subWidth: 13,
  });
  if (tabela) sheets.push(tabela);

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('ensaio_sondagem', ensaio.data), sheets };
}