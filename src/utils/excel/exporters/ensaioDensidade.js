import { buildSheet, buildFileName, fmtDate, val, obraMeta } from '../excelCore';

/** Densidade de corpo de prova extraído. */
export default function buildEnsaioDensidadeExport(ensaio) {
  const p = ensaio.pesos || {};
  const sheets = [];

  sheets.push(
    buildSheet({
      name: 'Dados Gerais',
      title: 'Densidade de CP Extraído — Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Identificação da Amostra', val(ensaio.sample_id)],
        ['Data da Extração', fmtDate(ensaio.extraction_date)],
        ['Local da Extração', val(ensaio.location)],
      ],
      cols: [30, 40],
    })
  );

  sheets.push(
    buildSheet({
      name: 'Pesos e Medidas',
      title: 'Pesos e Medidas do Corpo de Prova',
      meta: [
        ['Espessura Média (mm)', val(p.espessura_cp)],
        ['Peso Seco ao Ar (g)', val(p.peso_cp_seco_ar)],
        ['Peso Imerso em Água (g)', val(p.peso_cp_imerso_agua)],
        ['Peso SSS (g)', val(p.peso_cp_sss)],
        ['Densidade Máxima Teórica (g/cm³)', val(p.densidade_maxima_teorica)],
        ['Fator de Correção da Prensa', val(p.fator_correcao_prensa)],
      ],
      cols: [34, 22],
    })
  );

  if (ensaio.observations) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observations]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('densidade_cp', ensaio.extraction_date), sheets };
}