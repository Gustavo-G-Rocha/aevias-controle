import { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
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
        base44.auth.me(),
        base44.entities.SolicitacaoTransferenciaRegional.list('-created_date'),
        base44.entities.Regional.list()
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