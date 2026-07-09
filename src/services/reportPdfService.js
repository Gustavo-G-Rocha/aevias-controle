/**
 * Serviço para geração server-side de PDFs de relatório.
 *
 * Usa `base44.functions.fetch()` para obter a resposta binária (PDF)
 * diretamente do backend function, sem depender de jspdf/html2canvas
 * no browser do usuário.
 *
 * Fluxo:
 * 1. Frontend chama generateReportPdf(tipo, id)
 * 2. Backend (gerarRelatorioPDF) busca dados, mapeia e gera PDF estruturado
 * 3. Frontend recebe blob e inicia download automático
 *
 * Se o tipo de relatório ainda não tiver implementação server-side,
 * a função lança erro e o chamador deve fazer fallback para window.print().
 */

import { base44 } from '@/api/base44Client';
import { logger } from '@/utils/logger';

/**
 * Tipos de relatório que já possuem implementação server-side.
 * Relatórios fora desta lista continuam usando window.print().
 */
export const SERVER_SIDE_REPORTS = new Set([
  'AcompanhamentoCarga',
]);

/**
 * Verifica se um tipo de relatório já suporta geração server-side.
 * @param {string} tipo - Tipo da entidade (ex: 'AcompanhamentoCarga')
 * @returns {boolean}
 */
export function isServerSideReport(tipo) {
  return SERVER_SIDE_REPORTS.has(tipo);
}

/**
 * Gera e baixa um PDF de relatório via backend.
 *
 * @param {string} tipo - Tipo da entidade (ex: 'AcompanhamentoCarga')
 * @param {string} id - ID do registro
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function generateReportPdf(tipo, id) {
  if (!isServerSideReport(tipo)) {
    return { success: false, error: `Relatório "${tipo}" ainda não suporta geração server-side` };
  }

  try {
    const response = await base44.functions.fetch('/gerarRelatorioPDF', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, id }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${tipo}_${id.substring(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    logger.error('Erro ao gerar PDF server-side:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}