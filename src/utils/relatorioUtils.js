/**
 * Utilitários centralizados para componentes de relatório.
 * Elimina duplicação de formatDate / formatDateBrasilia / buildSignatureProps
 * em todos os relatórios.
 */

/**
 * Formata uma data ISO em dd/mm/yyyy (UTC, sem desvio de fuso).
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/**
 * Formata uma data ISO em dd/mm/yyyy HH:mm:ss no fuso de Brasília.
 * Normaliza strings sem informação de fuso adicionando 'Z'.
 */
export function formatDateBrasilia(dateString) {
  if (!dateString) return 'N/A';
  let normalized = dateString;
  if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
    normalized = dateString + 'Z';
  }
  return new Date(normalized).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'medium',
  });
}

/**
 * Constrói o objeto de props para SignatureFooter a partir de um registro
 * (ensaio, checklist, etc.) com os campos padrão de aprovação.
 */
export function buildSignatureProps(record, labPosition = 'Laboratorista') {
  return {
    labName: record?.laboratorista_name,
    labEmail: record?.created_by,
    labCreatedDate: record?.created_date,
    labPosition,
    approverName: record?.approver_details?.name,
    approverEmail: record?.approved_by,
    approverPosition: record?.approver_details?.position,
    approverCREA: record?.approver_details?.crea_number,
    approverDate: record?.approved_date,
    clientName: record?.client_signature?.engineer_name,
    clientEmail: record?.client_signature?.signed_by,
    clientPosition: record?.client_signature?.position,
    clientCREA: record?.client_signature?.crea_number,
    clientDate: record?.client_signature?.signed_date,
  };
}