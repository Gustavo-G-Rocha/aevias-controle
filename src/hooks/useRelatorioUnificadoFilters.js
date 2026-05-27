/**
 * Hook de filtros para RelatorioUnificado.
 * Extrai e valida parâmetros da URL.
 */
import { useState, useEffect } from 'react';

export function useRelatorioUnificadoFilters() {
  const [filters, setFilters] = useState({});
  const [hasValidFilters, setHasValidFilters] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const obra_id = params.get('obra_id');
    const data_inicio = params.get('data_inicio');
    const data_fim = params.get('data_fim');
    const tipo = params.get('tipo');
    const laboratoristas = (params.get('laboratoristas') || '').split(',').filter(Boolean);
    const rodovia = params.get('rodovia');
    const empreiteira = params.get('empreiteira');
    const usina = params.get('usina');

    const newFilters = {
      obra_id,
      data_inicio,
      data_fim,
      tipo,
      laboratoristas,
      rodovia,
      empreiteira,
      usina,
    };

    setFilters(newFilters);

    // Validar filtros obrigatórios
    const isValid = obra_id && data_inicio && data_fim && tipo;
    setHasValidFilters(!!isValid);
  }, []);

  return { filters, hasValidFilters };
}