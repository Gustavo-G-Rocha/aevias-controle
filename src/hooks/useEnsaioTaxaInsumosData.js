import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { obterEnsaioById } from '@/services/ensaiosService';
import { createPageUrl } from '@/utils';
import { useCurrentUser, useAuxData } from '@/hooks/useQueryData';
import { getInitialForm, getEnsaioInicial, filtrarObrasDisponiveis } from '@/utils/ensaioTaxaInsumosUtils';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

export function useEnsaioTaxaInsumosData() {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(getInitialForm());
  const [editingEnsaio, setEditingEnsaio] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const regionais = auxData?.regionais ?? [];

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    return filtrarObrasDisponiveis(auxData.obras, regionais, user);
  }, [auxData?.obras, regionais, user]);

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const params = new URLSearchParams(location.search);
    const editId = params.get('editId');

    if (editId) {
      setEditLoading(true);
      obterEnsaioById('EnsaioTaxaInsumos', editId)
        .then(ensaioToEdit => {
          if (user.role === 'admin' || (ensaioToEdit.created_by === user.email && ensaioToEdit.approved !== true)) {
            setEditingEnsaio(ensaioToEdit);
            setFormData({
              ...ensaioToEdit,
              data_ensaio: ensaioToEdit.data_ensaio
                ? new Date(ensaioToEdit.data_ensaio).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              ensaios: ensaioToEdit.ensaios?.length > 0 ? ensaioToEdit.ensaios : [getEnsaioInicial(1)],
            });
          } else {
            toast({ title: 'Você não tem permissão para editar este registro.', variant: "destructive" });
            navigate(createPageUrl('MeusEnsaios'));
          }
        })
        .catch(err => {
          logger.error('Erro ao carregar dados:', err);
          toast({ title: 'Erro ao carregar dados.', variant: "destructive" });
          navigate(createPageUrl('MeusEnsaios'));
        })
        .finally(() => setEditLoading(false));
    } else if (obras.length > 0) {
      setFormData(prev => ({ ...prev, obra_id: obras[0].id }));
    }
  }, [location.search, loadingUser, loadingAux, user?.id, obras, navigate]);

  const loading = loadingUser || loadingAux || editLoading;

  return { formData, setFormData, obras, regionais, user, loading, editingEnsaio };
}