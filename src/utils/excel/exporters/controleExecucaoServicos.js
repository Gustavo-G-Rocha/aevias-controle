import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

/** Controle de execução de serviços — uma linha por serviço. */
export default function buildControleExecucaoServicosExport(registro) {
  const servicos = registro.servicos || [];

  const rows = servicos.map((s) => [
    val(s.servico),
    val(s.estaca_inicial),
    val(s.estaca_final),
    val(s.comprimento_m),
    val(s.largura_m),
    val(s.espessura_cm),
    val(s.quantidade),
    val(s.executora),
  ]);

  const sheet = buildSheet({
    name: 'Serviços',
    meta: [
      ...obraMeta(registro),
      ['Data', fmtDate(registro.data)],
      ['Rodovia', val(registro.rodovia)],
      ['Trecho', val(registro.trecho)],
    ],
    header: [
      'Serviço',
      'Estaca Inicial',
      'Estaca Final',
      'Comprimento (m)',
      'Largura (m)',
      'Espessura (cm)',
      'Quantidade',
      'Executora',
    ],
    rows,
    cols: [40, 15, 15, 17, 14, 16, 13, 24],
  });

  const sheets = [sheet];

  if (registro.observacoes_gerais) {
    sheets.push(
      buildSheet({
        name: 'Observações',
        meta: [['Observações Gerais', registro.observacoes_gerais]],
        cols: [22, 90],
      })
    );
  }

  return { filename: buildFileName('controle_execucao_servicos', registro.data), sheets };
}