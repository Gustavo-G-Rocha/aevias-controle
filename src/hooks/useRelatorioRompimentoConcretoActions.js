/**
 * Hook de ações para RelatorioRompimentoConcreto.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF).
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export const useRelatorioRompimentoConcretoActions = () => {
  return useReportPdfActions('relatorio-rompimento-concreto.pdf');
};