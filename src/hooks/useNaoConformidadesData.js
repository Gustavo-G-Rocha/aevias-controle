import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useQueryData";
import { getAccessibleObraIds, getEffectiveAccessLevel } from "@/utils/accessControl";
import {
  listarRegistros,
  filtrarRegistros,
} from "@/services/recordsService";
import { listarRegionais } from "@/services/regionaisService";
import { logger } from '@/utils/logger';
import {
  TIPOS_CHECKLIST,
  OUTROS_TIPOS_REGISTRO,
  extrairNaoConformidadesChecklist,
  mapNcExplicitaToCnc,
  mapOutroRegistroToCnc,
  isOutroRegistroNaoConforme,
} from "@/utils/naoConformidadesUtils";

const NC_DATA_KEY = ['naoConformidades'];

/**
 * Orquestra o carregamento e extração de NCs para a página de Não Conformidades.
 * Função extraída do queryFn para permitir testes de orquestração sem renderHook.
 *
 * @param {object} user — usuário atual (com email, access_level/role)
 * @returns {Promise<{ obras: Array, rncs: Array, checklistNCs: Array }>}
 */
export async function loadNaoConformidadesData(user) {
  const level = getEffectiveAccessLevel(user);
  const isFullAccess = level === 'admin' || level === 'user';

  // Phase 1: fetch obras + regionais to compute accessible obra IDs
  const [obrasData, regionaisData] = await Promise.all([
    listarRegistros('Obra', '-created_date', 2000),
    listarRegionais(),
  ]);

  const availableIds = getAccessibleObraIds(obrasData, regionaisData, user);
  const availableObras = obrasData.filter(o => availableIds.has(o.id));

  // Restricted user with no accessible obras — skip record fetching
  if (!isFullAccess && availableIds.size === 0) {
    return { obras: [], rncs: [], checklistNCs: [] };
  }

  // Server-side obra_id filter for restricted users (cliente/sala_tecnica/gestor_contrato)
  const obraFilter = isFullAccess ? {} : { obra_id: { $in: [...availableIds] } };

  // Phase 2: fetch NC records with server-side filtering
  const tiposValues = TIPOS_CHECKLIST.map(t => t.value);
  const outrosValues = OUTROS_TIPOS_REGISTRO.map(t => t.value);

  const [rncsData, checklistGroups, diarioData, outrosGroups] = await Promise.all([
    filtrarRegistros('RelatorioNC', obraFilter, '-created_date', 1000),
    Promise.all(tiposValues.map(t => filtrarRegistros(t, obraFilter, '-created_date', 1000))),
    filtrarRegistros('DiarioObra', obraFilter, '-created_date', 1000),
    Promise.all(outrosValues.map(t => {
      const isCondicaoNC = t === 'EnsaioManchaPendulo' || t === 'EnsaioVigaBenkelman';
      const ncFilter = isCondicaoNC
        ? { ...obraFilter, condicao_conformidade: 'NÃO CONFORME' }
        : { ...obraFilter, approved: false };
      return filtrarRegistros(t, ncFilter, '-created_date', 1000);
    })),
  ]);

  const filteredRncs = rncsData.filter(r => availableIds.has(r.obra_id));

  const allCNCs = [];

  const checklistResults = TIPOS_CHECKLIST.map((t, i) =>
    checklistGroups[i].filter(c => availableIds.has(c.obra_id)).map(c => ({ ...c, _tipo: t.value, _page: t.page }))
  );
  const diarioFiltrado = diarioData.filter(c => availableIds.has(c.obra_id));

  checklistResults.flat().forEach(cl => {
    extrairNaoConformidadesChecklist(cl, cl._tipo).forEach(param => {
      allCNCs.push({
        id: cl.id, obra_id: cl.obra_id,
        parametro: param.charAt(0).toUpperCase() + param.slice(1),
        tipo: cl._tipo, laboratorista_name: cl.laboratorista_name || '',
        data: cl.data || '', empreiteira: cl.empreiteira || '',
        rodovia: cl.rodovia || '', usina: cl.usina || cl.usina_selecionada || '',
        _page: cl._page,
      });
    });

    if (Array.isArray(cl.nao_conformidades) && cl.nao_conformidades.length > 0) {
      const tipoInfo = TIPOS_CHECKLIST.find(t => t.value === cl._tipo);
      cl.nao_conformidades.forEach(nc => {
        const mapped = mapNcExplicitaToCnc(cl, nc, tipoInfo || { value: cl._tipo, page: cl._page });
        const jaExiste = allCNCs.some(e => e.id === cl.id && e.parametro === mapped.parametro);
        if (!jaExiste) allCNCs.push(mapped);
      });
    }
  });

  const diarioTipo = { value: 'DiarioObra', page: 'RelatorioDiario' };
  diarioFiltrado.forEach(c => {
    if (Array.isArray(c.nao_conformidades) && c.nao_conformidades.length > 0) {
      c.nao_conformidades.forEach(nc => {
        allCNCs.push(mapNcExplicitaToCnc(c, nc, diarioTipo));
      });
    }
  });

  const outrosResults = OUTROS_TIPOS_REGISTRO.map((t, i) =>
    outrosGroups[i]
      .filter(c => availableIds.has(c.obra_id) && isOutroRegistroNaoConforme(c, t.value))
      .map(c => mapOutroRegistroToCnc(c, t))
  );

  outrosResults.flat().forEach(reg => allCNCs.push(reg));

  return { obras: availableObras, rncs: filteredRncs, checklistNCs: allCNCs };
}

/**
 * Carrega e normaliza todos os dados necessários para a página de NCs:
 * obras acessíveis, RNCs e CNCs (NCs de checklist/diário/outros registros).
 * Usa React Query para cache compartilhado e refetch automático.
 */
export function useNaoConformidadesData() {
  const userQuery = useCurrentUser();
  const user = userQuery.data;

  const query = useQuery({
    queryKey: [NC_DATA_KEY, user?.email],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: () => loadNaoConformidadesData(user),
  });

  // Erros são logados via o callback do query — mantém comportamento do hook original
  useEffect(() => {
    if (query.isError) {
      logger.error("[NaoConformidades] Erro ao carregar dados:", query.error?.message || query.error);
    }
  }, [query.isError, query.error]);

  return {
    loading: userQuery.isLoading || query.isLoading,
    obras: query.data?.obras ?? [],
    rncs: query.data?.rncs ?? [],
    checklistNCs: query.data?.checklistNCs ?? [],
  };
}