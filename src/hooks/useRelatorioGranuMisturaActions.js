/**
 * Hook de ações para RelatorioGranuMistura.
 * Gerencia ações de impressão e navegação.
 */

export const useRelatorioGranuMisturaActions = () => {
  const imprimirPDF = () => {
    window.print();
  };

  return { imprimirPDF };
};