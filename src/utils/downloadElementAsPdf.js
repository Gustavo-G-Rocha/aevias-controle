import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Gera um PDF A4 idêntico ao elemento renderizado na tela (rasteriza o DOM).
 * O elemento é temporariamente ajustado para a proporção A4 antes da captura.
 */
export async function downloadElementAsPdf(element, fileName) {
  const root = element.querySelector('[data-report-root]') || element;

  // Força a proporção A4 (297/210) para a assinatura ir ao rodapé da folha
  const a4Height = Math.round(element.offsetWidth * (297 / 210));
  const prevMinHeight = root.style.minHeight;
  root.style.minHeight = `${a4Height}px`;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const imgH = (canvas.height * pageW) / canvas.width;

    if (imgH <= pageH + 1) {
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageW, imgH);
    } else {
      // Conteúdo maior que uma folha: fatia o canvas em páginas A4
      const pageHeightPx = Math.floor((canvas.width * pageH) / pageW);
      let offset = 0;
      let first = true;
      while (offset < canvas.height) {
        const sliceH = Math.min(pageHeightPx, canvas.height - offset);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sliceH;
        slice.getContext('2d').drawImage(canvas, 0, offset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        if (!first) pdf.addPage();
        pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageW, (sliceH * pageW) / canvas.width);
        first = false;
        offset += sliceH;
      }
    }

    pdf.save(fileName);
  } finally {
    root.style.minHeight = prevMinHeight;
  }
}