/**
 * Hook de ações para RelatorioChecklist (Checklist de Usina).
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export function useRelatorioChecklistActions() {
  return useReportPdfActions('relatorio-checklist-usina.pdf');
}