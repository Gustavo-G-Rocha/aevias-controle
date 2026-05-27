/**
 * Hook de ações para RelatorioChecklist.
 * Exporta o handler de impressão/PDF.
 */
import { useCallback } from 'react';

export function useRelatorioChecklistActions() {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handlePrint };
}