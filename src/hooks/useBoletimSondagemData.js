/**
 * Hook de carregamento de dados iniciais do Boletim de Sondagem.
 * Responsabilidades: buscar user, obras, regionais, e boletim a editar.
 * Usa React Query (cache compartilhado via useAuxData) para evitar chamadas redundantes.
 */
import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { obterEnsaioById } from "@/services/ensaiosService";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { getInitialFormData, getDensidadeInicial, normalizarDensidades } from "@/utils/boletimSondagemUtils";
import { filtrarObrasPorAcessoRegional } from "@/utils/regionalFilter";

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
export function useBoletimSondagemData() {
  const [formData, setFormData] = useState(getInitialFormData());
  const [editingBoletim, setEditingBoletim] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const regionais = useMemo(() => auxData?.regionais ?? [], [auxData?.regionais]);

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    const accessLevel = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
    const exigeEmAndamento = accessLevel === 'user' || accessLevel === 'funcionarios_cliente';
    const porAcesso = filtrarObrasPorAcessoRegional(auxData.obras, regionais, user);
    return porAcesso.filter(
      o => o.tipo_obra === 'sondagem' && (!exigeEmAndamento || o.status === 'em_andamento')
    );
  }, [auxData?.obras, regionais, user]);

  // Ref para acessar valores atualizados dentro do callback sem re-disparar o effect
  const auxRef = useRef({ obras, regionais });
  auxRef.current = { obras, regionais };

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const params = new URLSearchParams(location.search);
    const editId = params.get('editId');

    if (editId) {
      setEditLoading(true);
      obterEnsaioById('BoletimSondagem', editId)
        .then(boletimToEdit => {
          const { obras: curObras, regionais: curReg } = auxRef.current;
          const obraDoBoletim = curObras.find(o => o.id === boletimToEdit.obra_id) || null;
          const isCreator = boletimToEdit.created_by === user.email;
          // Boletim de Sondagem: só criador (até ser aprovado) ou admin (obra em andamento)
          const podeEditar = (user.role === 'admin' && obraDoBoletim?.status === 'em_andamento')
            || (isCreator && boletimToEdit.approved !== true);
          if (podeEditar) {
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
            toast({ title: "Você não tem permissão para editar este registro.", variant: "destructive" });
            navigate(createPageUrl('MeusEnsaios'));
          }
        })
        .catch(err => {
          logger.error("Erro ao carregar dados:", err);
          toast({ title: "Erro ao carregar dados.", variant: "destructive" });
          navigate(createPageUrl('MeusEnsaios'));
        })
        .finally(() => setEditLoading(false));
    } else {
      const { obras: curObras, regionais: curReg } = auxRef.current;
      setFormData(prev => {
        const novo = {
          ...prev,
          operador: user.laboratorista_name || user.full_name,
          obra_id: curObras.length > 0 ? curObras[0].id : "",
        };
        if (curObras.length > 0) {
          const obra = curObras[0];
          const regional = curReg.find(r => r.id === obra.regional_id);
          if (regional?.cliente) novo.cliente = regional.cliente;
        }
        return novo;
      });
    }
  }, [location.search, loadingUser, loadingAux, user?.id, navigate]);

  const loading = loadingUser || loadingAux || editLoading;

  return { formData, setFormData, obras, regionais, user, loading, editingBoletim };
}