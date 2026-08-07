import { buildSheet, buildFileName, fmtDate, val, obraMeta, autoRows } from '../excelCore';

/** Mancha de areia + Pêndulo britânico. */
export default function buildEnsaioManchaPenduloExport(ensaio) {
  const sheets = [];

  sheets.push(
    buildSheet({
      name: 'Dados Gerais',
      title: 'Mancha de Areia + Pêndulo — Dados Gerais',
      meta: [
        ...obraMeta(ensaio),
        ['Data do Ensaio', fmtDate(ensaio.data_ensaio)],
        ['Rodovia', val(ensaio.rodovia)],
        ['Trecho', val(ensaio.trecho)],
        ['Empreiteira', val(ensaio.empreiteira)],
        ['Camada', val(ensaio.camada)],
        ['Pista', val(ensaio.pista)],
        ['Órgão', val(ensaio.orgao)],
        ['Limites — Mancha', val(ensaio.limites_mancha)],
        ['Limites — Pêndulo', val(ensaio.limites_pendulo)],
        ['Conformidade', val(ensaio.condicao_conformidade)],
      ],
      cols: [28, 40],
    })
  );

  const mancha = ensaio.ensaios_mancha || [];
  if (mancha.length) {
    const t = autoRows(mancha);
    sheets.push(buildSheet({ name: 'Mancha de Areia', title: 'Ensaios de Mancha de Areia', ...t }));
  }

  const pendulo = ensaio.ensaios_pendulo || [];
  if (pendulo.length) {
    const t = autoRows(pendulo);
    sheets.push(buildSheet({ name: 'Pêndulo', title: 'Ensaios de Pêndulo Britânico', ...t }));
  }

  if (ensaio.observacoes) {
    sheets.push(
      buildSheet({ name: 'Observações', meta: [['Observações', ensaio.observacoes]], cols: [20, 90] })
    );
  }

  return { filename: buildFileName('mancha_pendulo', ensaio.data_ensaio), sheets };
}