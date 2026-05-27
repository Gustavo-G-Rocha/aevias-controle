/**
 * Hook para ações (print, etc.) em RelatorioTaxaMRAF
 * Mantém a implementação centralizada
 */
export function useRelatorioTaxaMRAFActions() {
  const handlePrint = () => {
    window.print();
  };

  return { handlePrint };
}