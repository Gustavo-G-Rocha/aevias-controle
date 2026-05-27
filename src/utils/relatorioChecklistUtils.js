/**
 * Extrai ID do checklist da URL
 */
export const extractChecklistIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

/**
 * Monta dados consolidados do relatório
 */
export const buildRelatorioChecklistData = (checklist, obra, regional, project, user, creatorUser) => ({
  checklist,
  obra,
  regional,
  project,
  user,
  creatorUser,
});

/**
 * Valida se os dados mínimos estão disponíveis
 */
export const isValidRelatorioChecklistData = (checklist) => {
  return !!(checklist && checklist.id);
};

/**
 * Determina a entidade name para AprovacaoBar
 */
export const getChecklistEntityName = () => {
  return 'ChecklistUsina';
};