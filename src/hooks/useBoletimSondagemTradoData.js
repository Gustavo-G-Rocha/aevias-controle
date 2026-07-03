/**
 * Hook de carregamento inicial para BoletimSondagemTrado.
 * Busca user, obras (filtradas por acesso) e regionais.
 * Trata modo de edição (editId na query string).
 * Usa React Query (cache compartilhado via useAuxData) para evitar chamadas redundantes.
 */
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { obterEnsaioById } from "@/services/ensaiosService";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import {
  getInitialFormData,
  getDensidadeInicial,
  filtrarObrasParaTrado,
} from "@/utils/boletimSondagemTradoUtils";

export function useBoletimSondagemTradoData() {
  const [formData, setFormData] = useState(getInitialFormData());
  const [editingBoletim, setEditingBoletim] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const regionais = auxData?.regionais ?? [];

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    return filtrarObrasParaTrado(auxData.obras, regionais, user);
  }, [auxData?.obras, regionais, user]);

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const params = new URLSearchParams(location.search);
    const editId = params.get('editId');

    if (editId) {
      setEditLoading(true);
      obterEnsaioById('BoletimSondagemTrado', editId)
        .then(boletimToEdit => {
          if (
            user.role === 'admin' ||
            (boletimToEdit.created_by === user.email && boletimToEdit.approved !== true)
          ) {
            setEditingBoletim(boletimToEdit);
            const initial = getInitialFormData();
            const densidades =
              boletimToEdit.densidades_in_situ?.length > 0
                ? boletimToEdit.densidades_in_situ
                : [getDensidadeInicial()];
            setFormData({
              ...initial,
              ...boletimToEdit,
              data: boletimToEdit.data
                ? new Date(boletimToEdit.data).toISOString().split('T')[0]
                : initial.data,
              camadas: boletimToEdit.camadas?.length > 0 ? boletimToEdit.camadas : initial.camadas,
              umidade_natural: { ...initial.umidade_natural, ...(boletimToEdit.umidade_natural || {}) },
              densidades_in_situ: densidades,
              ensaio_insitu_realizado: boletimToEdit.ensaio_insitu_realizado ?? false,
              fotos: Array.isArray(boletimToEdit.fotos) ? boletimToEdit.fotos : [],
            });
          } else {
            alert("Você não tem permissão para editar este registro.");
            navigate(createPageUrl('MeusEnsaios'));
          }
        })
        .catch(err => {
          console.error("Erro ao carregar dados:", err);
          alert("Erro ao carregar dados.");
          navigate(createPageUrl('MeusEnsaios'));
        })
        .finally(() => setEditLoading(false));
    } else {
      const firstObra = obras.length > 0 ? obras[0] : null;
      const regional = firstObra ? regionais.find(r => r.id === firstObra.regional_id) : null;
      setFormData(prev => ({
        ...prev,
        operador: user.laboratorista_name || user.full_name,
        obra_id: firstObra?.id || "",
        cliente: regional?.cliente || "",
      }));
    }
  }, [location.search, loadingUser, loadingAux, user?.id, obras, regionais, navigate]);

  const loading = loadingUser || loadingAux || editLoading;

  return { formData, setFormData, obras, regionais, user, loading, editingBoletim };
}