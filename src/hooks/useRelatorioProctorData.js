/**
 * Hook de carregamento de dados para RelatorioProctor.
 * Busca ensaio, obra e regional.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

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

        const data = await base44.entities.EnsaioProctor.get(id);
        setEnsaio(data);

        if (data.obra_id) {
          const obraData = await base44.entities.Obra.get(data.obra_id);
          setObra(obraData);
          if (obraData.regional_id) {
            const reg = await base44.entities.Regional.get(obraData.regional_id);
            setRegional(reg);
          }
        }
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