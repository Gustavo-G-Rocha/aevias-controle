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
    // Sondagem é atividade de investigação pré-construção: a obra pode estar
    // em planejamento ou em andamento quando o trabalho de campo ocorre.
    // Por isso não restringimos por status — apenas pelo acesso regional
    // (filtrarObrasPorAcessoRegional) e pelo tipo_obra === 'sondagem'.
    const porAcesso = filtrarObrasPorAcessoRegional(auxData.obras, regionais, user);
    return porAcesso.filter(o => o.tipo_obra === 'sondagem');
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
      // Novo boletim: NÃO pré-seleciona a obra. O usuário deve escolher
      // explicitamente. Isso mantém o placeholder "Selecione a obra"
      // como nome acessível do combobox — essencial para leitores de tela
      // e para automações de teste localizarem o campo pelo rótulo.
      // cliente e obra_id são preenchidos por handleObraChange ao selecionar.
      setFormData(prev => ({
        ...prev,
        operador: user.laboratorista_name || user.full_name,
        obra_id: "",
      }));
    }
  }, [location.search, loadingUser, loadingAux, user?.id, navigate]);

  const loading = loadingUser || loadingAux || editLoading;

  return { formData, setFormData, obras, regionais, user, loading, editingBoletim };
}