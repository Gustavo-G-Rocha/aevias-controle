/**
 * Hook de carregamento inicial para EnsaioVigaBenkelman.
 * Busca user, obras (filtradas), regionais e registro para edição.
 * Usa React Query (cache compartilhado via useAuxData) para evitar chamadas redundantes.
 */
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { obterEnsaioById } from '@/services/ensaiosService';
import { useCurrentUser, useAuxData } from '@/hooks/useQueryData';
import { getInitialForm, filtrarObrasVigaBenkelman, reconstruirFaixas } from '@/utils/ensaioVigaBenkelmanUtils';
import { logger } from '@/utils/logger';

export function useEnsaioVigaBenkelmanData() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(getInitialForm());

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    return filtrarObrasVigaBenkelman(auxData.obras, auxData.regionais, user);
  }, [auxData, user]);

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    if (editId) {
      obterEnsaioById('EnsaioVigaBenkelman', editId)
        .then(ensaio => {
          const faixasReconstruidas = reconstruirFaixas(
            ensaio.levantamentos,
            ensaio.leitura_inicial_global
          );
          setFormData({
            ...ensaio,
            observacoes: ensaio.observacoes || '',
            faixas: faixasReconstruidas,
            nextFaixaId: faixasReconstruidas.length + 1,
          });
        })
        .catch(err => logger.error('Erro ao carregar dados:', err))
        .finally(() => setLoading(false));
    } else {
      setFormData(prev => ({
        ...prev,
        laboratorista_name: user.laboratorista_name || user.full_name,
      }));
      setLoading(false);
    }
  }, [editId, loadingUser, loadingAux, user?.id]);

  return { loading, user, obras, formData, setFormData, editId };
}