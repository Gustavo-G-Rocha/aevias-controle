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
    // Suporta 'tipos' (multi) e 'tipo' (legado single) para compatibilidade
    const tiposParam = params.get('tipos') || params.get('tipo') || '';
    const tipos = tiposParam.split(',').filter(Boolean);
    const laboratoristas = (params.get('laboratoristas') || '').split(',').filter(Boolean);
    const rodovia = params.get('rodovia');
    const empreiteira = params.get('empreiteira');
    const usina = params.get('usina');

    const newFilters = {
      obra_id,
      data_inicio,
      data_fim,
      tipos,
      // Mantém 'tipo' como primeiro item para retrocompatibilidade com componentes que o lêem
      tipo: tipos[0] || '',
      laboratoristas,
      rodovia,
      empreiteira,
      usina,
    };

    setFilters(newFilters);

    // Validar filtros obrigatórios
    const isValid = obra_id && data_inicio && data_fim && tipos.length > 0;
    setHasValidFilters(!!isValid);
  }, []);

  return { filters, hasValidFilters };
}