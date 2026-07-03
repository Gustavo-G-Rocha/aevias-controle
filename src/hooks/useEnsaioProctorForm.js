/**
 * Hook de mutações do formulário de EnsaioProctor.
 * Gerencia handlers de obra, umidade, densidade e energia.
 */
import { useCallback } from "react";
import { obterRegionalById } from "@/services/regionaisService";
import { obterProjectById } from "@/services/projectsService";
import { recalcDensidades, calcularTeorUmidade, GOLPES_POR_ENERGIA } from "@/utils/ensaioProctorUtils";

export function useEnsaioProctorForm(setForm, setProjetos) {

  const handleObraChange = useCallback(async (id, obras) => {
    const obra = obras.find(o => o.id === id);
    let clienteAuto = "";
    if (obra?.regional_id) {
      try {
        const regional = await obterRegionalById(obra.regional_id);
        clienteAuto = regional?.cliente || "";
      } catch {}
    }
    setForm(prev => ({ ...prev, obra_id: id, project_id: "", cliente: clienteAuto }));
    if (id && obra?.project_ids?.length > 0) {
      const projs = await Promise.all(obra.project_ids.map(pid => obterProjectById(pid)));
      setProjetos(projs);
    }
  }, [setForm, setProjetos]);

  const handleEnergiaChange = useCallback((v) => {
    const golpes = GOLPES_POR_ENERGIA[v] ?? 12;
    setForm(prev => ({ ...prev, energia_compactacao: v, num_golpes: golpes }));
  }, [setForm]);

  const updateUmidade = useCallback((index, field, value) => {
    setForm(prev => {
      const updated = prev.umidades.map((u, i) => i === index ? { ...u, [field]: value } : u);
      const { teor1, teor2, media } = calcularTeorUmidade({ ...updated[index] });
      updated[index] = { ...updated[index], teor_umidade_1: teor1, teor_umidade_2: teor2, teor_umidade_media: media };

      const valid = updated.filter(p => p.teor_umidade_media > 0);
      const umidade_media = valid.length > 0
        ? parseFloat((valid.reduce((s, p) => s + p.teor_umidade_media, 0) / valid.length).toFixed(2))
        : 0;

      const densidadesRecalc = recalcDensidades(
        prev.densidades, prev.umidade_higroscopica, prev.correcao_densidade, updated, umidade_media
      );

      return { ...prev, umidades: updated, umidade_media, densidades: densidadesRecalc };
    });
  }, [setForm]);

  const updateDensidade = useCallback((index, field, value) => {
    setForm(prev => {
      const updated = prev.densidades.map((d, i) => i === index ? { ...d, [field]: value } : d);
      return {
        ...prev,
        densidades: recalcDensidades(updated, prev.umidade_higroscopica, prev.correcao_densidade, prev.umidades, prev.umidade_media),
      };
    });
  }, [setForm]);

  const updatePesoAmUmidaAll = useCallback((value) => {
    setForm(prev => {
      const updated = prev.densidades.map(d => ({ ...d, peso_amostra_umida: value }));
      return {
        ...prev,
        densidades: recalcDensidades(updated, prev.umidade_higroscopica, prev.correcao_densidade, prev.umidades, prev.umidade_media),
      };
    });
  }, [setForm]);

  return { handleObraChange, handleEnergiaChange, updateUmidade, updateDensidade, updatePesoAmUmidaAll };
}