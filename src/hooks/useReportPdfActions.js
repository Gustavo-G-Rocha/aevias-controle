/**
 * Hook compartilhado das ações de impressão dos relatórios.
 *
 * Usa a impressão nativa do navegador (window.print()): o usuário escolhe
 * a impressora ou "Salvar como PDF", com opção de local e nome do arquivo.
 *
 * Uso: const { handlePrint, downloading } = useReportPdfActions();
 * (`downloading` é mantido por compatibilidade com os botões existentes.)
 */
import { useCallback } from 'react';

export function useReportPdfActions() {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handlePrint, downloading: false };
}