/**
 * Hook de carregamento de dados para RelatorioGranuMistura.
 */
import { useState, useEffect } from 'react';
import { obterGranuMisturaById } from '@/services/granuMisturaService';
import {
  carregarObraRegional,
  carregarProject,
  carregarFaixaDoProject,
} from '@/services/relatorioContextService';
import { obterFaixaById } from '@/services/faixasService';

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

        const rec = await obterGranuMisturaById(id);
        setRecord(rec);

        // Projeto e faixa granulométrica (sequencial pois faixa depende do projeto)
        let proj = null;
        if (rec.numero_projeto) {
          proj = await carregarProject(rec.numero_projeto);
          setProject(proj);
          if (proj?.faixa_granulometrica_id) {
            setFaixa(await carregarFaixaDoProject(proj));
          }
        } else if (rec.faixa) {
          try {
            setFaixa(await obterFaixaById(rec.faixa));
          } catch (e) {
            console.error('Erro ao carregar faixa granulométrica pelo ID', e);
          }
        }

        // Obra e regional
        const { obra: obraData, regional: reg } = await carregarObraRegional(rec.obra_id);
        setObra(obraData);
        setRegional(reg);
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