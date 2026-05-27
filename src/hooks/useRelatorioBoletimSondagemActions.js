import { useCallback } from "react";

export const useRelatorioBoletimSondagemActions = () => {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handlePrint };
};