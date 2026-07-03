// Constantes e cálculo de estatísticas de laboratoristas.
// Extraídos de pages/ControleLaboratoristas.jsx.

export const CONTROLE_LAB_ENTITIES = [
  'DiarioObra', 'ChecklistUsina', 'ChecklistAplicacao', 'ChecklistMRAF',
  'ChecklistConcretagem', 'ChecklistTerraplanagem', 'ChecklistReciclagem', 'EnsaioCAUQ',
  'EnsaioMRAF', 'EnsaioDensidade', 'EnsaioDensidadeInSitu', 'EnsaioSondagem',
  'EnsaioTaxaPinturaImprimacao', 'EnsaioGranulometriaIndividual', 'EnsaioManchaPendulo',
  'EnsaioVigaBenkelman', 'AcompanhamentoUsinagem', 'AcompanhamentoCarga', 'EnsaioProctor',
  'EnsaioRompimentoConcreto', 'EnsaioTaxaMRAF', 'GranuMistura', 'BoletimSondagem', 'BoletimSondagemTrado',
];

/**
 * Agrega estatísticas (total, aprovados, reprovados, registros por obra e
 * percentual de reprovação) a partir de uma lista de registros.
 * @param {object[]} registros
 * @returns {object[]} estatísticas ordenadas por total decrescente
 */
export function calcularEstatisticasLaboratoristas(registros) {
  const stats = {};

  registros.forEach(registro => {
    const labName = registro.laboratorista_name || registro.created_by?.split('@')[0] || 'Sem nome';
    const obraId = registro.obra_id;

    if (!stats[labName]) {
      stats[labName] = {
        nome: labName,
        total: 0,
        aprovados: 0,
        reprovados: 0,
        registrosPorObra: {}
      };
    }

    stats[labName].total++;

    if (obraId) {
      if (!stats[labName].registrosPorObra[obraId]) {
        stats[labName].registrosPorObra[obraId] = 0;
      }
      stats[labName].registrosPorObra[obraId]++;
    }

    if (registro.approved === true) {
      stats[labName].aprovados++;
    } else if (registro.approved === false) {
      stats[labName].reprovados++;
    }
  });

  Object.values(stats).forEach(stat => {
    const totalAvaliados = stat.aprovados + stat.reprovados;
    stat.percentualReprovacao = totalAvaliados > 0
      ? ((stat.reprovados / totalAvaliados) * 100).toFixed(1)
      : '0.0';
  });

  return Object.values(stats).sort((a, b) => b.total - a.total);
}