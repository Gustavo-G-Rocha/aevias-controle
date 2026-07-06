import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { obterRegistro } from '@/services/recordsService';
import { carregarObraRegional } from '@/services/relatorioContextService';
import { logger } from '@/utils/logger';

export function useRelatorioVigaBenkelmanData() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [ensaio, setEnsaio] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEnsaio = async () => {
      try {
        if (!id) {
          setError('ID do ensaio não fornecido');
          setLoading(false);
          return;
        }

        const data = await obterRegistro('EnsaioVigaBenkelman', id);

        if (!data.levantamentos || !Array.isArray(data.levantamentos)) {
          data.levantamentos = [];
        }

        setEnsaio(data);

        const { obra: obraData, regional: regionalData } = await carregarObraRegional(data.obra_id);
        setObra(obraData);
        setRegional(regionalData);
      } catch (err) {
        logger.error('Erro ao carregar ensaio:', err);
        setError('Erro ao carregar ensaio');
      } finally {
        setLoading(false);
      }
    };

    loadEnsaio();
  }, [id]);

  return { ensaio, obra, regional, loading, error };
}