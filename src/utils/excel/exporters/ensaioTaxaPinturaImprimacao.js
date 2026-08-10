import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { paramSheet } from './transposedShared';

const SERVICO_LABEL = { imprimacao: 'Imprimação', ligacao: 'Pintura de Ligação' };

/**
 * Taxa de pinturas asfálticas e resíduo da emulsão (DNIT 145/2012-ES) —
 * clone das tabelas transpostas do PDF (bandejas nas colunas).
 */
export default function buildTaxaPinturaImprimacaoExport(ensaio) {
  const ensaios = ensaio.ensaios || [];
  const dim = ensaio.dimensoes_bandeja || {};
  const colunas = ensaios.map((_, i) => i + 1);
  const area = dim.area != null ? Number(dim.area).toFixed(4) : '-';

  const sheets = [
    buildSheet({
      name: 'Dados da Obra',
      title: 'Ensaio de Taxa de Pinturas Asfálticas e Resíduo da Emulsão — DNIT 145/2012-ES',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Serviço', SERVICO_LABEL[ensaio.tipo_servico] || val(ensaio.tipo_servico)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Material', val(ensaio.material)],
        ['Placa do Caminhão', val(ensaio.placa_caminhao)],
        ['Ensaio Realizado Por', val(ensaio.ensaio_realizado_por)],
        ['Engenheiro Responsável', val(ensaio.engenheiro_responsavel)],
      ],
      cols: [28, 40],
    }),
  ];

  const bandeja = paramSheet({
    name: 'Área da Bandeja',
    title: 'Área da Bandeja',
    labelHeader: 'Nº DA BANDEJA',
    columns: colunas,
    rows: [
      { label: 'LADO 1', calc: 'L₁', unit: 'cm', values: colunas.map(() => val(dim.lado_1)) },
      { label: 'LADO 2', calc: 'L₂', unit: 'cm', values: colunas.map(() => val(dim.lado_2)) },
      { label: 'ÁREA', calc: 'A = L₁ × L₂ / 10000', unit: 'm²', values: colunas.map(() => area), bold: true },
    ],
  });
  if (bandeja) sheets.push(bandeja);

  const execucao = paramSheet({
    name: 'Execução do Ensaio',
    title: 'Execução do Ensaio',
    columns: colunas,
    rows: [
      { label: 'CAMADA', values: ensaios.map((e) => val(e.camada)) },
      { label: 'MATERIAL DA CAMADA', values: ensaios.map((e) => val(e.material_camada)) },
      { label: 'ESTACA DO ENSAIO', values: ensaios.map((e) => val(e.estaca)) },
      { label: 'TEMP. DE APLICAÇÃO DO LIGANTE', unit: '°C', values: ensaios.map((e) => val(e.temperatura_aplicacao)) },
      { label: 'PESO DA BANDEJA+AMOSTRA', calc: 'P₁', unit: 'g', values: ensaios.map((e) => val(e.peso_bandeja_amostra)) },
      { label: 'PESO DA BANDEJA', calc: 'P₂', unit: 'g', values: ensaios.map((e) => val(e.peso_bandeja)) },
      { label: 'PESO DA EMULSÃO', calc: 'E = P₁ − P₂', unit: 'g', values: ensaios.map((e) => val(e.peso_emulsao)), bold: true },
      { label: 'ÁREA DA BANDEJA', calc: 'A', unit: 'm²', values: colunas.map(() => area) },
      { label: 'TAXA APLICADA', calc: 'Tₐ = E / (1000 × A)', unit: 'l/m²', values: ensaios.map((e) => val(e.taxa_aplicada)), bold: true },
      { label: 'TAXA DE EMULSÃO APLICADA', calc: 'Tᵉ = Tₐ', unit: 'l/m²', values: ensaios.map((e) => val(e.taxa_emulsao_aplicada)), bold: true },
      { label: 'TAXA RESIDUAL', calc: 'Tᵣ = Tₐ × (R/100)', unit: 'l/m²', values: ensaios.map((e) => val(e.taxa_residual)), bold: true },
    ],
    labelWidth: 32,
  });
  if (execucao) sheets.push(execucao);

  if (ensaios.some((e) => e.ensaio_residuo && Object.keys(e.ensaio_residuo).length)) {
    const r = (e) => e.ensaio_residuo || {};
    const residuo = paramSheet({
      name: 'Ensaio de Resíduo',
      title: 'Ensaio de Resíduo',
      labelHeader: 'CAMPO',
      columns: colunas,
      rows: [
        { label: 'DATA', values: ensaios.map((e) => (r(e).data ? fmtDate(r(e).data) : '-')) },
        { label: 'TARA', unit: 'g', values: ensaios.map((e) => val(r(e).tara)) },
        { label: 'PESO INICIAL', unit: 'g', values: ensaios.map((e) => val(r(e).peso_inicial)) },
        { label: 'PESO FINAL', unit: 'g', values: ensaios.map((e) => val(r(e).peso_final)) },
        { label: 'RESÍDUO', unit: '%', values: ensaios.map((e) => val(r(e).residuo)), bold: true },
      ],
    });
    if (residuo) sheets.push(residuo);
  }

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('taxa_pintura_imprimacao', ensaio.data_ensaio), sheets };
}