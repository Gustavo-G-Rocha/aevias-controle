/**
 * Hook de ações para RelatorioVigaBenkelman.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export function useRelatorioVigaBenkelmanActions() {
  return useReportPdfActions('relatorio-viga-benkelman.pdf');
}