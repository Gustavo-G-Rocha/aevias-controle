/**
 * Contrato comum para mappers de checklist.
 *
 * Cada mapper de checklist (MRAF, Reciclagem, Terraplanagem, etc.) deve expor
 * exatamente os métodos abaixo, com as mesmas assinaturas e formatos de
 * retorno, permitindo que os hooks de formulário chamem qualquer mapper de
 * forma uniforme. O resultado final de cada mapper (mensagens de validação e
 * payload gerado) permanece específico de cada checklist.
 *
 * @typedef {Object} ChecklistMapper
 * @property {(formData: object, saveStatus: string) => (string | null)} validateForm
 *   Valida o estado do formulário. Retorna uma mensagem de erro (string)
 *   quando inválido, ou null quando válido.
 * @property {(formData: object, saveStatus: string, user?: object) => object} buildDataToSave
 *   Constrói o payload a ser persistido a partir do estado do formulário.
 *   `user` é opcional e utilizado apenas pelos mappers que precisam dele.
 */

export const CHECKLIST_MAPPER_METHODS = ['validateForm', 'buildDataToSave'];

export const CHECKLIST_MAPPER_ARITY = {
  validateForm: 2,
  buildDataToSave: 3,
};