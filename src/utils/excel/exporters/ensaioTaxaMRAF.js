import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

/** Taxa de MRAF — bandeja, ensaios individuais e médias. */
export default function buildEnsaioTaxaMRAFExport(ensaio) {
  const dim = ensaio.dimensoes_bandeja || {};
  const ensaios = ensaio.ensaios || [];
  const sheets = [];

  sheets.push(
    buildSheet({
      name: 'Dados Gerais',
      title: 'Taxa de MRAF — Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Material', val(ensaio.material)],
        ['Número do Projeto', val(ensaio.numero_projeto)],
        ['Placa do Caminhão', val(ensaio.placa_caminhao)],
        ['Bandeja — Lado 1 (cm)', val(dim.lado_1)],
        ['Bandeja — Lado 2 (cm)', val(dim.lado_2)],
        ['Bandeja — Área (m²)', val(dim.area)],
        ['Média Taxa de MRAF (kg/m²)', val(ensaio.media_taxa_mraf)],
        ['Média Taxa de Emulsão (L/m²)', val(ensaio.media_taxa_emulsao)],
        ['Média Taxa de Agregado (kg/m²)', val(ensaio.media_taxa_agregado)],
      ],
      cols: [32, 30],
    })
  );

  sheets.push(
    buildSheet({
      name: 'Ensaios',
      title: 'Ensaios Individuais',
      header: [
        'Nº',
        'Estaca',
        'Posição',
        'Bandeja+Amostra P1 (g)',
        'Bandeja P2 (g)',
        'Amostra PA (g)',
        'Taxa MRAF (kg/m²)',
        'Teor de Ligante (%)',
        'Taxa de Ligante (L/m²)',
        'Resíduo Emulsão (%)',
        'Taxa de Emulsão (L/m²)',
        'Taxa de Agregado (kg/m²)',
      ],
      rows: ensaios.map((e, i) => [
        val(e.numero ?? i + 1),
        val(e.estaca),
        val(e.posicao),
        val(e.peso_bandeja_amostra),
        val(e.peso_bandeja),
        val(e.peso_amostra),
        val(e.taxa_mraf_aplicada),
        val(e.teor_ligante),
        val(e.taxa_ligante),
        val(e.residuo_emulsao),
        val(e.taxa_emulsao),
        val(e.taxa_agregado),
      ]),
      cols: [6, 14, 14, 22, 16, 16, 18, 18, 20, 18, 20, 22],
    })
  );

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('taxa_mraf', ensaio.data_ensaio), sheets };
}