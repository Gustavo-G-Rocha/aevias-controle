/**
 * Hook de ações para RelatorioSondagem.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export function useRelatorioSondagemActions() {
  return useReportPdfActions('relatorio-sondagem.pdf');
}