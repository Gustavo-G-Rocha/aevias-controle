import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

const LADO_LABEL = { direito: 'Direito', esquerdo: 'Esquerdo' };

/** Ensaio de sondagem (corpos de prova extraídos) — uma linha por CP. */
export default function buildEnsaioSondagemExport(ensaio) {
  const cps = ensaio.corpos_prova || [];

  const sheets = [
    buildSheet({
      name: 'Corpos de Prova',
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
        ['Densidade Aparente de Projeto (g/cm³)', val(ensaio.dens_aparente_projeto)],
        ['Densidade RICE de Projeto (g/cm³)', val(ensaio.dens_rice_projeto)],
        ['Espessura de Projeto (cm)', val(ensaio.espessura_projeto)],
      ],
      header: [
        'CP',
        'Data de Execução',
        'Estaca',
        'Lado',
        'Esp. 1',
        'Esp. 2',
        'Esp. 3',
        'Esp. 4',
        'Esp. Média (cm)',
        'Peso ao Ar (g)',
        'Peso Imerso (g)',
        'Peso Saturado (g)',
        'Volume (cm³)',
        'Densidade (g/cm³)',
        'G.C. Dens. Projeto (%)',
        'Dens. RICE do Dia (g/cm³)',
        'G.C. RICE do Dia (%)',
        'Vv (%)',
        'Leitura (kgf/cm²)',
        'RTCD 25°C (MPa)',
      ],
      rows: cps.map((cp, i) => {
        const m = cp.medidas_espessura || [];
        return [
          val(cp.numero ?? i + 1),
          cp.data_execucao ? fmtDate(cp.data_execucao) : '-',
          val(cp.estaca),
          LADO_LABEL[cp.lado] || val(cp.lado),
          val(m[0]),
          val(m[1]),
          val(m[2]),
          val(m[3]),
          val(cp.media_espessura),
          val(cp.peso_ao_ar),
          val(cp.peso_imerso),
          val(cp.peso_saturado),
          val(cp.volume),
          val(cp.densidade),
          val(cp.gc_dens_projeto),
          val(cp.dens_rice_do_dia),
          val(cp.gc_dens_rice_dia),
          val(cp.volume_vazios),
          val(cp.leitura),
          val(cp.rtcd_25c),
        ];
      }),
      cols: [6, 16, 12, 11, 9, 9, 9, 9, 15, 14, 14, 16, 13, 16, 20, 22, 19, 10, 17, 16],
    }),
  ];

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('ensaio_sondagem', ensaio.data), sheets };
}