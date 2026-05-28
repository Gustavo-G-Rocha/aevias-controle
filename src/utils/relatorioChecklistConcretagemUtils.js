/**
 * Funções puras para RelatorioChecklistConcretagem.
 * Utilitários para validação, formatação e transformação de dados.
 */

/** Valida se o checklist está disponível. */
export const isChecklistValid = (checklist) => !!checklist;

/** Verifica se o checklist tem criador definido. */
export const hasCreator = (creatorUser) => !!creatorUser;

/** Retorna a mensagem de erro apropriada baseada no estado. */
export const getErrorMessage = (error, checklist) => {
  if (error) return error;
  if (!checklist) return 'Checklist não encontrado';
  return 'Erro ao carregar relatório';
};

/** Formata data ISO para pt-BR usando fuso UTC. */
export const formatDateConcr = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

/** Retorna emoji para condição climática. */
export const getClimaEmoji = (condicao) => {
  switch (condicao) {
    case 'bom': return '☀️';
    case 'instavel': return '⛅';
    case 'chuva': return '🌧️';
    default: return '';
  }
};

/** Retorna texto legível para condição climática. */
export const getClimaTexto = (condicao) => {
  switch (condicao) {
    case 'bom': return 'Bom';
    case 'instavel': return 'Instável';
    case 'chuva': return 'Chuva';
    default: return '-';
  }
};

/** Retorna nome do período em maiúsculas. */
export const getPeriodoNome = (periodo) => {
  switch (periodo) {
    case 'manha': return 'MANHÃ';
    case 'tarde': return 'TARDE';
    case 'noite': return 'NOITE';
    default: return periodo ? periodo.toUpperCase() : '';
  }
};

/** Retorna texto legível para tipo de ruptura. */
export const getTipoRupturaTexto = (tipo) => {
  switch (tipo) {
    case 'compressao_axial': return 'Compressão Axial';
    case 'comp_diametral': return 'Compressão Diametral';
    case 'tracao_flexao': return 'Tração na Flexão';
    default: return 'N/A';
  }
};

/** Divide array em chunks de tamanho `size`. */
export const chunkArray = (arr, size) => {
  const chunks = [];
  if (!arr) return chunks;
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/** Monta props do SignatureFooter a partir dos dados do checklist e criador. */
export const buildFooterProps = (checklist, creatorUser) => ({
  labName: checklist.laboratorista_name,
  labEmail: checklist.created_by,
  labCreatedDate: checklist.created_date,
  labPosition: creatorUser?.position || 'Laboratorista',
  approverName: checklist.approver_details?.name,
  approverEmail: checklist.approved_by,
  approverPosition: checklist.approver_details?.position,
  approverCREA: checklist.approver_details?.crea_number,
  approverDate: checklist.approved_date,
  clientName: checklist.client_signature?.engineer_name,
  clientEmail: checklist.client_signature?.signed_by,
  clientPosition: checklist.client_signature?.position,
  clientCREA: checklist.client_signature?.crea_number,
  clientDate: checklist.client_signature?.signed_date,
});