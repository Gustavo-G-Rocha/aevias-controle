import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

/** Registro de fresagem e recomposição — uma linha por lançamento. */
export default function buildRegistroFresagemCBUQExport(registro) {
  const lancamentos = registro.registros || [];
  const refLocal = registro.tipo_localizacao === 'estaca' ? 'Estaca' : 'Km';

  const rows = lancamentos.map((r) => [
    val(r.localizacao_inicial),
    val(r.localizacao_final),
    val(r.faixa),
    val(r.largura_m),
    val(r.extensao_m),
    val(r.espessura_m),
    val(r.pintura_bd_be_mts),
    val(r.pintura_4x12_qtde),
    val(r.pintura_2x2_qtde),
    val(r.pintura_zebrado_mts),
    val(r.tacha_bd_be_unid),
    val(r.tacha_4x12_unid),
    val(r.tacha_2x2_unid),
    val(r.tacha_zebrado_unid),
    val(r.dreno_m),
  ]);

  const clima = registro.condicoes_tempo || {};

  const sheet = buildSheet({
    name: 'Fresagem e CBUQ',
    meta: [
      ...obraMeta(registro),
      ['Início da Atividade', fmtDate(registro.data)],
      ['Fim da Atividade', fmtDate(registro.data_fim)],
      ['Contratada', val(registro.contratada)],
      ['Nº do Contrato', val(registro.numero_contrato)],
      ['Rodovia', val(registro.rodovia)],
      ['Material', val(registro.material)],
      ['Camada', val(registro.camada)],
      ['Especificação Granulométrica', val(registro.especificacao_granulometrica)],
      ['Sentido da Pista', (registro.sentido_pista || []).join(', ') || '-'],
      ['Tempo (Manhã / Tarde / Noite)', `${val(clima.manha)} / ${val(clima.tarde)} / ${val(clima.noite)}`],
    ],
    header: [
      `${refLocal} Inicial`,
      `${refLocal} Final`,
      'Faixa',
      'Largura (m)',
      'Extensão (m)',
      'Espessura (m)',
      'Pintura BD/BE (m)',
      'Pintura 4x12 (bastões)',
      'Pintura 2x2 (bastões)',
      'Pintura Zebrado (m)',
      'Tacha BD/BE (un)',
      'Tacha 4x12 (un)',
      'Tacha 2x2 (un)',
      'Tacha Zebrado (un)',
      'Dreno (m)',
    ],
    rows,
    cols: [14, 14, 10, 12, 13, 13, 18, 20, 20, 19, 16, 16, 16, 18, 12],
  });

  const sheets = [sheet];

  if (registro.observacoes) {
    sheets.push(
      buildSheet({
        name: 'Observações',
        meta: [['Observações', registro.observacoes]],
        cols: [20, 90],
      })
    );
  }

  return { filename: buildFileName('fresagem_cbuq', registro.data), sheets };
}