// Status info mapping
export const STATUS_INFO = {
  aprovada: {
    text: "Aprovada",
    icon: "CheckCircle",
    className: "bg-[#566E3D]/10 text-[#566E3D] border border-[#566E3D]/30"
  },
  rejeitada: {
    text: "Rejeitada",
    icon: "XCircle",
    className: "bg-[#800020]/10 text-[#800020] border border-[#800020]/30"
  },
  pendente: {
    text: "Pendente",
    icon: "Clock",
    className: "bg-[#FBBF24]/10 text-[#854d0e] border border-[#FBBF24]/30"
  }
};

// Cores de button para approve/reject
export const ACTION_COLORS = {
  approve: '#566E3D',
  reject: '#800020'
};

/**
 * Obtém informações de status da solicitação
 */
export function getStatusInfo(status) {
  return STATUS_INFO[status] || STATUS_INFO.pendente;
}

/**
 * Calcula o nível de acesso do usuário
 */
export function getUserAccessLevel(user) {
  if (!user) return 'user';
  return user.access_level || (user.role === 'admin' ? 'admin' : 'user');
}

/**
 * Encontra a regional atual do usuário
 */
export function getRegionalAtual(user, regionais) {
  if (!user || !regionais) return null;
  
  return regionais.find(regional => {
    const laboratoristas = regional.laboratoristas_responsaveis || [];
    return laboratoristas.some(email => email.toLowerCase() === user.email.toLowerCase());
  });
}

/**
 * Filtra solicitações conforme acesso do usuário
 */
export function filterSolicitacoesByUserAccess(solicitacoes, user, regionais) {
  if (!user) return [];

  const accessLevel = getUserAccessLevel(user);

  // Admin vê todas as solicitações
  if (accessLevel === 'admin') {
    return solicitacoes;
  }

  // Gestor de Contrato vê apenas solicitações para suas regionais
  if (accessLevel === 'gestor_contrato') {
    const regionaisDoGestor = regionais.filter(regional => {
      const isGestorUnico = regional.gestor_contrato_responsavel?.toLowerCase() === user.email.toLowerCase();
      const isGestorArray = (regional.gestores_contrato_responsaveis || []).some(
        email => email.toLowerCase() === user.email.toLowerCase()
      );
      return isGestorUnico || isGestorArray;
    });

    const regionaisIds = regionaisDoGestor.map(r => r.id);

    return solicitacoes.filter(s => regionaisIds.includes(s.regional_destino_id));
  }

  // Sala Técnica vê apenas solicitações para suas regionais
  if (accessLevel === 'sala_tecnica_afirmaevias') {
    const regionaisDaSalaTecnica = regionais.filter(regional => {
      const salas = regional.salas_tecnicas_responsaveis || [];
      return salas.some(email => email.toLowerCase() === user.email.toLowerCase());
    });

    const regionaisIds = regionaisDaSalaTecnica.map(r => r.id);

    return solicitacoes.filter(s => regionaisIds.includes(s.regional_destino_id));
  }

  // Laboratorista vê apenas suas próprias solicitações
  if (accessLevel === 'user') {
    return solicitacoes.filter(s => 
      s.laboratorista_email.toLowerCase() === user.email.toLowerCase()
    );
  }

  // Cliente não vê nada (segurança adicional)
  return [];
}

/**
 * Filtra regionais disponíveis para transferência
 */
export function getRegionaisDisponiveis(regionais, regionalAtual) {
  if (!regionalAtual) return regionais.filter(r => r.status === 'ativa');
  
  return regionais.filter(r => 
    r.id !== regionalAtual.id && r.status === 'ativa'
  );
}

/**
 * Valida dados do formulário de nova solicitação
 */
export function validateNovasolicitacao(formData) {
  if (!formData.regional_destino_id || !formData.motivo.trim()) {
    return { valid: false, message: 'Por favor, preencha todos os campos obrigatórios.' };
  }
  return { valid: true };
}

/**
 * Valida motivo de rejeição
 */
export function validateMotivoRejeicao(motivo) {
  if (!motivo || !motivo.trim()) {
    return { valid: false, message: 'Por favor, informe o motivo da rejeição.' };
  }
  return { valid: true };
}