import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

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

        const data = await base44.entities.EnsaioVigaBenkelman.get(id);

        if (!data.levantamentos || !Array.isArray(data.levantamentos)) {
          data.levantamentos = [];
        }

        setEnsaio(data);

        if (data.obra_id) {
          const obraData = await base44.entities.Obra.get(data.obra_id);
          setObra(obraData);

          if (obraData.regional_id) {
            const regionalData = await base44.entities.Regional.get(obraData.regional_id);
            setRegional(regionalData);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar ensaio:', err);
        setError('Erro ao carregar ensaio');
      } finally {
        setLoading(false);
      }
    };

    loadEnsaio();
  }, [id]);

  return { ensaio, obra, regional, loading, error };
}