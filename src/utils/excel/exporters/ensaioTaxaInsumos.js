import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

const TIPO_LABEL = { cimento: 'Cimento', agregado: 'Agregado Complementar' };

/** Ensaio de taxa de insumos — uma linha por determinação. */
export default function buildEnsaioTaxaInsumosExport(ensaio) {
  const ensaios = ensaio.ensaios || [];
  const dim = ensaio.dimensoes_bandeja || {};

  const rows = ensaios.map((e, i) => [
    val(e.numero ?? i + 1),
    val(e.hora),
    val(e.camada),
    val(e.estaca),
    val(e.no_bandeja),
    val(e.peso_bandeja_amostra),
    val(e.peso_bandeja),
    val(e.peso_amostra),
    val(e.taxa_aplicada),
  ]);

  const sheet = buildSheet({
    name: 'Taxa de Insumos',
    meta: [
      ...obraMeta(ensaio),
      ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
      ['Tipo de Insumo', TIPO_LABEL[ensaio.tipo_insumo] || val(ensaio.tipo_insumo)],
      ['Rodovia', val(ensaio.rodovia)],
      ['Trecho', val(ensaio.trecho)],
      ['Material', val(ensaio.material)],
      ['Serviço', val(ensaio.servico)],
      ['Placa do Caminhão', val(ensaio.placa_caminhao)],
      ['Bandeja — Lado 1 (m)', val(dim.lado_1)],
      ['Bandeja — Lado 2 (m)', val(dim.lado_2)],
      ['Bandeja — Área (m²)', val(dim.area)],
    ],
    header: [
      'Nº',
      'Hora',
      'Camada',
      'Estaca',
      'Nº Bandeja',
      'Peso Bandeja + Amostra (g)',
      'Peso Bandeja (g)',
      'Peso Amostra (g)',
      'Taxa Aplicada (kg/m²)',
    ],
    rows,
    cols: [8, 10, 16, 14, 13, 26, 20, 20, 22],
  });

  const sheets = [sheet];

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({
        name: 'Observações',
        meta: [['Observações', ensaio.observacoes]],
        cols: [20, 90],
      })
    );
  }

  return { filename: buildFileName('taxa_insumos', ensaio.data_ensaio), sheets };
}