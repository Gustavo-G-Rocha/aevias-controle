/**
 * Utilities para filtrar regionais baseado no nível de acesso do usuário
 * Reutilizável em múltiplos contextos (ProjectForm, Projects, Dashboard)
 */

export const filterRegionaisByAccessLevel = (regionais, user) => {
  if (!regionais || !user) return [];
  
  const userAccessLevel = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
  
  if (userAccessLevel === 'admin') {
    return regionais.filter(r => r.status === 'ativa');
  }
  
  if (userAccessLevel === 'gestor_contrato') {
    const emailUsuario = user.email.toLowerCase();
    return regionais.filter(r => {
      if (r.status !== 'ativa') return false;
      const gestores = r.gestores_contrato_responsaveis || [];
      return r.gestor_contrato_responsavel?.toLowerCase() === emailUsuario ||
             gestores.some(email => email.toLowerCase() === emailUsuario);
    });
  }
  
  if (userAccessLevel === 'sala_tecnica_afirmaevias') {
    return regionais.filter(r => {
      if (r.status !== 'ativa') return false;
      const salas = r.salas_tecnicas_responsaveis || [];
      return salas.some(email => email.toLowerCase() === user.email.toLowerCase());
    });
  }
  
  if (userAccessLevel === 'cliente' || userAccessLevel === 'cliente_supervisor') {
    const emailUsuario = user.email.toLowerCase();
    return regionais.filter(r => {
      if (r.status !== 'ativa') return false;
      const clientes = (r.clientes_responsaveis || []).map(e => e.toLowerCase());
      const supervisores = (r.supervisores_responsaveis || []).map(e => e.toLowerCase());
      return clientes.includes(emailUsuario) || supervisores.includes(emailUsuario);
    });
  }

  // funcionarios_cliente: regionais onde o supervisor OU o próprio email
  // está em clientes_responsaveis
  if (userAccessLevel === 'funcionarios_cliente') {
    const emailUsuario = user.email.toLowerCase();
    const supervisorEmail = (user.supervisor_email || '').toLowerCase();
    return regionais.filter(r => {
      if (r.status !== 'ativa') return false;
      const clientes = (r.clientes_responsaveis || []).map(e => e.toLowerCase());
      return clientes.includes(emailUsuario) ||
        (supervisorEmail && clientes.includes(supervisorEmail));
    });
  }

  // laboratorista (user)
  if (userAccessLevel === 'user') {
    return regionais.filter(r => {
      if (r.status !== 'ativa') return false;
      const laboratoristas = r.laboratoristas_responsaveis || [];
      return laboratoristas.some(email => email.toLowerCase() === user.email.toLowerCase());
    });
  }

  return [];
};

/**
 * Filtra OBRAS pelo acesso/regional do usuário — núcleo único de permissão.
 *
 * Regra validada na correção do bug de permissões:
 * - Laboratorista (access_level === 'user'): vê apenas obras cuja regional ele
 *   está vinculado como laboratorista_responsavel OU sala_tecnica_responsavel.
 *   Se não pertence a nenhuma regional, não vê nenhuma obra.
 * - Demais níveis (admin, sala_tecnica_afirmaevias, gestor_contrato, cliente):
 *   veem todas as obras (sem restrição de regional).
 *
 * NÃO aplica filtros de tipo_obra/status — esses são específicos de cada ensaio
 * e devem ser aplicados pelo chamador sobre o resultado.
 *
 * @param {Array} obras
 * @param {Array} regionais
 * @param {object} user
 * @returns {Array} obras filtradas por acesso/regional
 */
export const filtrarObrasPorAcessoRegional = (obras, regionais, user) => {
  if (!obras || !regionais || !user) return [];
  const accessLevel = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
  if (accessLevel !== 'user' && accessLevel !== 'funcionarios_cliente') return obras;
  const emailLower = (user.email || '').toLowerCase();
  const supervisorEmailLower = (user.supervisor_email || '').toLowerCase();

  let regionaisIds;
  if (accessLevel === 'funcionarios_cliente') {
    // funcionarios_cliente: regionais onde o supervisor OU o próprio email
    // está em clientes_responsaveis
    const emailsToCheck = new Set([emailLower]);
    if (supervisorEmailLower) emailsToCheck.add(supervisorEmailLower);
    regionaisIds = regionais
      .filter(r => (r.clientes_responsaveis || []).some(e => emailsToCheck.has(e.toLowerCase())))
      .map(r => r.id);
  } else {
    // user (laboratorista): regionais onde está alocado
    regionaisIds = regionais
      .filter(r =>
        (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
        (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
      )
      .map(r => r.id);
  }

  if (regionaisIds.length === 0) return [];
  const regionaisSet = new Set(regionaisIds);
  return obras.filter(o => regionaisSet.has(o.regional_id));
};