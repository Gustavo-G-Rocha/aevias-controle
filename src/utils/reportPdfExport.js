/**
 * reportPdfExport.js — Geração de PDF real (arquivo .pdf) a partir do
 * container do relatório, usando html2canvas + jsPDF.
 *
 * Substitui o window.print() que depende do diálogo de impressão do
 * navegador (problemático em mobile, onde nem sempre permite "Salvar
 * como PDF"). Aqui o PDF é gerado e baixado diretamente.
 *
 * O container é capturado em uma única canvas alta e depois fatiada em
 * páginas A4. As fatias respeitam os limites reais das quebras de página
 * (elementos .break-before-page) para que o cabeçalho de cada bloco
 * (ex.: "Relatório Fotográfico") inicie sempre no topo de uma nova página,
 * em vez de aparecer no meio da folha.
 */
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PAGE_WIDTH_MM = 210;   // A4 retrato
const PAGE_HEIGHT_MM = 297;

/**
 * Coleta as posições (em px CSS, relativas ao topo de `element`) onde
 * começam as quebras de página marcadas com .break-before-page.
 * Retorna um array ordenado e sem duplicatas, já incluindo 0 (topo).
 */
function collectPageBoundaries(element) {
  const containerRect = element.getBoundingClientRect();
  const breaks = Array.from(element.querySelectorAll('.break-before-page'));
  const offsets = breaks
    .map((el) => {
      const r = el.getBoundingClientRect();
      return r.top - containerRect.top;
    })
    .filter((v) => v > 1) // ignora o topo e ruído de subpixel
    .sort((a, b) => a - b);
  // remove duplicatas próximas (mesma quebra em elementos aninhados)
  const deduped = [];
  for (const v of offsets) {
    if (!deduped.length || v - deduped[deduped.length - 1] > 5) deduped.push(v);
  }
  return [0, ...deduped];
}

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

  // Relação entre px da canvas e mm (horizontal: largura da canvas = 210mm).
  const mmPerCanvasPx = PAGE_WIDTH_MM / canvas.width;
  const pageHeightCanvasPx = PAGE_HEIGHT_MM / mmPerCanvasPx;

  const boundariesCssPx = collectPageBoundaries(element);
  const scale = canvas.width / element.scrollWidth; // canvas px por CSS px
  const boundariesCanvasPx = boundariesCssPx.map((y) => Math.round(y * scale));
  const totalHeight = canvas.height;

  // Garante o limite final.
  if (boundariesCanvasPx[boundariesCanvasPx.length - 1] < totalHeight) {
    boundariesCanvasPx.push(totalHeight);
  }

  let firstPage = true;

  for (let i = 0; i < boundariesCanvasPx.length - 1; i++) {
    let start = boundariesCanvasPx[i];
    const end = boundariesCanvasPx[i + 1];

    // Cada bloco de quebra começa no topo de uma nova página A4. Se o bloco
    // for mais alto que uma página, continua fatiando em altura de A4.
    while (start < end) {
      const sliceHeight = Math.min(pageHeightCanvasPx, end - start);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const ctx = slice.getContext('2d');
      ctx.drawImage(
        canvas,
        0, start, canvas.width, sliceHeight, // origem
        0, 0, canvas.width, sliceHeight       // destino
      );

      const imgData = slice.toDataURL('image/jpeg', 0.92);
      const sliceHeightMm = sliceHeight * mmPerCanvasPx;

      if (!firstPage) pdf.addPage();
      // Centraliza verticalmente o conteúdo menor que A4 dentro da folha.
      const offsetY = Math.max(0, (PAGE_HEIGHT_MM - sliceHeightMm) / 2);
      pdf.addImage(imgData, 'JPEG', 0, offsetY, PAGE_WIDTH_MM, sliceHeightMm);
      firstPage = false;

      start += sliceHeight;
    }
  }

  pdf.save(fileName);
}