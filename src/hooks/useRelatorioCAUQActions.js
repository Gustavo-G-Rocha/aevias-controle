/**
 * Hook de ações para RelatorioCAUQ.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export function useRelatorioCAUQActions() {
  return useReportPdfActions('relatorio-cauq.pdf');
}