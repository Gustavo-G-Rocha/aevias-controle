import { useState, useEffect, useCallback } from 'react';
import { obterUsuarioAtual } from '@/services/usuariosService';
import { listarFaixas } from '@/services/faixasService';
import { logger } from '@/utils/logger';

export function useFaixasGranulometricasData() {
  const [faixas, setFaixas] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, faixasDataRaw] = await Promise.all([
        obterUsuarioAtual(),
        listarFaixas()
      ]);
      const faixasData = Array.isArray(faixasDataRaw)
        ? [...faixasDataRaw].sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        : faixasDataRaw;
      
      setUser(userData);
      setFaixas(faixasData);
    } catch (error) {
      logger.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    faixas,
    setFaixas,
    user,
    loading,
    loadData
  };
}