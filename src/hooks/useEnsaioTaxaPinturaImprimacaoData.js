/**
 * Hook de carregamento inicial para EnsaioTaxaPinturaImprimacao.
 * Busca user, obras filtradas, regionais e registro para edição.
 */
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import {
  getInitialForm,
  getEnsaioInicial,
  filtrarObrasDisponiveis,
} from '@/utils/ensaioTaxaPinturaImprimacaoUtils';

export function useEnsaioTaxaPinturaImprimacaoData() {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData,       setFormData]       = useState(getInitialForm());
  const [obras,          setObras]          = useState([]);
  const [regionais,      setRegionais]      = useState([]);
  const [user,           setUser]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [editingEnsaio,  setEditingEnsaio]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [obrasData, regionaisData] = await Promise.all([
        base44.entities.Obra.list(),
        base44.entities.Regional.list(),
      ]);

      const available = filtrarObrasDisponiveis(obrasData, regionaisData, currentUser);
      setObras(available);
      setRegionais(regionaisData);

      const params = new URLSearchParams(location.search);
      const editId = params.get('editId');

      if (editId) {
        const ensaioToEdit = await base44.entities.EnsaioTaxaPinturaImprimacao.get(editId);
        if (currentUser.role === 'admin' || (ensaioToEdit.created_by === currentUser.email && ensaioToEdit.approved !== true)) {
          setEditingEnsaio(ensaioToEdit);
          setFormData({
            ...ensaioToEdit,
            data_ensaio: ensaioToEdit.data_ensaio
              ? new Date(ensaioToEdit.data_ensaio).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            ensaios: ensaioToEdit.ensaios?.length > 0 ? ensaioToEdit.ensaios : [getEnsaioInicial(1)],
          });
        } else {
          alert('Você não tem permissão para editar este registro.');
          navigate(createPageUrl('MeusEnsaios'));
        }
      } else if (available.length > 0) {
        const primeiraObra = available[0];
        const regional     = regionaisData.find(r => r.id === primeiraObra.regional_id);
        let gestorName = '';
        if (regional?.gestor_contrato_responsavel) {
          try {
            const allUsers = await base44.entities.User.list();
            const gestor = allUsers.find(u =>
              u.email.toLowerCase() === regional.gestor_contrato_responsavel.toLowerCase()
            );
            gestorName = gestor ? (gestor.laboratorista_name || gestor.full_name) : '';
          } catch {
            // sem permissão para listar usuários
          }
        }
        setFormData(prev => ({ ...prev, obra_id: primeiraObra.id, engenheiro_responsavel: gestorName }));
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      alert('Erro ao carregar dados.');
      navigate(createPageUrl('MeusEnsaios'));
    } finally {
      setLoading(false);
    }
  }, [location.search, navigate]);

  useEffect(() => { load(); }, [load]);

  return { formData, setFormData, obras, regionais, user, loading, editingEnsaio };
}