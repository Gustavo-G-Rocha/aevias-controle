import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getInitialFormData, filterObrasPorAcesso } from '@/utils/ensaioManchaPenduloUtils';

export const useEnsaioManchaPenduloData = (editId, isEditMode) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [userData, obrasData, regionaisData] = await Promise.all([
          base44.auth.me(),
          base44.entities.Obra.list(),
          base44.entities.Regional.list()
        ]);

        setUser(userData);
        setObras(obrasData);
        setRegionais(regionaisData);

        if (isEditMode) {
          const ensaio = await base44.entities.EnsaioManchaPendulo.get(editId);
          setFormData(ensaio);
        } else {
          setFormData(prev => ({
            ...prev,
            laboratorista_name: userData.laboratorista_name || userData.full_name
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [isEditMode, editId]);

  const userAccessLevel = user?.access_level || (user?.role === 'admin' ? 'admin' : 'user');
  const isAdmin = userAccessLevel === 'admin' || user?.role === 'admin';

  const obrasDisponiveis = filterObrasPorAcesso(obras, user, regionais, isAdmin, userAccessLevel);
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