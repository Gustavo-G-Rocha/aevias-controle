/**
 * Hook de ações para RelatorioBoletimSondagemTrado.
 * Gerencia ações de impressão e navegação.
 */

export const useRelatorioBoletimSondagemTradoActions = () => {
  const imprimirPDF = () => {
    window.print();
  };

  return { imprimirPDF };
};