import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

/** Acompanhamento de usinagem — agregados e cargas produzidas. */
export default function buildAcompanhamentoUsinagemExport(registro) {
  const agregados = registro.agregados || [];
  const cargas = registro.cargas || [];

  const sheets = [
    buildSheet({
      name: 'Dados Gerais',
      meta: [
        ...obraMeta(registro),
        ['Data', fmtDate(registro.data)],
        ['Rodovia', val(registro.rodovia)],
        ['Trecho', val(registro.trecho)],
        ['Usina', val(registro.usina)],
        ['Pedreira', val(registro.pedreira)],
        ['Nº do Projeto', val(registro.numero_projeto)],
        ['Faixa Especificada', val(registro.faixa_especificada)],
        ['Ligante', val(registro.ligante_nome)],
        ['Temperatura do Ligante (°C)', val(registro.temperatura_ligante)],
      ],
      cols: [30, 44],
    }),
    buildSheet({
      name: 'Agregados',
      header: ['Agregado', 'Composição (%)', 'Umidade (%)', 'Temp. T1 (°C)', 'Temp. T2 (°C)'],
      rows: agregados.map((a) => [
        val(a.nome),
        val(a.composicao),
        val(a.umidade),
        val(a.temperatura_t1),
        val(a.temperatura_t2),
      ]),
      cols: [30, 16, 14, 15, 15],
    }),
    buildSheet({
      name: 'Cargas',
      header: ['Nº', 'Placa', 'Hora de Saída', 'Peso (t)', 'Temp. 1 (°C)', 'Temp. 2 (°C)', 'Observação'],
      rows: cargas.map((c, i) => [
        i + 1,
        val(c.placa_caminhao),
        val(c.hora_saida),
        val(c.peso),
        val(c.temperatura_1),
        val(c.temperatura_2),
        val(c.observacao),
      ]),
      cols: [6, 14, 15, 12, 14, 14, 40],
    }),
  ];

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