/**
 * Hook para ações do relatório de sondagem
 */
export function useRelatorioSondagemActions() {
  const handlePrint = () => {
    window.print();
  };

  return { handlePrint };
}