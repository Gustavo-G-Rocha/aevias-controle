/**
 * Hook de carregamento de dados iniciais do Boletim de Sondagem.
 * Responsabilidades: buscar user, obras, regionais, e boletim a editar.
 * Usa React Query (cache compartilhado via useAuxData) para evitar chamadas redundantes.
 */
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { getInitialFormData, getDensidadeInicial, normalizarDensidades } from "@/utils/boletimSondagemUtils";

export function useBoletimSondagemData() {
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
    const accessLevel = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
    if (accessLevel === 'user') {
      const emailLower = user.email.toLowerCase();
      const regionaisIds = regionais
        .filter(r =>
          (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
          (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
        )
        .map(r => r.id);
      const regionaisSet = new Set(regionaisIds);
      return regionaisIds.length > 0
        ? auxData.obras.filter(o => regionaisSet.has(o.regional_id) && o.status === 'em_andamento' && o.tipo_obra === 'sondagem')
        : [];
    }
    return auxData.obras.filter(o => o.tipo_obra === 'sondagem');
  }, [auxData?.obras, regionais, user]);

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const params = new URLSearchParams(location.search);
    const editId = params.get('editId');

    if (editId) {
      setEditLoading(true);
      base44.entities.BoletimSondagem.get(editId)
        .then(boletimToEdit => {
          if (user.role === 'admin' || (boletimToEdit.created_by === user.email && boletimToEdit.approved !== true)) {
            setEditingBoletim(boletimToEdit);
            const initial = getInitialFormData();
            setFormData({
              ...initial,
              ...boletimToEdit,
              data: boletimToEdit.data ? new Date(boletimToEdit.data).toISOString().split('T')[0] : initial.data,
              camadas: boletimToEdit.camadas?.length > 0 ? boletimToEdit.camadas : initial.camadas,
              umidade_natural: { ...initial.umidade_natural, ...(boletimToEdit.umidade_natural || {}) },
              densidades_in_situ: normalizarDensidades(boletimToEdit),
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
      setFormData(prev => {
        const novo = {
          ...prev,
          operador: user.laboratorista_name || user.full_name,
          obra_id: obras.length > 0 ? obras[0].id : "",
        };
        if (obras.length > 0) {
          const obra = obras[0];
          const regional = regionais.find(r => r.id === obra.regional_id);
          if (regional?.cliente) novo.cliente = regional.cliente;
        }
        return novo;
      });
    }
  }, [location.search, loadingUser, loadingAux, user?.id, obras, regionais, navigate]);

  const loading = loadingUser || loadingAux || editLoading;

  return { formData, setFormData, obras, regionais, user, loading, editingBoletim };
}