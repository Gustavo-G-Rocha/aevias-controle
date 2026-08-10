import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { paramSheet } from './transposedShared';

/** Parâmetros da tabela "EXECUÇÃO DO ENSAIO" do PDF, na mesma ordem. */
const DADOS_ENSAIO = [
  { label: 'Estaca do Ensaio', field: 'estaca' },
  { label: 'Posição', field: 'posicao' },
  { label: 'Peso da Bandeja+Amostra', calc: 'P₁', unit: 'g', field: 'peso_bandeja_amostra' },
  { label: 'Peso da Bandeja', calc: 'P₂', unit: 'g', field: 'peso_bandeja' },
  { label: 'Peso da Amostra', calc: 'Pₐ = P₁ − P₂', unit: 'g', field: 'peso_amostra', bold: true },
  { label: 'Taxa de MRAF Aplicada', calc: 'Tₓ = Pₐ/(1000×A)', unit: 'kg/m²', field: 'taxa_mraf_aplicada', bold: true },
  { label: 'Teor de Ligante', calc: 'L (ensaio extração)', unit: '%', field: 'teor_ligante' },
  { label: 'Taxa de Ligante', calc: 'T_L = (Tₓ×L)/(100+L)', unit: 'L/m²', field: 'taxa_ligante' },
  { label: 'Resíduo da Emulsão', calc: 'R', unit: '%', field: 'residuo_emulsao' },
  { label: 'Taxa de Emulsão', calc: 'T_E = T_L / R', unit: 'L/m²', field: 'taxa_emulsao', bold: true },
  { label: 'Taxa de Agregado', calc: 'T_A = Tₓ − T_L', unit: 'kg/m²', field: 'taxa_agregado', bold: true },
];

/** Taxa de MRAF — clone das tabelas transpostas do PDF (bandejas nas colunas). */
export default function buildEnsaioTaxaMRAFExport(ensaio) {
  const dim = ensaio.dimensoes_bandeja || {};
  const ensaios = ensaio.ensaios || [];
  const colunas = ensaios.map((_, i) => `Bandeja ${i + 1}`);
  const area = dim.area != null ? Number(dim.area).toFixed(4) : '-';

  const sheets = [
    buildSheet({
      name: 'Dados da Obra',
      title: 'Ensaio de Taxa de MRAF — Dados da Obra',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Material', val(ensaio.material)],
        ['Número do Projeto', val(ensaio.numero_projeto)],
        ['Placa do Caminhão', val(ensaio.placa_caminhao)],
      ],
      cols: [28, 40],
    }),
  ];

  const bandeja = paramSheet({
    name: 'Área da Bandeja',
    title: 'Área da Bandeja',
    columns: colunas,
    rows: [
      { label: 'Lado 1', calc: 'L₁', unit: 'cm', values: colunas.map(() => val(dim.lado_1)) },
      { label: 'Lado 2', calc: 'L₂', unit: 'cm', values: colunas.map(() => val(dim.lado_2)) },
      { label: 'Área', calc: 'A = L₁ × L₂ / 10000', unit: 'm²', values: colunas.map(() => area), bold: true },
    ],
  });
  if (bandeja) sheets.push(bandeja);

  const execucao = paramSheet({
    name: 'Execução do Ensaio',
    title: 'Execução do Ensaio',
    columns: colunas,
    rows: DADOS_ENSAIO.map((p) => ({
      label: p.label,
      calc: p.calc,
      unit: p.unit,
      bold: p.bold,
      values: ensaios.map((e) => val(e[p.field])),
    })),
  });
  if (execucao) sheets.push(execucao);

  sheets.push(
    buildSheet({
      name: 'Médias',
      title: 'Médias do Ensaio',
      meta: [
        ['Média Taxa de MRAF (kg/m²)', val(ensaio.media_taxa_mraf)],
        ['Média Taxa de Emulsão (L/m²)', val(ensaio.media_taxa_emulsao)],
        ['Média Taxa de Agregado (kg/m²)', val(ensaio.media_taxa_agregado)],
      ],
      cols: [32, 26],
    })
  );

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('taxa_mraf', ensaio.data_ensaio), sheets };
}