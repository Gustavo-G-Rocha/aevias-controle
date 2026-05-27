/**
 * Hook de ações para RelatorioChecklistAplicacao.
 * Exporta o handler de impressão/PDF.
 */
import { useCallback } from 'react';

export function useRelatorioChecklistAplicacaoActions() {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handlePrint };
}