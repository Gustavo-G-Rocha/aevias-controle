/**
 * Hook de ações para RelatorioTaxaMRAF.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export function useRelatorioTaxaMRAFActions() {
  return useReportPdfActions('relatorio-taxa-mraf.pdf');
}