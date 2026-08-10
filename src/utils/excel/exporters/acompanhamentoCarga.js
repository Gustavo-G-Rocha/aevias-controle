import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { groupedSheet } from './transposedShared';

const SERVICO_LABEL = {
  remendos: 'Remendos',
  capa_reperfilagem: 'Capa / Reperfilagem',
};

/**
 * Acompanhamento de cargas de CAUQ — clone da tabela do PDF, com cabeçalho
 * de dois níveis: DADOS DA USINA (5 colunas) | DADOS DA PISTA (10 colunas).
 */
export default function buildAcompanhamentoCargaExport(registro) {
  const cargas = registro.cargas || [];

  const sheets = [
    buildSheet({
      name: 'Dados da Obra',
      title: 'Acompanhamento de Cargas — Dados da Obra',
      meta: [
        ...obraMeta(registro),
        ['Data', fmtDate(registro.data)],
        ['Rodovia', val(registro.rodovia)],
        ['Trecho', val(registro.trecho)],
        ['Sub-trecho', val(registro.sub_trecho)],
        ['Usina Fornecedora', val(registro.usina_fornecedora)],
        ['Serviço', SERVICO_LABEL[registro.servico] || val(registro.servico)],
      ],
      cols: [28, 40],
    }),
  ];

  const tabela = groupedSheet({
    name: 'Cargas',
    title: 'CONTROLE DE CARGAS',
    groups: [
      {
        label: 'DADOS DA USINA',
        subs: ['N° CARGA', 'N° TICKET/NF', 'PLACA', 'HORA SAÍDA', 'PESO (t)'],
      },
      {
        label: 'DADOS DA PISTA',
        subs: [
          'HORA CHEGADA',
          'TEMP. CHEGADA (°C)',
          'HORA APLIC.',
          'TEMP. ESPALH. (°C)',
          'TEMP. COMPACT. (°C)',
          'PISTA',
          'ESPESSURA (cm)',
          'ESTACA IN.',
          'ESTACA FIN.',
          'OBSERVAÇÕES',
        ],
      },
    ],
    rows: cargas.map((c, i) => [
      val(c.numero_carga ?? i + 1),
      val(c.numero_ticket_nf),
      val(c.placa),
      val(c.hora_saida),
      val(c.peso_toneladas),
      val(c.hora_chegada),
      val(c.temp_chegada),
      val(c.hora_aplicacao),
      val(c.temp_espalhamento),
      val(c.temp_compactacao),
      val(c.pista),
      val(c.espessura_cm),
      val(c.estaca_inicial),
      val(c.estaca_final),
      val(c.observacoes),
    ]),
    subWidth: 14,
  });
  if (tabela) sheets.push(tabela);

  if (registro.observacoes_gerais) {
    sheets.push(
      buildSheet({
        name: 'Observação Geral',
        meta: [['Observação Geral', registro.observacoes_gerais]],
        cols: [22, 90],
      })
    );
  }

  return { filename: buildFileName('acompanhamento_carga', registro.data), sheets };
}