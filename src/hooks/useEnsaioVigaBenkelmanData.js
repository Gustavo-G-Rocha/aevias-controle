/**
 * Hook de carregamento inicial para EnsaioVigaBenkelman.
 * Busca user, obras (filtradas), regionais e registro para edição.
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getInitialForm, filtrarObrasVigaBenkelman, reconstruirFaixas } from '@/utils/ensaioVigaBenkelmanUtils';

export function useEnsaioVigaBenkelmanData() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  const [loading, setLoading] = useState(true);
  const [user, setUser]   = useState(null);
  const [obras, setObras] = useState([]);
  const [formData, setFormData] = useState(getInitialForm());

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const [obrasData, regionaisData] = await Promise.all([
          base44.entities.Obra.list(),
          base44.entities.Regional.list(),
        ]);

        setObras(filtrarObrasVigaBenkelman(obrasData, regionaisData, currentUser));

        if (editId) {
          const ensaio = await base44.entities.EnsaioVigaBenkelman.get(editId);
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
        } else {
          setFormData(prev => ({
            ...prev,
            laboratorista_name: currentUser.laboratorista_name || currentUser.full_name,
          }));
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [editId]);

  return { loading, user, obras, formData, setFormData, editId };
}