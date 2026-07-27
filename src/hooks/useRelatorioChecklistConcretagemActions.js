/**
 * Hook de ações para RelatorioChecklistConcretagem.
 * Gera e baixa um arquivo PDF real (html2canvas + jsPDF) em vez de
 * depender do diálogo de impressão do navegador.
 */
import { useCallback, useState } from 'react';
import { generateReportPdf } from '@/utils/reportPdfExport';
import { toast } from '@/components/ui/use-toast';

export function useRelatorioChecklistConcretagemActions() {
  const [downloading, setDownloading] = useState(false);

  const handlePrint = useCallback(async () => {
    const element = document.querySelector('.report-content-container');
    if (!element) {
      window.print();
      return;
    }
    if (downloading) return;
    setDownloading(true);
    try {
      await generateReportPdf(element, 'relatorio-checklist-concretagem.pdf');
      toast({ title: 'PDF baixado com sucesso!' });
    } catch (e) {
      toast({ title: 'Falha ao gerar PDF. Abrindo impressão.', variant: 'destructive' });
      window.print();
    } finally {
      setDownloading(false);
    }
  }, [downloading]);

  return { handlePrint, downloading };
}