// dashboardService.js — Carregamento e normalização de dados do Dashboard
// ETAPA 6+7: usa recordsService como fonte única; limite 200/entidade no dashboard
// (era 5000 — redução de 96% no volume de dados carregados)

import { base44 } from '@/api/base44Client';
import { getEffectiveAccessLevel, filterRegionaisByUser, isCliente } from '@/utils/accessControl';
import { loadAllRecords, loadAuxData } from '@/services/recordsService';

export async function loadDashboardData(user) {
  const userAccessLevel = getEffectiveAccessLevel(user);
  const isClienteUser = isCliente(user);
  const needsRegionais = ['cliente', 'sala_tecnica_afirmaevias', 'gestor_contrato'].includes(userAccessLevel);

  // Carregar registros (limite 200/entidade no dashboard) + dados auxiliares em paralelo
  const [allRecords, { obras: obrasRaw, projects: projectsRaw, regionais }] = await Promise.all([
    loadAllRecords('dashboard'),
    loadAuxData({ needsRegionais }),
  ]);

  let ensaios = allRecords;
  let obras = obrasRaw;
  let projects = projectsRaw;

  // Aplicar filtros por nível de acesso
  if (userAccessLevel === 'user') {
    ensaios = ensaios.filter(e => e.created_by === user.email);
  } else if (needsRegionais) {
    const regionaisDoUsuario = filterRegionaisByUser(regionais, user);
    const regionaisIds = new Set(regionaisDoUsuario.map(r => r.id));

    obras = obrasRaw.filter(o => regionaisIds.has(o.regional_id));

    const projectIdsPermitidos = new Set(
      regionaisDoUsuario.flatMap(r => r.project_ids || [])
    );
    projects = projectsRaw.filter(p => projectIdsPermitidos.has(p.id));

    const obrasIds = new Set(obras.map(o => o.id));
    ensaios = isClienteUser
      ? ensaios.filter(e => obrasIds.has(e.obra_id) && (e.approved === true || e.client_signature?.signed_by))
      : ensaios.filter(e => obrasIds.has(e.obra_id));
  }

  return { obras, projects, ensaios, regionais };
}