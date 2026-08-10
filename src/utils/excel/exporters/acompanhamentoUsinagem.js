import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { groupedSheet } from './transposedShared';

/**
 * Acompanhamento de usinagem — clone das tabelas do PDF:
 * "DADOS DO ENSAIO" (agregados com grupo TEMPERATURAS T1/T2, iniciando pela
 * linha LIGANTE) e a tabela de cargas produzidas.
 */
export default function buildAcompanhamentoUsinagemExport(registro) {
  const agregados = registro.agregados || [];
  const cargas = registro.cargas || [];

  const sheets = [
    buildSheet({
      name: 'Dados da Obra',
      title: 'Acompanhamento de Usinagem — Dados da Obra',
      meta: [
        ...obraMeta(registro),
        ['Data', fmtDate(registro.data)],
        ['Rodovia', val(registro.rodovia)],
        ['Trecho', val(registro.trecho)],
        ['Usina', val(registro.usina)],
        ['Pedreira', val(registro.pedreira)],
        ['Nº do Projeto', val(registro.numero_projeto)],
        ['Faixa Especificada', val(registro.faixa_especificada)],
      ],
      cols: [30, 44],
    }),
  ];

  const ensaioTable = groupedSheet({
    name: 'Dados do Ensaio',
    title: 'DADOS DO ENSAIO',
    leftCols: [{ label: 'AGREGADOS', width: 30 }],
    groups: [
      { label: 'COMPOSIÇÃO (%)', subs: [''] },
      { label: 'UMIDADE (%)', subs: [''] },
      { label: 'TEMPERATURAS', subs: ['T1 (°C)', 'T2 (°C)'] },
    ],
    rows: [
      ['LIGANTE', val(registro.ligante_nome), '-', val(registro.temperatura_ligante), '-'],
      ...agregados.map((a, i) => [
        val(a.nome || `Agregado ${i + 1}`),
        val(a.composicao),
        val(a.umidade),
        val(a.temperatura_t1),
        val(a.temperatura_t2),
      ]),
    ],
    subWidth: 16,
  });
  if (ensaioTable) sheets.push(ensaioTable);

  if (cargas.length) {
    sheets.push(
      buildSheet({
        name: 'Cargas',
        title: 'CARGAS PRODUZIDAS',
        header: [
          'PLACA CAMINHÃO',
          'HORA DE SAÍDA',
          'PESO (t)',
          'TEMPERATURA (°C)',
          'TEMPERATURA (°C)',
          'OBSERVAÇÕES',
        ],
        rows: cargas.map((c) => [
          val(c.placa_caminhao),
          val(c.hora_saida),
          val(c.peso),
          val(c.temperatura_1),
          val(c.temperatura_2),
          val(c.observacao),
        ]),
        cols: [18, 16, 10, 18, 18, 44],
      })
    );
  }

  if (registro.observacoes_gerais) {
    sheets.push(
      buildSheet({
        name: 'Observações',
        meta: [['Observações Gerais', registro.observacoes_gerais]],
        cols: [24, 90],
      })
    );
  }

  return { filename: buildFileName('acompanhamento_usinagem', registro.data), sheets };
}