/**
 * Hook de ações para RelatorioUnificado.
 * Navegação + geração de PDF via hook compartilhado (no PC abre "Salvar
 * como"; no celular baixa direto).
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReportPdfActions } from '@/hooks/useReportPdfActions';

export function useRelatorioUnificadoActions() {
  const navigate = useNavigate();
  const { handlePrint, downloading } = useReportPdfActions('relatorio-unificado.pdf');

  const handleGoBack = useCallback(() => {
    navigate('/RelatoriosUnificados');
  }, [navigate]);

  return { handleGoBack, handlePrint, downloading };
}