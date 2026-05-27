import { useCallback } from "react";

export const useRelatorioRompimentoConcretoActions = () => {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handlePrint };
};