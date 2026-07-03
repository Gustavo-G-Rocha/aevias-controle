/**
 * Núcleo compartilhado de defaults de formulário.
 *
 * Centraliza os valores universais reutilizados pelos inicializadores
 * `getInitialFormData` espalhados pelo app (ensaios e checklists), evitando
 * inconsistência de defaults e garantindo um único formato de data de criação.
 *
 * Cada formulário mantém seu próprio `getInitialFormData` com os campos
 * específicos da entidade; apenas os defaults genuinamente comuns vivem aqui.
 */

/** Data de hoje no formato ISO curto (YYYY-MM-DD). */
export const todayISO = () => new Date().toISOString().split('T')[0];