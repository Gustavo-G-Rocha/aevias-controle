/**
 * Hook de carregamento de dados para RelatorioBoletimSondagemTrado.
 */
import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export const useRelatorioBoletimSondagemTradoData = () => {
  const [boletim, setBoletim] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (!id) {
        setError('ID não fornecido');
        return;
      }

      const data = await base44.entities.BoletimSondagemTrado.get(id);
      setBoletim(data);

      if (data.obra_id) {
        const obraData = await base44.entities.Obra.get(data.obra_id);
        setObra(obraData);
        if (obraData.regional_id) {
          const regionalData = await base44.entities.Regional.get(
            obraData.regional_id,
          );
          setRegional(regionalData);
        }
      }
    } catch (err) {
      setError('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { boletim, obra, regional, loading, error };
};