import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

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

        const [ensaioData, obras, regionais] = await Promise.all([
          base44.entities.EnsaioDensidadeInSitu.get(id),
          base44.entities.Obra.list(),
          base44.entities.Regional.list()
        ]);

        if (!ensaioData) throw new Error(`Ensaio com ID ${id} não encontrado`);

        let obraData = null;
        let regionalData = null;

        if (ensaioData.obra_id) {
          obraData = obras.find(o => o.id === ensaioData.obra_id);
          if (obraData?.regional_id) {
            regionalData = regionais.find(r => r.id === obraData.regional_id);
          }
        }

        setEnsaio(ensaioData);
        setObra(obraData);
        setRegional(regionalData);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar relatório:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { ensaio, obra, regional, loading, error };
}