import { useState, useEffect, useCallback } from 'react';
import { FaixaGranulometrica } from '@/entities/FaixaGranulometrica';
import { User } from '@/entities/User';

export function useFaixasGranulometricasData() {
  const [faixas, setFaixas] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, faixasData] = await Promise.all([
        User.me(),
        FaixaGranulometrica.list("-created_date")
      ]);
      
      setUser(userData);
      setFaixas(faixasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
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