/**
 * Formata data no padrão pt-BR com UTC
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/**
 * Formata data e hora no padrão pt-BR Brasília
 */
export function formatDateBrasilia(dateString) {
  if (!dateString) return 'N/A';
  let normalizedDate = dateString;
  if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
    normalizedDate = dateString + 'Z';
  }
  return new Date(normalizedDate).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'medium'
  });
}

/**
 * Formata número com casas decimais
 */
export function fmtN(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  return Number(value).toFixed(decimals);
}