import { useState, useCallback, useEffect } from "react";
import { obterEnsaioById } from "@/services/ensaiosService";
import { obterObraById } from "@/services/obrasService";
import { obterRegionalById } from "@/services/regionaisService";
import { obterProjectById } from "@/services/projectsService";
import { obterFaixaById } from "@/services/faixasService";

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

      const ensaioData = await obterEnsaioById('EnsaioSondagem', ensaioId);
      setEnsaio(ensaioData);

      if (ensaioData.obra_id) {
        const obraData = await obterObraById(ensaioData.obra_id);
        setObra(obraData);

        if (obraData.regional_id) {
          const regionalData = await obterRegionalById(obraData.regional_id);
          setRegional(regionalData);
        }
      }

      if (ensaioData.project_id) {
        const projectData = await obterProjectById(ensaioData.project_id);
        let projectToSet = projectData;

        if (projectData.faixa_granulometrica_id) {
          const faixaData = await obterFaixaById(projectData.faixa_granulometrica_id);
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