/**
 * Hook de ações para RelatorioChecklistConcretagem.
 * Exporta o handler de impressão/PDF.
 */
import { useCallback } from 'react';

export function useRelatorioChecklistConcretagemActions() {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handlePrint };
}