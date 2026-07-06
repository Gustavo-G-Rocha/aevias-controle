/**
 * Funções puras para GerenciarSolicitacoesModal.
 * Sem efeitos colaterais, sem dependências React.
 */

/**
 * Valida se um usuário pode ser transferido como laboratorista.
 * @param {Object|null} usuario - Usuário a validar (null se não encontrado)
 * @returns {{ valido: boolean, mensagem?: string }}
 */
export function validarLaboratoristaTransferivel(usuario) {
  if (!usuario) return { valido: true };
  if (usuario.access_level !== 'user' && usuario.access_level !== 'admin') {
    return {
      valido: false,
      mensagem: `O usuário não é um laboratorista (access_level: ${usuario.access_level}). Não pode ser transferido como laboratorista.`
    };
  }
  return { valido: true };
}