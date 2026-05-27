/**
 * Hook de ações para RelatorioDiario.
 * Exporta o handler de impressão/PDF.
 */
import { useCallback } from 'react';

export function useRelatorioDiarioActions() {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handlePrint };
}