import { useState, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Hook para carregar dados do relatório de sondagem
 */
export function useRelatorioSondagemData() {
  const [ensaio, setEnsaio] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ensaioId = params.get('id');

      if (!ensaioId) {
        setError("ID do ensaio não fornecido");
        setLoading(false);
        return;
      }

      const ensaioData = await base44.entities.EnsaioSondagem.get(ensaioId);
      setEnsaio(ensaioData);

      if (ensaioData.obra_id) {
        const obraData = await base44.entities.Obra.get(ensaioData.obra_id);
        setObra(obraData);

        if (obraData.regional_id) {
          const regionalData = await base44.entities.Regional.get(obraData.regional_id);
          setRegional(regionalData);
        }
      }

      if (ensaioData.project_id) {
        const projectData = await base44.entities.Project.get(ensaioData.project_id);
        let projectToSet = projectData;

        if (projectData.faixa_granulometrica_id) {
          const faixaData = await base44.entities.FaixaGranulometrica.get(projectData.faixa_granulometrica_id);
          projectToSet = { ...projectData, faixa_especificada: faixaData.nome };
        }
        setProject(projectToSet);
      }
    } catch (error) {
      console.error("[RelatorioSondagem] Erro ao carregar dados:", error?.message || error);
      setError("Erro ao carregar dados do relatório");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { ensaio, obra, regional, project, loading, error };
}