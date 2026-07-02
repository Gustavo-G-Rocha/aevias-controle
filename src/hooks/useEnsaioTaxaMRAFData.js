import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { getEnsaioInicial } from "@/utils/ensaioTaxaMRAFUtils";

/**
 * Hook para carregamento e gerenciamento de dados iniciais
 * - Usuário autenticado
 * - Obras disponíveis (filtradas por access_level)
 * - Regionais (para filtro)
 * - Dados do ensaio se for edição
 */
export const useEnsaioTaxaMRAFData = () => {
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [editingEnsaio, setEditingEnsaio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [obrasData, regionaisData] = await Promise.all([
        base44.entities.Obra.list(),
        base44.entities.Regional.list()
      ]);

      const accessLevel = currentUser.access_level || (currentUser.role === 'admin' ? 'admin' : 'user');
      let availableObras = obrasData.filter(o =>
        o.tipo_obra === 'implantacao' || o.tipo_obra === 'conservacao' || o.tipo_obra === 'supervisao'
      );

      // Filtrar obras por access_level
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
          ? availableObras.filter(o => regionaisSet.has(o.regional_id) && o.status === 'em_andamento')
          : [];
      }

      setObras(availableObras);
      setRegionais(regionaisData);

      // Carregar ensaio se for edição
      const params = new URLSearchParams(location.search);
      const editId = params.get('editId');

      if (editId) {
        const existing = await base44.entities.EnsaioTaxaMRAF.get(editId);
        setEditingEnsaio(existing);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message);
      navigate(createPageUrl('MeusEnsaios'));
    } finally {
      setLoading(false);
    }
  }, [location, navigate]);

  return {
    user,
    obras,
    regionais,
    editingEnsaio,
    loading,
    error,
    loadInitialData
  };
};