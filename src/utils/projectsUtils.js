import { Regional } from "@/entities/Regional";

/**
 * Get user's regional access based on role
 */
const getUserRegionalsAccess = (regional, user, userAccessLevel) => {
  const emailUsuario = user.email.trim().toLowerCase();

  if (userAccessLevel === "cliente") {
    const clientes = regional.clientes_responsaveis || [];
    return clientes.some((email) => email.trim().toLowerCase() === emailUsuario);
  } else if (userAccessLevel === "sala_tecnica_afirmaevias") {
    const salas = regional.salas_tecnicas_responsaveis || [];
    return salas.some((email) => email.trim().toLowerCase() === emailUsuario);
  } else if (userAccessLevel === "gestor_contrato") {
    const gestores = regional.gestores_contrato_responsaveis || [];
    return (
      regional.gestor_contrato_responsavel?.trim().toLowerCase() ===
        emailUsuario ||
      gestores.some((email) => email.trim().toLowerCase() === emailUsuario)
    );
  } else {
    // laboratorista (user)
    const laboratoristas = regional.laboratoristas_responsaveis || [];
    return laboratoristas.some(
      (email) => email.trim().toLowerCase() === emailUsuario
    );
  }
};

/**
 * Filter projects by user access level
 */
export const filterProjectsByUserAccess = (
  projects,
  regionais,
  user,
  userAccessLevel
) => {
  if (userAccessLevel === "admin") {
    return projects;
  }

  const regionaisDoUsuario = regionais.filter((regional) =>
    getUserRegionalsAccess(regional, user, userAccessLevel)
  );

  const projectIdsPermitidos = new Set();
  regionaisDoUsuario.forEach((regional) => {
    if (regional.project_ids) {
      regional.project_ids.forEach((id) => {
        projectIdsPermitidos.add(id);
      });
    }
  });

  const regionalIdsPermitidos = new Set(regionaisDoUsuario.map((r) => r.id));
  return projects.filter(
    (p) =>
      projectIdsPermitidos.has(p.id) ||
      (p.regional_id && regionalIdsPermitidos.has(p.regional_id))
  );
};

/**
 * Update project regional association
 */
export const updateProjectRegional = async (
  projectId,
  oldRegionalId,
  newRegionalId,
  regionais
) => {
  // Remove from old regional
  if (oldRegionalId) {
    const regionalAntiga = regionais.find((r) => r.id === oldRegionalId);
    if (regionalAntiga?.project_ids) {
      const novosProjectIds = regionalAntiga.project_ids.filter(
        (id) => id !== projectId
      );
      await Regional.update(regionalAntiga.id, {
        project_ids: novosProjectIds,
      });
    }
  }

  // Add to new regional
  if (newRegionalId) {
    const regionalNova = regionais.find((r) => r.id === newRegionalId);
    if (regionalNova) {
      const projectIds = regionalNova.project_ids || [];
      if (!projectIds.includes(projectId)) {
        await Regional.update(regionalNova.id, {
          project_ids: [...projectIds, projectId],
        });
      }
    }
  }
};

/**
 * Add project to regional
 */
export const addProjectToRegional = async (
  projectId,
  regionalId,
  regionais
) => {
  const regional = regionais.find((r) => r.id === regionalId);
  if (regional) {
    const projectIds = regional.project_ids || [];
    if (!projectIds.includes(projectId)) {
      await Regional.update(regional.id, {
        project_ids: [...projectIds, projectId],
      });
    }
  }
};

/**
 * Get regional name by ID
 */
export const getRegionalNome = (regionalId, regionais) => {
  if (!regionalId) return null;
  const regional = regionais.find((r) => r.id === regionalId);
  return regional?.nome || null;
};

/**
 * Get user access level
 */
export const getUserAccessLevel = (user) => {
  if (!user) return "user";
  return user.access_level || (user.role === "admin" ? "admin" : "user");
};

/**
 * Check if user can manage projects
 */
export const canManageProjects = (userAccessLevel) => {
  return (
    userAccessLevel === "admin" ||
    userAccessLevel === "sala_tecnica_afirmaevias" ||
    userAccessLevel === "gestor_contrato"
  );
};

/**
 * Status color mapping
 */
export const STATUS_COLORS = {
  ativo: "bg-[#566E3D]/30 text-[#00233B]",
  inativo: "bg-red-400/20 text-red-800",
  pausado: "bg-yellow-400/20 text-yellow-800",
};

/**
 * Project type color mapping
 */
export const TIPO_PROJETO_COLORS = {
  CAUQ: "bg-[#00233B] text-white",
  MRAF: "bg-[#566E3D] text-white",
  BGS: "bg-purple-500 text-white",
  CARTA_TRACO_CONCRETO: "bg-orange-500 text-white",
  CAMADAS_GRANULARES: "bg-amber-500 text-white",
};

/**
 * Project type label mapping
 */
export const TIPO_PROJETO_LABELS = {
  CAUQ: "CAUQ",
  MRAF: "MRAF",
  BGS: "BGS",
  CARTA_TRACO_CONCRETO: "CARTA TRAÇO",
  CAMADAS_GRANULARES: "CAMADAS GRANULARES",
};