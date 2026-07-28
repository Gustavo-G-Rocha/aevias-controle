/**
 * Hook de ações para RelatorioDiario.
 * Delega para o hook compartilhado de PDF (html2canvas + jsPDF), que no PC
 * abre o diálogo "Salvar como" e no celular baixa direto.
 */
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export function useRelatorioDiarioActions() {
  return useReportPdfActions('relatorio-diario-obra.pdf');
}