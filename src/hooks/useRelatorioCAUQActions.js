/**
 * Hook de ações para RelatorioCAUQ.
 * Exporta o handler de impressão/PDF.
 */
import { useCallback } from 'react';

export function useRelatorioCAUQActions() {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handlePrint };
}