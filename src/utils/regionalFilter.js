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
  
  if (userAccessLevel === 'cliente') {
    const emailUsuario = user.email.toLowerCase();
    return regionais.filter(r => {
      if (r.status !== 'ativa') return false;
      const clientes = r.clientes_responsaveis || [];
      return clientes.some(email => email.toLowerCase() === emailUsuario);
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