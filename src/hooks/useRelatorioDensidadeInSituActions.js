/**
 * Hook de ações para RelatorioDensidadeInSitu.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export function useRelatorioDensidadeInSituActions() {
  return useReportPdfActions('relatorio-densidade-in-situ.pdf');
}