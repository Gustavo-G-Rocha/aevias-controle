/**
 * Hook de ações para RelatorioChecklistConcretagem.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export function useRelatorioChecklistConcretagemActions() {
  return useReportPdfActions('relatorio-checklist-concretagem.pdf');
}