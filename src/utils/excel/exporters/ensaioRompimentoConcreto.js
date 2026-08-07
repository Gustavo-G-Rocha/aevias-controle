import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

/** Rompimento de concreto — compressão axial e tração na flexão. */
export default function buildEnsaioRompimentoConcretoExport(ensaio) {
  const sheets = [];

  sheets.push(
    buildSheet({
      name: 'Dados Gerais',
      title: 'Rompimento de Concreto — Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Cliente', val(ensaio.cliente)],
        ['Construtora', val(ensaio.construtora)],
        ['Fornecedor/Concreteira', val(ensaio.fornecedor)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Estrutura', val(ensaio.estrutura)],
        ['Estaca de Moldagem', val(ensaio.estaca_moldagem)],
        ['Número de Moldagem', val(ensaio.numero_moldagem)],
        ['Projeto/Traço', val(ensaio.projeto_trac)],
        ['Nota Fiscal', val(ensaio.nota_fiscal)],
        ['Volume Betonado (m³)', val(ensaio.volume_betonado)],
        ['Slump Test (mm)', val(ensaio.slump_test)],
        ['Temperatura Ambiente (°C)', val(ensaio.temperatura_ambiente)],
        ['Hora da Moldagem', val(ensaio.hora_moldagem)],
        ['Hora de Saída da Usina', val(ensaio.hora_saida_usina)],
        ['Hora de Chegada no Campo', val(ensaio.hora_chegada_campo)],
      ],
      cols: [30, 40],
    })
  );

  const axial = ensaio.compressao_axial || [];
  if (axial.length) {
    sheets.push(
      buildSheet({
        name: 'Compressão Axial',
        title: 'Resistência à Compressão Axial',
        header: ['CP', 'Idade (dias)', 'Dimensão', 'Data da Ruptura', 'Carga (tf)', 'Área (cm²)', 'Resistência (MPa)'],
        rows: axial.map((c) => [
          val(c.numero_cp),
          val(c.idade),
          val(c.dimensao),
          fmtDate(c.data_ruptura),
          val(c.carga_ruptura),
          val(c.area_cp),
          val(c.resistencia),
        ]),
        cols: [12, 14, 14, 18, 14, 14, 20],
      })
    );
  }

  const flexao = ensaio.tracao_flexao || [];
  if (flexao.length) {
    sheets.push(
      buildSheet({
        name: 'Tração na Flexão',
        title: 'Resistência à Tração na Flexão',
        header: [
          'CP',
          'Ponto de Ruptura',
          'Idade (dias)',
          'Data da Ruptura',
          'Carga (kgf)',
          'Vão Central (mm)',
          'Altura (mm)',
          'Largura (mm)',
          'Resistência (MPa)',
        ],
        rows: flexao.map((c) => [
          val(c.numero_cp),
          val(c.ponto_ruptura),
          val(c.idade),
          fmtDate(c.data_ruptura),
          val(c.carga_ruptura),
          val(c.vao_central),
          val(c.altura_cp),
          val(c.largura_cp),
          val(c.resistencia),
        ]),
        cols: [12, 22, 14, 18, 14, 18, 14, 14, 20],
      })
    );
  }

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('rompimento_concreto', ensaio.data_ensaio), sheets };
}