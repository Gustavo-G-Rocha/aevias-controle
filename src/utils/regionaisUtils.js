/**
 * Funções puras utilitárias para a página de Regionais.
 * Sem side effects, sem chamadas de API, sem imports de entidades.
 */

/**
 * Calcula o nível de acesso efetivo do usuário.
 */
export function getUserAccessLevel(user) {
  if (!user) return 'user';
  const raw = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
  // Normaliza níveis derivados para o nível base
  if (raw === 'cliente_supervisor') return 'cliente';
  if (raw === 'funcionarios_cliente') return 'user';
  return raw;
}

/**
 * Dado um nível de acesso, retorna as flags de permissão.
 */
export function calcularPermissoes(accessLevel) {
  const isAdmin = accessLevel === 'admin';
  const isSalaTecnica = accessLevel === 'sala_tecnica_afirmaevias';
  const isGestorContrato = accessLevel === 'gestor_contrato';
  const isLaboratorista = accessLevel === 'user' || accessLevel === 'funcionarios_cliente';
  const canManage = isAdmin || isSalaTecnica || isGestorContrato;
  return { isAdmin, isSalaTecnica, isGestorContrato, isLaboratorista, canManage };
}

/**
 * Filtra a lista completa de regionais de acordo com o nível de acesso do usuário.
 * Retorna apenas as regionais que o usuário tem permissão de ver.
 */
export function filtrarRegionaisPorAcesso(regionaisData, userData, accessLevel) {
  if (!userData || !regionaisData) return [];

  if (accessLevel === 'gestor_contrato') {
    return regionaisData.filter(regional => {
      const gestores = regional.gestores_contrato_responsaveis ||
        [regional.gestor_contrato_responsavel].filter(Boolean);
      return gestores.some(email => email?.toLowerCase() === userData.email.toLowerCase());
    });
  }

  if (accessLevel === 'sala_tecnica_afirmaevias') {
    return regionaisData.filter(regional => {
      const salas = regional.salas_tecnicas_responsaveis || [];
      return salas.some(email => email.toLowerCase() === userData.email.toLowerCase());
    });
  }

  if (accessLevel === 'cliente') {
    return regionaisData.filter(regional => {
      // cliente e cliente_supervisor: checa clientes_responsaveis e supervisores_responsaveis
      const clientes = regional.clientes_responsaveis || [];
      const supervisores = regional.supervisores_responsaveis || [];
      return [...clientes, ...supervisores].some(
        email => email?.toLowerCase() === userData.email.toLowerCase()
      );
    });
  }

  if (accessLevel === 'user' || accessLevel === 'funcionarios_cliente') {
    // funcionarios_cliente (ex.: inspetor do cliente): a regional dele é aquela
    // onde o próprio email OU o do supervisor está em clientes_responsaveis.
    // (accessLevel chega normalizado como 'user', então checamos o nível bruto.)
    if (userData.access_level === 'funcionarios_cliente') {
      const emailLower = userData.email.toLowerCase();
      const supervisorLower = userData.supervisor_email?.toLowerCase();
      return regionaisData.filter(regional =>
        (regional.clientes_responsaveis || []).some(email => {
          const e = email?.toLowerCase();
          return e === emailLower || (supervisorLower && e === supervisorLower);
        })
      );
    }
    return regionaisData.filter(regional => {
      const laboratoristas = regional.laboratoristas_responsaveis || [];
      return laboratoristas.some(email => email.toLowerCase() === userData.email.toLowerCase());
    });
  }

  // admin vê tudo
  return regionaisData;
}

/**
 * Filtra regionais pelo termo de busca (nome ou código).
 */
export function filtrarRegionaisPorBusca(regionais, searchTerm) {
  if (!searchTerm) return regionais;
  const term = searchTerm.toLowerCase();
  return regionais.filter(
    r => r.nome.toLowerCase().includes(term) || r.codigo.toLowerCase().includes(term)
  );
}

/**
 * Filtra obras de uma regional pelo status selecionado.
 */
export function filtrarObrasPorStatus(obras, regionalId, statusFilter) {
  const destaRegional = obras.filter(o => o.regional_id === regionalId);
  if (statusFilter === 'all') return destaRegional;
  return destaRegional.filter(o => o.status === statusFilter);
}

/**
 * Retorna os projetos vinculados a uma regional (via project_ids).
 */
export function getProjetosNaRegional(projects, regional) {
  const ids = regional.project_ids || [];
  return projects.filter(p => ids.includes(p.id));
}

// ── Constantes de apresentação ─────────────────────────────────────────────────

export const STATUS_COLORS_REGIONAL = {
  ativa: "bg-[#566E3D]/10 text-foreground border-[#566E3D]/30",
  inativa: "bg-[#800020]/10 text-[#800020] border-[#800020]/30",
};

export const STATUS_COLORS_OBRA = {
  planejamento: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  em_andamento: "bg-[#566E3D]/10 text-foreground border-[#566E3D]/30",
  concluida: "bg-muted/10 text-foreground border-border/30",
  pausada: "bg-amber-500/10 text-amber-700 border-amber-500/30",
};

export const TIPO_OBRA_LABELS = {
  supervisao: "Supervisão",
  gerenciamento: "Gerenciamento",
  implantacao: "Implantação",
  conservacao: "Conservação",
  homologacao_usinas: "Homologação de Usinas",
  sondagem: "Sondagem",
  levantamentos: "Levantamentos",
};