import { useState, useEffect } from 'react';
import { obterRegistro } from '@/services/recordsService';
import { carregarObraRegional } from '@/services/relatorioContextService';
import { logger } from '@/utils/logger';

export function useRelatorioDensidadeInSituData() {
  const [ensaio, setEnsaio] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (!id) throw new Error('ID do ensaio é obrigatório na URL');

        const ensaioData = await obterRegistro('EnsaioDensidadeInSitu', id);
        if (!ensaioData) throw new Error(`Ensaio com ID ${id} não encontrado`);

        setEnsaio(ensaioData);

        const { obra: obraData, regional: regionalData } = await carregarObraRegional(ensaioData.obra_id);
        setObra(obraData);
        setRegional(regionalData);
        setError(null);
      } catch (err) {
        logger.error('Erro ao carregar relatório:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { ensaio, obra, regional, loading, error };
}