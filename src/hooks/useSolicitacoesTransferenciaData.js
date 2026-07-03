import { useState, useCallback, useEffect } from 'react';
import { obterUsuarioAtual } from '@/services/usuariosService';
import { listarRegistros } from '@/services/recordsService';
import { listarRegionais } from '@/services/regionaisService';
import { filterSolicitacoesByUserAccess } from '@/utils/solicitacoesTransferenciaUtils';

export function useSolicitacoesTransferenciaData() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, solicitacoesData, regionaisData] = await Promise.all([
        obterUsuarioAtual(),
        listarRegistros('SolicitacaoTransferenciaRegional', '-created_date'),
        listarRegionais()
      ]);

      setUser(userData);
      setRegionais(regionaisData);

      // Filtrar solicitações conforme acesso do usuário
      const filtradas = filterSolicitacoesByUserAccess(
        solicitacoesData,
        userData,
        regionaisData
      );

      setSolicitacoes(filtradas);
    } catch (error) {
      console.error("[SolicitacoesTransferencia] Erro ao carregar dados:", error?.message || error);
      alert("Erro ao carregar solicitações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { solicitacoes, regionais, user, loading, loadData };
}