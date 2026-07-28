/**
 * Hook de ações para RelatorioBoletimSondagem.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export const useRelatorioBoletimSondagemActions = () => {
  return useReportPdfActions('boletim-sondagem.pdf');
};