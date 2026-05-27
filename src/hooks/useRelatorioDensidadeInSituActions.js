export function useRelatorioDensidadeInSituActions() {
  const handlePrint = () => {
    window.print();
  };

  return { handlePrint };
}