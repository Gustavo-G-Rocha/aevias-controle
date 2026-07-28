/**
 * reportPdfExport.js — Geração de PDF real (arquivo .pdf) a partir do
 * container do relatório, usando html2canvas + jsPDF.
 *
 * Substitui o window.print() que depende do diálogo de impressão do
 * navegador (problemático em mobile, onde nem sempre permite "Salvar
 * como PDF"). Aqui o PDF é gerado e baixado diretamente.
 *
 * Duas estratégias:
 *  1) Se o relatório marcar suas páginas lógicas com [data-report-page],
 *     cada página é capturada separadamente e ocupa exatamente uma folha
 *     A4 — nada fica cortado no meio nem espalhado entre duas folhas.
 *  2) Caso contrário, mantém o comportamento antigo (imagem única fatiada
 *     a cada 297 mm), para não alterar relatórios ainda não marcados.
 */
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PAGE_WIDTH = 210;   // A4 retrato (mm)
const PAGE_HEIGHT = 297;

/**
 * No desktop (PC), abre o diálogo "Salvar como" para o usuário escolher o
 * local do arquivo (File System Access API). No celular mantém o download
 * direto — não há API equivalente e o fluxo direto é o esperado.
 * AbortError = usuário cancelou; nada a fazer.
 */
async function savePdf(pdf, fileName) {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);
  if (!isMobile && typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }],
      });
      const blob = pdf.output('blob');
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return 'saved';
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelled';
      // Falha no picker — cai para download direto.
    }
  }
  pdf.save(fileName);
  return 'saved';
}

const captureOptions = (el) => ({
  scale: 2,
  useCORS: true,
  backgroundColor: '#ffffff',
  logging: false,
  windowWidth: el.scrollWidth,
});

/**
 * Uma página lógica por folha: encaixa a captura dentro da A4 preservando
 * a proporção (sem cortar) e centraliza o que sobrar.
 */
async function renderPagedPdf(pageElements, fileName) {
  const pdf = new jsPDF('p', 'mm', 'a4');

  for (let i = 0; i < pageElements.length; i++) {
    const canvas = await html2canvas(pageElements[i], captureOptions(pageElements[i]));
    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    // Escala que faz a captura caber inteira na folha (largura e altura).
    const ratio = Math.min(PAGE_WIDTH / canvas.width, PAGE_HEIGHT / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const offsetX = (PAGE_WIDTH - imgWidth) / 2;
    const offsetY = imgHeight >= PAGE_HEIGHT ? 0 : 0; // conteúdo alinhado ao topo

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, imgWidth, imgHeight);
  }

  return await savePdf(pdf, fileName);
}

/** Comportamento legado: imagem única fatiada em folhas de 297 mm. */
async function renderContinuousPdf(element, fileName) {
  const canvas = await html2canvas(element, captureOptions(element));
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = PAGE_WIDTH;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL('image/jpeg', 0.92);

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= PAGE_HEIGHT;

  while (heightLeft > 0) {
    position -= PAGE_HEIGHT;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= PAGE_HEIGHT;
  }

  return await savePdf(pdf, fileName);
}

/**
 * Captura o elemento do relatório e baixa um PDF A4 multi-página.
 * @param {HTMLElement} element Container do relatório (.report-content-container)
 * @param {string} fileName Nome do arquivo a baixar
 */
export async function generateReportPdf(element, fileName = 'relatorio.pdf') {
  const pages = Array.from(element.querySelectorAll('[data-report-page]'));
  if (pages.length > 0) {
    return await renderPagedPdf(pages, fileName);
  }
  return await renderContinuousPdf(element, fileName);
}