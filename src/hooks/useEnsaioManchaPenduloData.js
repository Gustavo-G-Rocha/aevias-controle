import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser, useAuxData } from '@/hooks/useQueryData';
import { getInitialFormData, filterObrasPorAcesso } from '@/utils/ensaioManchaPenduloUtils';

export const useEnsaioManchaPenduloData = (editId, isEditMode) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(getInitialFormData());

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const obras = auxData?.obras ?? [];
  const regionais = auxData?.regionais ?? [];

  const userAccessLevel = user?.access_level || (user?.role === 'admin' ? 'admin' : 'user');
  const isAdmin = userAccessLevel === 'admin' || user?.role === 'admin';

  const obrasDisponiveis = useMemo(
    () => filterObrasPorAcesso(obras, user, regionais, isAdmin, userAccessLevel),
    [obras, user, regionais, isAdmin, userAccessLevel]
  );

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    if (isEditMode) {
      base44.entities.EnsaioManchaPendulo.get(editId)
        .then(ensaio => setFormData(ensaio))
        .catch(error => console.error('Erro ao carregar dados:', error))
        .finally(() => setLoading(false));
    } else {
      setFormData(prev => ({
        ...prev,
        laboratorista_name: user.laboratorista_name || user.full_name
      }));
      setLoading(false);
    }
  }, [isEditMode, editId, loadingUser, loadingAux, user?.id]);

  const obraSelecionada = obras.find(o => o.id === formData.obra_id);
  const rodoviasDaObra = obraSelecionada?.rodovias || [];

  return {
    loading,
    user,
    obras,
    regionais,
    formData,
    setFormData,
    obrasDisponiveis,
    rodoviasDaObra,
    userAccessLevel,
    isAdmin
  };
};