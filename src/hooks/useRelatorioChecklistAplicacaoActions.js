/**
 * Hook de ações para RelatorioChecklistAplicacao.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export function useRelatorioChecklistAplicacaoActions() {
  return useReportPdfActions('relatorio-checklist-aplicacao.pdf');
}