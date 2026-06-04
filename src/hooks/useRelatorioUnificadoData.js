/**
 * Hook de carregamento de dados para RelatorioUnificado.
 * Busca obra, regional, projetos e usuário atual.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useRelatorioUnificadoData() {
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [projects, setProjects] = useState([]);
  const [faixasGranulometricas, setFaixasGranulometricas] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const obra_id = params.get('obra_id');

        if (!obra_id) {
          setError('ID da obra é obrigatório na URL');
          setLoading(false);
          return;
        }

        // Obra é obrigatória; os demais são independentes — falha isolada não bloqueia
        const obraData = await base44.entities.Obra.get(obra_id).catch(() => null);

        if (!obraData) {
          setError(`Obra com ID ${obra_id} não encontrada`);
          setLoading(false);
          return;
        }

        setObra(obraData);

        // Dados relacionados em paralelo com fallback individual
        const [regionaisResult, projectsResult, faixasResult, userResult] = await Promise.allSettled([
          base44.entities.Regional.list(),
          base44.entities.Project.list(),
          base44.entities.FaixaGranulometrica.list(),
          base44.auth.me(),
        ]);

        const regionaisData = regionaisResult.status === 'fulfilled' ? regionaisResult.value : [];
        const projectsData  = projectsResult.status  === 'fulfilled' ? projectsResult.value  : [];
        const faixasData    = faixasResult.status     === 'fulfilled' ? faixasResult.value     : [];
        const currentUser   = userResult.status       === 'fulfilled' ? userResult.value       : null;

        if (regionaisResult.status === 'rejected')
          console.warn('[RelatorioUnificado] Regionais não carregadas:', regionaisResult.reason);
        if (projectsResult.status === 'rejected')
          console.warn('[RelatorioUnificado] Projetos não carregados:', projectsResult.reason);
        if (faixasResult.status === 'rejected')
          console.warn('[RelatorioUnificado] Faixas granulométricas não carregadas:', faixasResult.reason);
        if (userResult.status === 'rejected')
          console.warn('[RelatorioUnificado] Usuário não carregado:', userResult.reason);

        setUser(currentUser);
        setProjects(projectsData);
        setFaixasGranulometricas(faixasData);
        setRegional(regionaisData.find(r => r.id === obraData.regional_id) ?? null);

        setLoading(false);
      } catch (err) {
        console.error('[RelatorioUnificado] Erro ao carregar dados:', err);
        setError(err.message || 'Erro ao carregar dados');
        setLoading(false);
      }
    };

    load();
  }, []);

  return { obra, regional, projects, faixasGranulometricas, user, loading, error };
}