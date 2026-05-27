/**
 * Extrai ID do diário da URL
 */
export const extractDiarioIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

/**
 * Monta dados consolidados do relatório
 */
export const buildRelatorioDiarioData = (diario, obra, project, user, regional, creatorUser) => ({
  diario,
  obra,
  project,
  user,
  regional,
  creatorUser,
});

/**
 * Valida se os dados mínimos estão disponíveis
 */
export const isValidRelatorioDiarioData = (diario) => {
  return !!(diario && diario.id);
};