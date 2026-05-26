/**
 * Hook de carregamento inicial para BoletimSondagemTrado.
 * Busca user, obras (filtradas por acesso) e regionais.
 * Trata modo de edição (editId na query string).
 */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  getInitialFormData,
  getDensidadeInicial,
  filtrarObrasParaTrado,
} from "@/utils/boletimSondagemTradoUtils";

export function useBoletimSondagemTradoData() {
  const [formData, setFormData] = useState(getInitialFormData());
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBoletim, setEditingBoletim] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const [obrasData, regionaisData] = await Promise.all([
          base44.entities.Obra.list(),
          base44.entities.Regional.list(),
        ]);

        const availableObras = filtrarObrasParaTrado(obrasData, regionaisData, currentUser);

        setObras(availableObras);
        setRegionais(regionaisData);

        const params = new URLSearchParams(location.search);
        const editId = params.get('editId');

        if (editId) {
          const boletimToEdit = await base44.entities.BoletimSondagemTrado.get(editId);
          if (
            currentUser.role === 'admin' ||
            (boletimToEdit.created_by === currentUser.email && boletimToEdit.approved !== true)
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
        } else {
          const firstObra = availableObras.length > 0 ? availableObras[0] : null;
          const regional = firstObra ? regionaisData.find(r => r.id === firstObra.regional_id) : null;
          setFormData(prev => ({
            ...prev,
            operador: currentUser.laboratorista_name || currentUser.full_name,
            obra_id: firstObra?.id || "",
            cliente: regional?.cliente || "",
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados.");
        navigate(createPageUrl('MeusEnsaios'));
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [location.search]);

  return { formData, setFormData, obras, regionais, user, loading, editingBoletim };
}