import { useCallback } from 'react';

export function useImpressionEtiquetasActions() {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handlePrint };
}