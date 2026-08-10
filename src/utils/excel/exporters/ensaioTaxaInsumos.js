import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { paramSheet } from './transposedShared';

const TIPO_LABEL = { cimento: 'Cimento', agregado: 'Agregado Complementar' };

/**
 * Taxa de insumos — clone das tabelas do PDF:
 * ÁREA DA BANDEJA e EXECUÇÃO DO ENSAIO transpostas (bandejas nas colunas).
 */
export default function buildEnsaioTaxaInsumosExport(ensaio) {
  const ensaios = ensaio.ensaios || [];
  const dim = ensaio.dimensoes_bandeja || {};
  const colunas = ensaios.map((_, i) => i + 1);
  const area = dim.area != null ? Number(dim.area).toFixed(4) : '-';

  const titulo = ensaio.tipo_insumo === 'cimento' ? 'Taxa de Cimento' : 'Taxa de Agregado';

  const sheets = [
    buildSheet({
      name: 'Dados da Obra',
      title: `${titulo} — Dados da Obra`,
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Tipo de Insumo', TIPO_LABEL[ensaio.tipo_insumo] || val(ensaio.tipo_insumo)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Material', val(ensaio.material)],
        ['Serviço', val(ensaio.servico)],
        ['Placa do Caminhão', val(ensaio.placa_caminhao)],
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
      { label: 'HORA DO ENSAIO', values: ensaios.map((e) => val(e.hora)) },
      { label: 'CAMADA', values: ensaios.map((e) => val(e.camada)) },
      { label: 'ESTACA DO ENSAIO', values: ensaios.map((e) => val(e.estaca)) },
      { label: 'Nº DA BANDEJA', values: ensaios.map((e) => val(e.no_bandeja)) },
      { label: 'PESO DA BANDEJA+AMOSTRA', calc: 'P₁', unit: 'g', values: ensaios.map((e) => val(e.peso_bandeja_amostra)) },
      { label: 'PESO DA BANDEJA', calc: 'P₂', unit: 'g', values: ensaios.map((e) => val(e.peso_bandeja)) },
      { label: 'PESO DA AMOSTRA', calc: 'C = P₁ − P₂', unit: 'g', values: ensaios.map((e) => val(e.peso_amostra)), bold: true },
      { label: 'ÁREA DA BANDEJA', calc: 'A', unit: 'm²', values: colunas.map(() => area) },
      { label: 'TAXA APLICADA', calc: 'Tc = C / (1000 × A)', unit: 'kg/m²', values: ensaios.map((e) => val(e.taxa_aplicada)), bold: true },
    ],
  });
  if (execucao) sheets.push(execucao);

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('taxa_insumos', ensaio.data_ensaio), sheets };
}