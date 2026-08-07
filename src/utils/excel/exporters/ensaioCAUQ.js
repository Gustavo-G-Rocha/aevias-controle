import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';
import { PENEIRAS } from './peneirasShared';

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

/** Ensaio CAUQ — extração de ligante, granulometria, RICE e Marshall. */
export default function buildEnsaioCAUQExport(ensaio) {
  const ext = ensaio.extracao_ligante || {};
  const retidos = ensaio.granulometria?.peso_retido_peneiras || {};
  const rice = ensaio.densidade_rice || {};
  const cps = ensaio.corpos_prova_marshall || [];

  const sheets = [];

  // ── Dados gerais ──
  sheets.push(
    buildSheet({
      name: 'Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Horário', val(ensaio.horario)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Local de Coleta', val(ensaio.local_coleta)],
        ['Usina Fornecedora', val(ensaio.usina_fornecedora)],
        ['Pedreira', val(ensaio.pedreira)],
        ['Placa do Caminhão', val(ensaio.placa_caminhao)],
        ['Tipo de Ligante', val(ensaio.tipo_ligante)],
        ['Temperatura do CAP (°C)', val(ensaio.temperatura_cap)],
        ['Faixa Especificada', val(ensaio.faixa_especificada)],
        ['Ensaio Realizado Por', val(ensaio.ensaio_realizado_por)],
      ],
      cols: [28, 44],
    })
  );

  // ── Extração de ligante ──
  sheets.push(
    buildSheet({
      name: 'Extração de Ligante',
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
        ['Teor de Ligante Real (%)', val(ext.teor_ligante_real)],
        ['Relação Filler/Betume', val(ext.filler_betume)],
      ],
      cols: [30, 22],
    })
  );

  // ── Granulometria: peso retido, % retida e % passante acumulada ──
  const usadas = PENEIRAS.filter(([key]) => num(retidos[key]) !== null);
  const total = usadas.reduce((s, [key]) => s + (num(retidos[key]) || 0), 0);
  let acumulado = 0;
  const granRows = usadas.map(([key, label]) => {
    const peso = num(retidos[key]) || 0;
    acumulado += peso;
    const retidaPct = total ? (peso / total) * 100 : 0;
    const acumPct = total ? (acumulado / total) * 100 : 0;
    return [
      label,
      peso,
      Number(retidaPct.toFixed(2)),
      Number(acumPct.toFixed(2)),
      Number((100 - acumPct).toFixed(2)),
    ];
  });

  sheets.push(
    buildSheet({
      name: 'Granulometria',
      meta: [
        ['Faixa Especificada', val(ensaio.faixa_especificada)],
        ['Peso Total Retido (g)', total ? Number(total.toFixed(2)) : '-'],
      ],
      header: ['Peneira', 'Peso Retido (g)', '% Retida', '% Retida Acum.', '% Passante'],
      rows: granRows,
      cols: [22, 18, 14, 18, 14],
    })
  );

  // ── Densidade RICE ──
  if (ensaio.realizar_densidade_rice) {
    sheets.push(
      buildSheet({
        name: 'Densidade RICE',
        meta: [
          ['Frasco + Água (g)', val(rice.frasco_agua)],
          ['Amostra (g)', val(rice.amostra)],
          ['Frasco + Água + Amostra (g)', val(rice.frasco_agua_amostra)],
          ['Temperatura da Água (°C)', val(rice.temperatura_agua)],
          ['Densidade da Água (g/cm³)', val(rice.densidade_agua)],
          ['Densidade RICE (g/cm³)', val(rice.densidade_rice)],
        ],
        cols: [32, 20],
      })
    );
  }

  // ── Marshall ──
  if (cps.length) {
    sheets.push(
      buildSheet({
        name: 'Marshall',
        header: [
          'CP',
          'Método',
          'Peso ao Ar (g)',
          'Peso Imerso (g)',
          'Peso SSS (g)',
          'Volume (cm³)',
          'Dens. Aparente (g/cm³)',
          'Vv (%)',
          'VCB (%)',
          'VAM (%)',
          'RBV (%)',
          'Altura (mm)',
          'RTCD (MPa)',
          'Estabilidade (kgf)',
          'Fluência (mm)',
        ],
        rows: cps.map((cp, i) => [
          val(cp.numero ?? i + 1),
          cp.metodo_rompimento === 'diametral' ? 'Compressão Diametral' : 'Estabilidade/Fluência',
          val(cp.peso_ar),
          val(cp.peso_imerso),
          val(cp.peso_sss),
          val(cp.volume),
          val(cp.densidade_aparente),
          val(cp.volume_vazios),
          val(cp.vcb),
          val(cp.vam),
          val(cp.rbv),
          val(cp.altura),
          val(cp.rtcd_valor),
          val(cp.estabilidade_corrigida),
          val(cp.fluencia),
        ]),
        cols: [6, 22, 14, 14, 14, 13, 20, 10, 10, 10, 10, 12, 12, 18, 14],
      })
    );
  }

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('ensaio_cauq', ensaio.data_ensaio), sheets };
}