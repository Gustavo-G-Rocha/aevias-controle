/**
 * Hook de carregamento inicial para EnsaioProctor.
 * Busca user, obras (filtradas), regionais e registro para edição.
 * Usa React Query (cache compartilhado via useAuxData) para evitar chamadas redundantes.
 */
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { getInitialForm, filtrarObrasProctor } from "@/utils/ensaioProctorUtils";
import { defaultLimites } from "@/components/ensaios/EnsaioLimites";

export function useEnsaioProctorData() {
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get("id");
  const obraId = searchParams.get("obra_id");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [projetos, setProjetos] = useState([]);
  const [form, setForm] = useState({ ...getInitialForm(obraId || ""), limites: defaultLimites() });

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    return filtrarObrasProctor(auxData.obras, auxData.regionais, user);
  }, [auxData, user]);

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    setForm(prev => ({ ...prev, laboratorista_name: user.laboratorista_name || user.full_name }));

    if (recordId) {
      base44.entities.EnsaioProctor.get(recordId)
        .then(recordData => {
          setForm(recordData);
          if (recordData.project_id) {
            return base44.entities.Project.get(recordData.project_id).then(projectData => {
              setProjetos([projectData]);
            });
          }
        })
        .catch(err => console.error("Erro ao carregar dados:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [recordId, loadingUser, loadingAux, user?.id]);

  return { form, setForm, obras, projetos, setProjetos, loading, recordId };
}