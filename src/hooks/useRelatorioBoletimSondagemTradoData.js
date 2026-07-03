/**
 * Hook de carregamento de dados para RelatorioBoletimSondagemTrado.
 */
import { useState, useEffect, useCallback } from 'react';
import { obterRegistro } from '@/services/recordsService';
import { carregarObraRegional } from '@/services/relatorioContextService';

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

      const data = await obterRegistro('BoletimSondagemTrado', id);
      setBoletim(data);

      const { obra: obraData, regional: regionalData } = await carregarObraRegional(data.obra_id);
      setObra(obraData);
      setRegional(regionalData);
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