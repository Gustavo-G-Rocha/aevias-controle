/**
 * Hook de carregamento de dados iniciais do Boletim de Sondagem.
 * Responsabilidades: buscar user, obras, regionais, e boletim a editar.
 */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { getInitialFormData, getDensidadeInicial, normalizarDensidades } from "@/utils/boletimSondagemUtils";

export function useBoletimSondagemData() {
  const [formData, setFormData] = useState(getInitialFormData());
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBoletim, setEditingBoletim] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const [obrasData, regionaisData] = await Promise.all([
          base44.entities.Obra.list(),
          base44.entities.Regional.list(),
        ]);

        const accessLevel = currentUser.access_level || (currentUser.role === 'admin' ? 'admin' : 'user');
        let availableObras;

        if (accessLevel === 'user') {
          const emailLower = currentUser.email.toLowerCase();
          const regionaisIds = regionaisData
            .filter(r =>
              (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
              (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
            )
            .map(r => r.id);
          const regionaisSet = new Set(regionaisIds);
          availableObras = regionaisIds.length > 0
            ? obrasData.filter(o => regionaisSet.has(o.regional_id) && o.status === 'em_andamento' && o.tipo_obra === 'sondagem')
            : [];
        } else {
          availableObras = obrasData.filter(o => o.tipo_obra === 'sondagem');
        }

        setObras(availableObras);
        setRegionais(regionaisData);

        const params = new URLSearchParams(location.search);
        const editId = params.get('editId');

        if (editId) {
          const boletimToEdit = await base44.entities.BoletimSondagem.get(editId);
          if (currentUser.role === 'admin' || (boletimToEdit.created_by === currentUser.email && boletimToEdit.approved !== true)) {
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
        } else {
          setFormData(prev => {
            const novo = {
              ...prev,
              operador: currentUser.laboratorista_name || currentUser.full_name,
              obra_id: availableObras.length > 0 ? availableObras[0].id : "",
            };
            if (availableObras.length > 0) {
              const obra = availableObras[0];
              const regional = regionaisData.find(r => r.id === obra.regional_id);
              if (regional?.cliente) novo.cliente = regional.cliente;
            }
            return novo;
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados.");
        navigate(createPageUrl('MeusEnsaios'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { formData, setFormData, obras, regionais, user, loading, editingBoletim };
}