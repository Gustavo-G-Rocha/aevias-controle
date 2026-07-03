/**
 * Hook de carregamento de dados para RelatorioProctor.
 * Busca ensaio, obra e regional.
 */
import { useState, useEffect } from 'react';
import { obterRegistro } from '@/services/recordsService';
import { carregarObraRegional } from '@/services/relatorioContextService';

export function useRelatorioProctorData() {
  const [ensaio,   setEnsaio]   = useState(null);
  const [obra,     setObra]     = useState(null);
  const [regional, setRegional] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const id = new URLSearchParams(window.location.search).get('id');
        if (!id) { setError('ID não fornecido'); return; }

        const data = await obterRegistro('EnsaioProctor', id);
        if (!data) { setError('Ensaio não encontrado'); return; }
        setEnsaio(data);

        const { obra: obraData, regional: regionalData } = await carregarObraRegional(data.obra_id);
        setObra(obraData);
        setRegional(regionalData);
      } catch (err) {
        setError('Erro ao carregar: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { ensaio, obra, regional, loading, error };
}