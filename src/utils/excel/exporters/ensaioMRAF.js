import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { PENEIRAS } from './peneirasShared';

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

/** Ensaio MRAF — extração de ligante e granulometria. */
export default function buildEnsaioMRAFExport(ensaio) {
  const ext = ensaio.extracao_ligante || {};
  const retidos = ensaio.granulometria?.peso_retido_peneiras || {};
  const sheets = [];

  sheets.push(
    buildSheet({
      name: 'Dados Gerais',
      title: 'Ensaio MRAF — Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Horário', val(ensaio.horario)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Local de Coleta', val(ensaio.local_coleta)],
        ['Pedreira', val(ensaio.pedreira)],
        ['Placa do Caminhão', val(ensaio.placa_caminhao)],
        ['Tipo de Ligante', val(ensaio.tipo_ligante)],
        ['Faixa Especificada', val(ensaio.faixa_especificada)],
        ['Ensaio Realizado Por', val(ensaio.ensaio_realizado_por)],
      ],
      cols: [28, 44],
    })
  );

  sheets.push(
    buildSheet({
      name: 'Extração de Ligante',
      title: 'Extração de Ligante (Rotarex)',
      meta: [
        ['Peso da Amostra (g)', val(ext.peso_amostra)],
        ['Amostra Úmida (g)', val(ext.amostra_umida)],
        ['Amostra Seca (g)', val(ext.amostra_seca)],
        ['Umidade (%)', val(ext.umidade)],
        ['Amostra com Ligante (g)', val(ext.amostra_com_ligante)],
        ['Amostra sem Ligante (g)', val(ext.amostra_sem_ligante)],
        ['Fator de Correção', val(ext.fator_correcao)],
        ['Peso do Ligante (g)', val(ext.peso_ligante)],
        ['Teor de Ligante (%)', val(ext.teor_ligante)],
        ['Resíduo da Emulsão (%)', val(ext.residuo_emulsao)],
        ['Percentual de Emulsão (%)', val(ext.percentual_emulsao)],
      ],
      cols: [30, 22],
    })
  );

  const usadas = PENEIRAS.filter(([key]) => num(retidos[key]) !== null);
  const total = usadas.reduce((s, [key]) => s + (num(retidos[key]) || 0), 0);
  let acumulado = 0;
  const granRows = usadas.map(([key, label]) => {
    const peso = num(retidos[key]) || 0;
    acumulado += peso;
    const acumPct = total ? (acumulado / total) * 100 : 0;
    return [
      label,
      peso,
      Number((total ? (peso / total) * 100 : 0).toFixed(2)),
      Number(acumPct.toFixed(2)),
      Number((100 - acumPct).toFixed(2)),
    ];
  });

  sheets.push(
    buildSheet({
      name: 'Granulometria',
      title: 'Granulometria da Mistura',
      meta: [
        ['Faixa Especificada', val(ensaio.faixa_especificada)],
        ['Peso Total Retido (g)', total ? Number(total.toFixed(2)) : '-'],
      ],
      header: ['Peneira', 'Peso Retido (g)', '% Retida', '% Retida Acum.', '% Passante'],
      rows: granRows,
      cols: [22, 18, 14, 18, 14],
    })
  );

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('ensaio_mraf', ensaio.data_ensaio), sheets };
}