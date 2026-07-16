/**
 * Hook de carregamento de dados para RelatorioUnificado.
 * Busca obra, regional, projetos e usuário atual.
 */
import { useState, useEffect } from 'react';
import { obterObraById, listarObrasRecentes } from '@/services/obrasService';
import { listarRegionais } from '@/services/regionaisService';
import { listarProjects } from '@/services/projectsService';
import { listarFaixas } from '@/services/faixasService';
import { obterUsuarioAtual } from '@/services/usuariosService';
import { logger } from '@/utils/logger';

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
        let obraData = await obterObraById(obra_id).catch(() => null);

        if (!obraData) {
          // O id pode vir de uma lista em cache desatualizada — tenta resolver
          // na lista fresca do servidor antes de desistir.
          const obrasFrescas = await listarObrasRecentes().catch(() => []);
          obraData = obrasFrescas.find(o => o.id === obra_id) ?? null;
        }

        if (!obraData) {
          setError('Obra não encontrada. A lista de obras pode estar desatualizada — volte e selecione a obra novamente.');
          setLoading(false);
          return;
        }

        setObra(obraData);

        // Dados relacionados em paralelo com fallback individual
        const [regionaisResult, projectsResult, faixasResult, userResult] = await Promise.allSettled([
          listarRegionais(),
          listarProjects(),
          listarFaixas(),
          obterUsuarioAtual(),
        ]);

        const regionaisData = regionaisResult.status === 'fulfilled' ? regionaisResult.value : [];
        const projectsData  = projectsResult.status  === 'fulfilled' ? projectsResult.value  : [];
        const faixasData    = faixasResult.status     === 'fulfilled' ? faixasResult.value     : [];
        const currentUser   = userResult.status       === 'fulfilled' ? userResult.value       : null;

        if (regionaisResult.status === 'rejected')
          logger.warn('[RelatorioUnificado] Regionais não carregadas:', regionaisResult.reason);
        if (projectsResult.status === 'rejected')
          logger.warn('[RelatorioUnificado] Projetos não carregados:', projectsResult.reason);
        if (faixasResult.status === 'rejected')
          logger.warn('[RelatorioUnificado] Faixas granulométricas não carregadas:', faixasResult.reason);
        if (userResult.status === 'rejected')
          logger.warn('[RelatorioUnificado] Usuário não carregado:', userResult.reason);

        setUser(currentUser);
        setProjects(projectsData);
        setFaixasGranulometricas(faixasData);
        setRegional(regionaisData.find(r => r.id === obraData.regional_id) ?? null);

        setLoading(false);
      } catch (err) {
        logger.error('[RelatorioUnificado] Erro ao carregar dados:', err);
        setError(err.message || 'Erro ao carregar dados');
        setLoading(false);
      }
    };

    load();
  }, []);

  return { obra, regional, projects, faixasGranulometricas, user, loading, error };
}