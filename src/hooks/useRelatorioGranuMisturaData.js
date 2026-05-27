/**
 * Hook de carregamento de dados para RelatorioGranuMistura.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export const useRelatorioGranuMisturaData = () => {
  const [record, setRecord] = useState(null);
  const [faixa, setFaixa] = useState(null);
  const [project, setProject] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const id = new URLSearchParams(window.location.search).get('id');
        if (!id) {
          setError('ID não fornecido');
          setLoading(false);
          return;
        }

        const rec = await base44.entities.GranuMistura.get(id);
        setRecord(rec);

        // Carrega projeto e faixa granulométrica
        if (rec.numero_projeto) {
          const proj = await base44.entities.Project.get(rec.numero_projeto);
          setProject(proj);
          if (proj.faixa_granulometrica_id) {
            const fxGran = await base44.entities.FaixaGranulometrica.get(
              proj.faixa_granulometrica_id,
            );
            setFaixa(fxGran);
          }
        } else if (rec.faixa) {
          try {
            const fxGran = await base44.entities.FaixaGranulometrica.get(
              rec.faixa,
            );
            setFaixa(fxGran);
          } catch (e) {
            console.error('Erro ao carregar faixa granulométrica pelo ID', e);
          }
        }

        // Carrega obra e regional
        if (rec.obra_id) {
          const obraData = await base44.entities.Obra.get(rec.obra_id);
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

    loadData();
  }, []);

  return { record, faixa, project, obra, regional, loading, error };
};