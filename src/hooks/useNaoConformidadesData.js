import { useState, useEffect, useCallback } from "react";
import { obterUsuarioAtual } from "@/services/usuariosService";
import { listarRegionais } from "@/services/regionaisService";
import { logger } from '@/utils/logger';
import {
  listarRegistros,
  loadRecordsGrouped,
} from "@/services/recordsService";
import {
  TIPOS_CHECKLIST,
  OUTROS_TIPOS_REGISTRO,
  extrairNaoConformidadesChecklist,
  mapNcExplicitaToCnc,
  mapOutroRegistroToCnc,
  isOutroRegistroNaoConforme,
} from "@/utils/naoConformidadesUtils";

/**
 * Carrega e normaliza todos os dados necessários para a página de NCs:
 * obras acessíveis, RNCs e CNCs (NCs de checklist/diário/outros registros).
 */
export function useNaoConformidadesData() {
  const [loading, setLoading] = useState(true);
  const [obras, setObras] = useState([]);
  const [rncs, setRncs] = useState([]);
  const [checklistNCs, setChecklistNCs] = useState([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await obterUsuarioAtual();
      const userAccessLevel = userData?.access_level || (userData?.role === 'admin' ? 'admin' : 'user');

      const [obrasData, regionaisData, rncsData] = await Promise.all([
        listarRegistros('Obra', '-created_date', 2000),
        listarRegionais(),
        listarRegistros('RelatorioNC', '-created_date', 1000),
      ]);

      let availableObras = obrasData;
      if (userAccessLevel === 'cliente') {
        const regs = regionaisData.filter(r => (r.clientes_responsaveis || []).some(e => e.toLowerCase() === userData.email.toLowerCase()));
        const ids = new Set(regs.flatMap(r => obrasData.filter(o => o.regional_id === r.id).map(o => o.id)));
        availableObras = obrasData.filter(o => ids.has(o.id));
      } else if (userAccessLevel === 'sala_tecnica_afirmaevias') {
        const regs = regionaisData.filter(r => (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === userData.email.toLowerCase()));
        const ids = new Set(regs.flatMap(r => obrasData.filter(o => o.regional_id === r.id).map(o => o.id)));
        availableObras = obrasData.filter(o => ids.has(o.id));
      } else if (userAccessLevel === 'gestor_contrato') {
        const regs = regionaisData.filter(r =>
          r.gestor_contrato_responsavel?.toLowerCase() === userData.email.toLowerCase() ||
          (r.gestores_contrato_responsaveis || []).some(e => e.toLowerCase() === userData.email.toLowerCase())
        );
        const ids = new Set(regs.flatMap(r => obrasData.filter(o => o.regional_id === r.id).map(o => o.id)));
        availableObras = obrasData.filter(o => ids.has(o.id));
      }

      setObras(availableObras);
      const availableIds = new Set(availableObras.map(o => o.id));
      setRncs(rncsData.filter(r => availableIds.has(r.obra_id)));

      const allCNCs = [];

      const tiposValues = TIPOS_CHECKLIST.map(t => t.value);
      const [checklistGroups, diarioData] = await Promise.all([
        loadRecordsGrouped(tiposValues, 1000),
        listarRegistros('DiarioObra', '-created_date', 1000),
      ]);

      const checklistResults = TIPOS_CHECKLIST.map((t, i) =>
        checklistGroups[i].filter(c => availableIds.has(c.obra_id)).map(c => ({ ...c, _tipo: t.value, _page: t.page }))
      );
      const diarioFiltrado = diarioData.filter(c => availableIds.has(c.obra_id));

      checklistResults.flat().forEach(cl => {
        // NCs automáticas extraídas por lógica de conformidade
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

        // NCs explícitas registradas no checklist
        if (Array.isArray(cl.nao_conformidades) && cl.nao_conformidades.length > 0) {
          const tipoInfo = TIPOS_CHECKLIST.find(t => t.value === cl._tipo);
          cl.nao_conformidades.forEach(nc => {
            const mapped = mapNcExplicitaToCnc(cl, nc, tipoInfo || { value: cl._tipo, page: cl._page });
            const jaExiste = allCNCs.some(e => e.id === cl.id && e.parametro === mapped.parametro);
            if (!jaExiste) allCNCs.push(mapped);
          });
        }
      });

      // NCs explícitas do Diário de Obra
      const diarioTipo = { value: 'DiarioObra', page: 'RelatorioDiario' };
      diarioFiltrado.forEach(c => {
        if (Array.isArray(c.nao_conformidades) && c.nao_conformidades.length > 0) {
          c.nao_conformidades.forEach(nc => {
            allCNCs.push(mapNcExplicitaToCnc(c, nc, diarioTipo));
          });
        }
      });

      // Outros registros não conformes (approved === false ou condicao_conformidade)
      const outrosValues = OUTROS_TIPOS_REGISTRO.map(t => t.value);
      const outrosGroups = await loadRecordsGrouped(outrosValues, 1000);
      const outrosResults = OUTROS_TIPOS_REGISTRO.map((t, i) =>
        outrosGroups[i]
          .filter(c => availableIds.has(c.obra_id) && isOutroRegistroNaoConforme(c, t.value))
          .map(c => mapOutroRegistroToCnc(c, t))
      );

      outrosResults.flat().forEach(reg => allCNCs.push(reg));
      setChecklistNCs(allCNCs);
    } catch (error) {
      logger.error("[NaoConformidades] Erro ao carregar dados:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return { loading, obras, rncs, checklistNCs };
}