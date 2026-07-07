import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useQueryData";
import { getAccessibleObraIds } from "@/utils/accessControl";
import {
  listarRegistros,
  loadRecordsGrouped,
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
    queryFn: async () => {
      const userData = user;

      const tiposValues = TIPOS_CHECKLIST.map(t => t.value);
      const outrosValues = OUTROS_TIPOS_REGISTRO.map(t => t.value);

      // Dispara TODOS os fetchs em paralelo — nenhum depende de outro.
      const [obrasData, regionaisData, rncsData, checklistGroups, diarioData, outrosGroups] = await Promise.all([
        listarRegistros('Obra', '-created_date', 2000),
        listarRegionais(),
        listarRegistros('RelatorioNC', '-created_date', 1000),
        loadRecordsGrouped(tiposValues, 1000),
        listarRegistros('DiarioObra', '-created_date', 1000),
        loadRecordsGrouped(outrosValues, 1000),
      ]);

      // Calcula availableObras e availableIds para filtrar os resultados
      const availableIds = getAccessibleObraIds(obrasData, regionaisData, userData);
      const availableObras = obrasData.filter(o => availableIds.has(o.id));
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
    },
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