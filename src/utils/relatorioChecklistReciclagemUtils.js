/**
 * Utilitários puros para RelatorioChecklistReciclagem.
 * Sem dependências de React ou Base44.
 */

/**
 * Retorna o emoji correspondente à condição climática de reciclagem.
 * @param {string} clima
 * @returns {string}
 */
export function getClimaEmojiRecic(clima) {
  switch (clima) {
    case 'bom':     return '☀️';
    case 'instavel': return '⛅';
    case 'chuva':   return '🌧️';
    default:        return '';
  }
}

/**
 * Retorna o texto legível correspondente à condição climática de reciclagem.
 * @param {string} clima
 * @returns {string}
 */
export function getClimaTextRecic(clima) {
  switch (clima) {
    case 'bom':     return 'Bom';
    case 'instavel': return 'Instável';
    case 'chuva':   return 'Chuva';
    default:        return '';
  }
}

/**
 * Formata uma string de data para o formato brasileiro (pt-BR, UTC).
 * @param {string|null|undefined} dateString
 * @returns {string}
 */
export function formatDateRecic(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/**
 * Lista de ensaios da empreiteira para checklist de reciclagem.
 * Centralizada aqui para evitar duplicação e facilitar testes.
 */
export const ENSAIOS_EMPREITEIRA_RECICLAGEM = [
  { key: 'compactacao_proctor',      label: 'Compactação - Proctor' },
  { key: 'taxa_agregado',            label: 'Taxa de agregado' },
  { key: 'taxa_cimento',             label: 'Taxa de cimento' },
  { key: 'umidade_frigideira',       label: 'Umidade pelo método expedito da "frigideira"' },
  { key: 'massa_especifica_in_situ', label: 'Determinação da massa específica aparente seca "in situ"' },
  { key: 'granulometria',            label: 'Análise granulométrica por peneiramento' },
  { key: 'moldagem_resistencia',     label: 'Moldagem para resistência' },
  { key: 'viga_benkelman',           label: 'Viga Benkelman' },
  { key: 'taxa_pintura_ligacao',     label: 'Taxa de pintura de ligação' },
  { key: 'finura_cimento',           label: 'Determinação da finura do cimento' },
];