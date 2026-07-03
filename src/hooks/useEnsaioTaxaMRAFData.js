import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { obterEnsaioById } from "@/services/ensaiosService";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";
import { getEnsaioInicial } from "@/utils/ensaioTaxaMRAFUtils";

/**
 * Hook para carregamento e gerenciamento de dados iniciais
 * - Usuário autenticado (useCurrentUser — cache compartilhado)
 * - Obras disponíveis (filtradas por access_level, via useAuxData — cache compartilhado)
 * - Regionais (para filtro)
 * - Dados do ensaio se for edição
 */
export const useEnsaioTaxaMRAFData = () => {
  const [editingEnsaio, setEditingEnsaio] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { data: user, isLoading: loadingUser, error: userError } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux, error: auxError } = useAuxData({ needsRegionais: true });

  const regionais = auxData?.regionais ?? [];

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    const accessLevel = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
    let available = auxData.obras.filter(o =>
      o.tipo_obra === 'implantacao' || o.tipo_obra === 'conservacao' || o.tipo_obra === 'supervisao'
    );
    if (accessLevel === 'user') {
      const emailLower = user.email.toLowerCase();
      const regionaisIds = regionais
        .filter(r =>
          (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
          (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
        )
        .map(r => r.id);
      const regionaisSet = new Set(regionaisIds);
      available = regionaisIds.length > 0
        ? available.filter(o => regionaisSet.has(o.regional_id) && o.status === 'em_andamento')
        : [];
    }
    return available;
  }, [auxData?.obras, regionais, user]);

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const params = new URLSearchParams(location.search);
    const editId = params.get('editId');

    if (editId) {
      setEditLoading(true);
      obterEnsaioById('EnsaioTaxaMRAF', editId)
        .then(existing => setEditingEnsaio(existing))
        .catch(err => {
          console.error('Erro ao carregar dados:', err);
          setError(err.message);
          navigate(createPageUrl('MeusEnsaios'));
        })
        .finally(() => setEditLoading(false));
    }
  }, [location.search, loadingUser, loadingAux, user?.id, navigate]);

  const loading = loadingUser || loadingAux || editLoading;

  // Preservado para compatibilidade de interface — React Query cuida do carregamento automaticamente
  const loadInitialData = useCallback(() => {}, []);

  return {
    user,
    obras,
    regionais,
    editingEnsaio,
    loading,
    error: error || userError?.message || auxError?.message || null,
    loadInitialData
  };
};