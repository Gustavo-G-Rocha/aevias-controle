/**
 * Hook compartilhado para geração de PDF de relatórios.
 * Gera e baixa um PDF real (html2canvas + jsPDF) com estado de loading
 * (downloading) e toast de sucesso, em vez de depender do window.print().
 * O elemento capturado é o primeiro `.report-content-container` do DOM.
 *
 * Uso: const { handlePrint, downloading } = useReportPdfActions('nome.pdf');
 */
import { useCallback, useState } from 'react';
import { generateReportPdf } from '@/utils/reportPdfExport';
import { toast } from '@/components/ui/use-toast';

export function useReportPdfActions(filename) {
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
      const result = await generateReportPdf(element, filename);
      if (result !== 'cancelled') toast({ title: 'PDF baixado com sucesso!' });
    } catch (e) {
      toast({ title: 'Falha ao gerar PDF. Abrindo impressão.', variant: 'destructive' });
      // Atrasa o window.print() para o React renderizar o toast de erro
      // antes que o diálogo de impressão (síncrono/bloqueante) abra.
      setTimeout(() => window.print(), 300);
    } finally {
      setDownloading(false);
    }
  }, [downloading, filename]);

  return { handlePrint, downloading };
}