/**
 * Hook de ações para RelatorioUnificado.
 * Exporta handlers de navegação e impressão.
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useRelatorioUnificadoActions() {
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => {
    navigate('/RelatoriosUnificados');
  }, [navigate]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return { handleGoBack, handlePrint };
}