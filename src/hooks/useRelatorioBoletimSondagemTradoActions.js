/**
 * Hook de ações para RelatorioBoletimSondagemTrado.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export const useRelatorioBoletimSondagemTradoActions = () => {
  const { handlePrint, downloading } = useReportPdfActions('boletim-sondagem-trado.pdf');
  return { imprimirPDF: handlePrint, downloading };
};