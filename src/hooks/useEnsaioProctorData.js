/**
 * Hook de carregamento inicial para EnsaioProctor.
 * Busca user, obras (filtradas), regionais e registro para edição.
 */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getInitialForm, filtrarObrasProctor } from "@/utils/ensaioProctorUtils";
import { defaultLimites } from "@/components/ensaios/EnsaioLimites";

export function useEnsaioProctorData() {
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get("id");
  const obraId = searchParams.get("obra_id");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [obras, setObras] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [form, setForm] = useState({ ...getInitialForm(obraId || ""), limites: defaultLimites() });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const userData = await base44.auth.me();
        setForm(prev => ({ ...prev, laboratorista_name: userData.laboratorista_name || userData.full_name }));

        const [obrasData, regionaisData, recordData] = await Promise.all([
          base44.entities.Obra.list(),
          base44.entities.Regional.list(),
          recordId ? base44.entities.EnsaioProctor.get(recordId) : Promise.resolve(null),
        ]);

        setObras(filtrarObrasProctor(obrasData, regionaisData, userData));

        if (recordData) {
          setForm(recordData);
          if (recordData.project_id) {
            const projectData = await base44.entities.Project.get(recordData.project_id);
            setProjetos([projectData]);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [recordId]);

  return { form, setForm, obras, projetos, setProjetos, loading, recordId };
}