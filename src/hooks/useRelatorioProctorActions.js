/**
 * Hook de ações para RelatorioProctor.
 */
import { useCallback } from 'react';

export function useRelatorioProctorActions() {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handlePrint };
}