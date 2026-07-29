/**
 * bulkExportZip.js — Geração de ZIP com um PDF por relatório selecionado.
 *
 * Para cada ensaio selecionado, abre a página de relatório em um iframe
 * oculto, aguarda a renderização do container (.report-content-container
 * ou [data-print-container]), captura com html2canvas e gera um PDF A4
 * multi-página com jsPDF. Todos os PDFs são empacotados em um .zip via
 * JSZip e baixados automaticamente.
 */
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PAGE_WIDTH = 210;   // A4 retrato (mm)
const PAGE_HEIGHT = 297;

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9_\-\s]/g, '_').substring(0, 150).trim();
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function waitForElement(doc, selector, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const el = doc.querySelector(selector);
      if (el && el.offsetWidth > 0) return resolve(el);
      if (Date.now() - start > timeout) return reject(new Error('Timeout ao carregar relatório'));
      setTimeout(check, 300);
    };
    check();
  });
}

async function captureReportAsPdf(reportUrl) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:-9999px;top:0;width:1280px;height:900px;opacity:0;border:none;';
    iframe.setAttribute('aria-hidden', 'true');

    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        if (iframe.parentNode) document.body.removeChild(iframe);
        reject(new Error('Timeout ao carregar relatório'));
      }
    }, 45000);

    iframe.onload = async () => {
      if (settled) return;
      try {
        const doc = iframe.contentDocument;
        if (!doc) throw new Error('Sem acesso ao documento do iframe');

        // Verifica se foi redirecionado para login
        const bodyHtml = doc.body?.innerHTML || '';
        if (/report-content-container|data-print-container/.test(bodyHtml) === false &&
            /entrar|login|esqueci/i.test(doc.body?.textContent?.substring(0, 800) || '')) {
          throw new Error('Redirecionado para login');
        }

        const container = await waitForElement(doc, '.report-content-container, [data-print-container]');

        // Aguarda imagens e fontes carregarem
        await new Promise(r => setTimeout(r, 1500));

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: container.scrollWidth,
        });

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

        settled = true;
        clearTimeout(timeout);
        if (iframe.parentNode) document.body.removeChild(iframe);
        resolve(pdf.output('blob'));
      } catch (err) {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          if (iframe.parentNode) document.body.removeChild(iframe);
          reject(err);
        }
      }
    };

    iframe.src = reportUrl;
    document.body.appendChild(iframe);
  });
}

/**
 * Gera um ZIP com um PDF por ensaio selecionado.
 * @param {Array<{id: string, name: string, reportUrl: string}>} selectedEnsaios
 * @param {(progress: string|null) => void} [onProgress]
 * @returns {Promise<{success: number, errors: string[]}>}
 */
export async function bulkExportReports(selectedEnsaios, onProgress) {
  if (!selectedEnsaios || selectedEnsaios.length === 0) return { success: 0, errors: [] };

  const zip = new JSZip();
  const errors = [];
  let successCount = 0;

  for (let i = 0; i < selectedEnsaios.length; i++) {
    const ensaio = selectedEnsaios[i];
    onProgress?.(`Gerando PDF ${i + 1} de ${selectedEnsaios.length}...`);

    try {
      const pdfBlob = await captureReportAsPdf(ensaio.reportUrl);
      const fileName = sanitizeFileName(ensaio.name) + '_' + ensaio.id.substring(0, 8) + '.pdf';
      zip.file(fileName, pdfBlob);
      successCount++;
    } catch (err) {
      console.error(`Erro ao gerar PDF para ${ensaio.name}:`, err);
      errors.push(`${ensaio.name}: ${err.message || 'Erro desconhecido'}`);
    }
  }

  if (successCount === 0) {
    onProgress?.(null);
    throw new Error('Não foi possível gerar nenhum PDF. ' + errors.join('; '));
  }

  onProgress?.('Compactando arquivos...');
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const timestamp = new Date().toISOString().split('T')[0];
  downloadBlob(zipBlob, `relatorios_${timestamp}.zip`);

  onProgress?.(null);
  return { success: successCount, errors };
}