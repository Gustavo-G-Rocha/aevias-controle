/**
 * reportPdfExport.js — Geração de PDF real (arquivo .pdf) a partir do
 * container do relatório, usando html2canvas + jsPDF.
 *
 * Substitui o window.print() que depende do diálogo de impressão do
 * navegador (problemático em mobile, onde nem sempre permite "Salvar
 * como PDF"). Aqui o PDF é gerado e baixado diretamente.
 */
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Captura o elemento do relatório e baixa um PDF A4 multi-página.
 * @param {HTMLElement} element Container do relatório (.report-content-container)
 * @param {string} fileName Nome do arquivo a baixar
 */
export async function generateReportPdf(element, fileName = 'relatorio.pdf') {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;   // A4 retrato (mm)
  const pageHeight = 297;
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const imgData = canvas.toDataURL('image/jpeg', 0.92);

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}