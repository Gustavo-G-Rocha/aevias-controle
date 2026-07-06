import { useState, useEffect } from 'react';
import { obterEnsaioById } from '@/services/ensaiosService';
import { carregarObraRegional, carregarCreatorUser } from '@/services/relatorioContextService';
import { logger } from '@/utils/logger';

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
        const data = await obterEnsaioById('EnsaioTaxaMRAF', ensaioId);
        setEnsaio(data);

        const [obraRegional, creator] = await Promise.all([
          carregarObraRegional(data.obra_id),
          carregarCreatorUser(data.created_by),
        ]);

        setObra(obraRegional.obra);
        setRegional(obraRegional.regional);
        setCreatorUser(creator);
      } catch (err) {
        logger.error('[useRelatorioTaxaMRAFData] Erro ao carregar dados:', err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ensaioId]);

  return { ensaio, obra, regional, creatorUser, loading };
}