/**
 * Hook de ações para RelatorioGranuMistura.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export const useRelatorioGranuMisturaActions = () => {
  const { handlePrint, downloading } = useReportPdfActions('relatorio-granulometria-mistura.pdf');
  return { imprimirPDF: handlePrint, downloading };
};