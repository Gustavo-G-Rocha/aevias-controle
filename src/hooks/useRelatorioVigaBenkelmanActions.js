export function useRelatorioVigaBenkelmanActions() {
  const handlePrint = () => {
    window.print();
  };

  return { handlePrint };
}