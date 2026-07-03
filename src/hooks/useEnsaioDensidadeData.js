/**
 * Hook de carregamento inicial para EnsaioDensidadeInSitu.
 * Usa React Query (cache compartilhado) para evitar 429 Too Many Requests.
 */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { obterEnsaioById } from "@/services/ensaiosService";
import { getInitialFormData, filtrarObrasDisponiveis, getFuroInicial } from "@/utils/ensaioDensidadeUtils";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";

export function useEnsaioDensidadeData() {
  const [formData, setFormData] = useState(getInitialFormData());
  const [editingEnsaio, setEditingEnsaio] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Cache compartilhado — não dispara novas requisições se os dados ainda forem frescos
  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true, needsUsers: false });

  const obras = auxData ? filtrarObrasDisponiveis(auxData.obras, auxData.regionais, user) : [];
  const projects = auxData?.projects ?? [];
  const regionais = auxData?.regionais ?? [];

  // Carrega o ensaio para edição (editId na query string)
  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const params = new URLSearchParams(location.search);
    const editId = params.get('editId');

    if (!editId) {
      // Novo ensaio: preenche obra e engenheiro padrão
      if (obras.length > 0) {
        const primeiraObra = obras[0];
        const regional = regionais.find(r => r.id === primeiraObra.regional_id);
        let gestorName = "";
        if (regional?.gestor_contrato_responsavel) {
          // Busca o nome do gestor apenas se necessário (sem listar todos os usuários)
          gestorName = regional.gestor_contrato_responsavel;
        }
        setFormData(prev => ({
          ...getInitialFormData(),
          obra_id: primeiraObra.id,
          engenheiro_responsavel: gestorName,
        }));
      }
      setEditingEnsaio(null);
      return;
    }

    // Modo edição: carrega o ensaio específico
    setEditLoading(true);
    obterEnsaioById('EnsaioDensidadeInSitu', editId)
      .then(ensaioToEdit => {
        if (
          user.role === 'admin' ||
          (ensaioToEdit.created_by === user.email && ensaioToEdit.approved !== true)
        ) {
          setEditingEnsaio(ensaioToEdit);
          setFormData({
            ...ensaioToEdit,
            data_ensaio: ensaioToEdit.data_ensaio
              ? new Date(ensaioToEdit.data_ensaio).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            furos:
              ensaioToEdit.furos && ensaioToEdit.furos.length > 0
                ? ensaioToEdit.furos
                : [getFuroInicial(1)],
            fotos: Array.isArray(ensaioToEdit.fotos) ? ensaioToEdit.fotos : [],
          });
        } else {
          alert("Você não tem permissão para editar este registro.");
          navigate(createPageUrl('MeusEnsaios'));
        }
      })
      .catch(err => {
        console.error("Erro ao carregar ensaio:", err);
        alert("Erro ao carregar ensaio para edição.");
        navigate(createPageUrl('MeusEnsaios'));
      })
      .finally(() => setEditLoading(false));
  }, [location.search, loadingUser, loadingAux, user?.id]);

  const loading = loadingUser || loadingAux || editLoading;

  return { formData, setFormData, obras, projects, regionais, user, loading, editingEnsaio };
}