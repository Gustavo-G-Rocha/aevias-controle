/**
 * Hook de ações para RelatorioProctor.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export function useRelatorioProctorActions() {
  return useReportPdfActions('relatorio-proctor.pdf');
}