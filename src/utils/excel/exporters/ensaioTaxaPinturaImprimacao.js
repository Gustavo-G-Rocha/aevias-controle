import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

const SERVICO_LABEL = { imprimacao: 'Imprimação', ligacao: 'Pintura de Ligação' };

/** Taxa de pintura / imprimação — uma linha por ensaio, mais o ensaio de resíduo. */
export default function buildTaxaPinturaImprimacaoExport(ensaio) {
  const ensaios = ensaio.ensaios || [];
  const dim = ensaio.dimensoes_bandeja || {};

  const sheets = [
    buildSheet({
      name: 'Taxa Aplicada',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Tipo de Serviço', SERVICO_LABEL[ensaio.tipo_servico] || val(ensaio.tipo_servico)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Material', val(ensaio.material)],
        ['Placa do Caminhão', val(ensaio.placa_caminhao)],
        ['Engenheiro Responsável', val(ensaio.engenheiro_responsavel)],
        ['Bandeja — Lado 1 (cm)', val(dim.lado_1)],
        ['Bandeja — Lado 2 (cm)', val(dim.lado_2)],
        ['Bandeja — Área (m²)', val(dim.area)],
      ],
      header: [
        'Nº',
        'Hora',
        'Camada',
        'Material da Camada',
        'Estaca',
        'Temp. Aplicação (°C)',
        'Peso Bandeja + Amostra (g)',
        'Peso Bandeja (g)',
        'Peso Emulsão (g)',
        'Taxa Aplicada (l/m²)',
        'Taxa Emulsão (l/m²)',
        'Taxa Residual (l/m²)',
      ],
      rows: ensaios.map((e, i) => [
        val(e.numero ?? i + 1),
        val(e.hora),
        val(e.camada),
        val(e.material_camada),
        val(e.estaca),
        val(e.temperatura_aplicacao),
        val(e.peso_bandeja_amostra),
        val(e.peso_bandeja),
        val(e.peso_emulsao),
        val(e.taxa_aplicada),
        val(e.taxa_emulsao_aplicada),
        val(e.taxa_residual),
      ]),
      cols: [6, 10, 16, 20, 12, 18, 24, 18, 18, 20, 20, 20],
    }),
  ];

  const residuos = ensaios.filter((e) => e.ensaio_residuo && Object.keys(e.ensaio_residuo).length);
  if (residuos.length) {
    sheets.push(
      buildSheet({
        name: 'Ensaio de Resíduo',
        header: ['Nº', 'Data', 'Tara (g)', 'Peso Inicial (g)', 'Peso Final (g)', 'Resíduo (%)'],
        rows: residuos.map((e, i) => {
          const r = e.ensaio_residuo || {};
          return [
            val(e.numero ?? i + 1),
            r.data ? fmtDate(r.data) : '-',
            val(r.tara),
            val(r.peso_inicial),
            val(r.peso_final),
            val(r.residuo),
          ];
        }),
        cols: [6, 14, 12, 18, 18, 14],
      })
    );
  }

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('taxa_pintura_imprimacao', ensaio.data_ensaio), sheets };
}