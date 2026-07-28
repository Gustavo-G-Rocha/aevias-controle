/**
 * reportPdfExport.js — Geração de PDF real (arquivo .pdf) a partir do
 * container do relatório, usando html2canvas + jsPDF.
 *
 * No desktop (PC) abre o diálogo "Salvar como" (File System Access API)
 * para o usuário escolher o local do arquivo; no celular mantém o
 * download direto.
 *
 * IMPORTANTE: showSaveFilePicker exige "transient activation" (gesto do
 * usuário recente). Como html2canvas leva segundos, o seletor DEVE ser
 * aberto ANTES da renderização — por isso acquireSaveTarget() roda no
 * início de generateReportPdf, ainda dentro do clique que disparou o botão.
 *
 * Duas estratégias de renderização:
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

const isMobileUA = () =>
  /Android|iPhone|iPad|iPod|Mobile|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);

const captureOptions = (el) => ({
  scale: 2,
  useCORS: true,
  backgroundColor: '#ffffff',
  logging: false,
  windowWidth: el.scrollWidth,
});

/**
 * Abre o "Salvar como" no desktop (ainda com ativação do clique) e devolve
 * o handle do arquivo, ou null para download direto, ou 'cancelled'.
 * Deve ser chamado ANTES de qualquer await longo.
 */
async function acquireSaveTarget(fileName) {
  if (isMobileUA() || typeof window.showSaveFilePicker !== 'function') {
    return null;
  }
  try {
    return await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }],
    });
  } catch (e) {
    if (e && e.name === 'AbortError') return 'cancelled';
    // Falha no picker — cai para download direto.
    return null;
  }
}

async function writeToHandle(pdf, handle) {
  const blob = pdf.output('blob');
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

/**
 * Uma página lógica por folha: encaixa a captura dentro da A4 preservando
 * a proporção (sem cortar) e centraliza o que sobrar.
 */
async function renderPagedPdf(pageElements) {
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

  return pdf;
}

/** Comportamento legado: imagem única fatiada em folhas de 297 mm. */
async function renderContinuousPdf(element) {
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

  return pdf;
}

/**
 * Captura o elemento do relatório e gera um PDF A4 multi-página.
 * No PC abre "Salvar como"; no celular faz download direto.
 * @param {HTMLElement} element Container do relatório (.report-content-container)
 * @param {string} fileName Nome sugerido do arquivo
 * @returns {'saved'|'cancelled'}
 */
export async function generateReportPdf(element, fileName = 'relatorio.pdf') {
  // 1) Adquire o destino do arquivo ANTES de qualquer await longo — a
  //    ativação do clique que disparou o botão expira após await's.
  const target = await acquireSaveTarget(fileName);
  if (target === 'cancelled') return 'cancelled';

  // 2) Gera o PDF (html2canvas + jsPDF).
  const pages = Array.from(element.querySelectorAll('[data-report-page]'));
  const pdf = pages.length > 0
    ? await renderPagedPdf(pages)
    : await renderContinuousPdf(element);

  // 3) Salva no destino escolhido (desktop) ou por download direto (mobile/fallback).
  if (target) {
    await writeToHandle(pdf, target);
  } else {
    pdf.save(fileName);
  }
  return 'saved';
}