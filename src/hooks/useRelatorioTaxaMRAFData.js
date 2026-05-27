import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook para carregar dados de EnsaioTaxaMRAF, Obra, Regional e Criador
 * Mantém a lógica de carregamento em cascata, sem alterar comportamento
 */
export function useRelatorioTaxaMRAFData(ensaioId) {
  const [ensaio, setEnsaio] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [creatorUser, setCreatorUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ensaioId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const data = await base44.entities.EnsaioTaxaMRAF.get(ensaioId);
        setEnsaio(data);

        if (data.obra_id) {
          const obraData = await base44.entities.Obra.get(data.obra_id);
          setObra(obraData);
          if (obraData.regional_id) {
            const regionalData = await base44.entities.Regional.get(obraData.regional_id);
            setRegional(regionalData);
          }
        }

        if (data.created_by) {
          try {
            const users = await base44.entities.User.list();
            const u = users.find(u => u.email === data.created_by);
            setCreatorUser(u || null);
          } catch (e) {
            console.error('Erro ao carregar usuário criador do ensaio', e);
          }
        }
      } catch (err) {
        console.error('[useRelatorioTaxaMRAFData] Erro ao carregar dados:', err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ensaioId]);

  return { ensaio, obra, regional, creatorUser, loading };
}