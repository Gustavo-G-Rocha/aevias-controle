/**
 * Funções puras para RelatorioTaxaMRAF
 * Sem side effects, sem chamadas de API
 */

/**
 * Formata data em pt-BR com timeZone UTC
 */
export function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/**
 * Formata data-hora em pt-BR com timeZone America/Sao_Paulo
 */
export function formatDateBrasilia(d) {
  if (!d) return 'N/A';
  let n = d;
  if (!d.endsWith('Z') && !d.includes('+') && !d.includes('-', 10)) n = d + 'Z';
  return new Date(n).toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo', 
    dateStyle: 'short', 
    timeStyle: 'medium' 
  });
}

/**
 * Determina se uma taxa (taxa_mraf_aplicada) está em não conformidade
 */
export function isTaxaNaoConforme(valor, taxaMinima) {
  return taxaMinima != null && valor != null && valor < taxaMinima;
}

/**
 * Determina se uma taxa está conforme
 */
export function isTaxaConforme(valor, taxaMinima) {
  return taxaMinima != null && valor != null && valor >= taxaMinima;
}

/**
 * Formata número com decimal apropriado baseado no campo
 */
export function formatValueByField(valor, field, isRateField) {
  if (valor == null) return '-';
  if (typeof valor !== 'number') return valor;
  
  if (isRateField) return valor.toFixed(1);
  
  const precision = ['estaca', 'posicao'].includes(field) ? 0 : 3;
  return valor.toFixed(precision).replace(/\.?0+$/, '');
}