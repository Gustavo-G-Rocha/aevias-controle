import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

const SERVICO_LABEL = {
  remendos: 'Remendos',
  capa_reperfilagem: 'Capa / Reperfilagem',
};

/** Acompanhamento de cargas de CAUQ — uma linha por carga. */
export default function buildAcompanhamentoCargaExport(registro) {
  const cargas = registro.cargas || [];

  const rows = cargas.map((c, i) => [
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
  ]);

  const sheet = buildSheet({
    name: 'Cargas',
    meta: [
      ...obraMeta(registro),
      ['Data', fmtDate(registro.data)],
      ['Rodovia', val(registro.rodovia)],
      ['Trecho', val(registro.trecho)],
      ['Sub-trecho', val(registro.sub_trecho)],
      ['Usina Fornecedora', val(registro.usina_fornecedora)],
      ['Serviço', SERVICO_LABEL[registro.servico] || val(registro.servico)],
    ],
    header: [
      'Nº Carga',
      'Ticket / NF',
      'Placa',
      'Hora Saída',
      'Peso (t)',
      'Hora Chegada',
      'Temp. Chegada (°C)',
      'Hora Aplicação',
      'Temp. Espalhamento (°C)',
      'Temp. Compactação (°C)',
      'Pista',
      'Espessura (cm)',
      'Estaca Inicial',
      'Estaca Final',
      'Observações',
    ],
    rows,
    cols: [10, 16, 12, 12, 10, 13, 18, 14, 22, 22, 12, 14, 14, 14, 34],
  });

  return {
    filename: buildFileName('acompanhamento_carga', registro.data),
    sheets: [sheet],
  };
}