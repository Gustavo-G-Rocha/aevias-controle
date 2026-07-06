/**
 * Hook de carregamento inicial para EnsaioTaxaPinturaImprimacao.
 * Busca user, obras filtradas, regionais e registro para edição.
 * Usa React Query (cache compartilhado via useAuxData) para evitar chamadas redundantes.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { obterEnsaioById } from '@/services/ensaiosService';
import { listarUsuarios } from '@/services/usuariosService';
import { createPageUrl } from '@/utils';
import { useCurrentUser, useAuxData } from '@/hooks/useQueryData';
import {
  getInitialForm,
  getEnsaioInicial,
  filtrarObrasDisponiveis,
} from '@/utils/ensaioTaxaPinturaImprimacaoUtils';
import { toast } from "@/components/ui/use-toast";

export function useEnsaioTaxaPinturaImprimacaoData() {
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
      obterEnsaioById('EnsaioTaxaPinturaImprimacao', editId)
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
          console.error('Erro ao carregar dados:', err);
          toast({ title: 'Erro ao carregar dados.', variant: "destructive" });
          navigate(createPageUrl('MeusEnsaios'));
        })
        .finally(() => setEditLoading(false));
    } else if (obras.length > 0) {
      const primeiraObra = obras[0];
      const regional = regionais.find(r => r.id === primeiraObra.regional_id);
      let gestorName = '';
      if (regional?.gestor_contrato_responsavel) {
        try {
          listarUsuarios().then(allUsers => {
            const gestor = allUsers.find(u =>
              u.email.toLowerCase() === regional.gestor_contrato_responsavel.toLowerCase()
            );
            gestorName = gestor ? (gestor.laboratorista_name || gestor.full_name) : '';
            setFormData(prev => ({ ...prev, obra_id: primeiraObra.id, engenheiro_responsavel: gestorName }));
          });
        } catch {
          setFormData(prev => ({ ...prev, obra_id: primeiraObra.id }));
        }
      } else {
        setFormData(prev => ({ ...prev, obra_id: primeiraObra.id }));
      }
    }
  }, [location.search, loadingUser, loadingAux, user?.id, obras, regionais, navigate]);

  const loading = loadingUser || loadingAux || editLoading;

  return { formData, setFormData, obras, regionais, user, loading, editingEnsaio };
}