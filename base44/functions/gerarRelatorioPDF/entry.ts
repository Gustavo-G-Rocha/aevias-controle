import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';

// ─── Configuration ───────────────────────────────────────────────────────────

const ALLOWED_ACCESS_LEVELS = new Set([
  'admin',
  'sala_tecnica_afirmaevias',
  'gestor_contrato',
  'cliente',
]);

const ALLOWED_TIPOS = new Set([
  'AcompanhamentoCarga',
]);

const VALID_ID_REGEX = /^[a-zA-Z0-9\-_]{1,128}$/;

const DEFAULT_LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

const SERVICO_LABELS = {
  remendos: 'Remendos',
  capa_reperfilagem: 'Capa/Reperfilagem',
};

// ─── Pure helpers (ported from relatorioUtils.js) ────────────────────────────

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return 'N/A';
  }
}

function formatDateBrasilia(dateString) {
  if (!dateString) return 'N/A';
  let normalized = dateString;
  if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
    normalized = dateString + 'Z';
  }
  try {
    return new Date(normalized).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return 'N/A';
  }
}

function display(value, fallback = 'N/A') {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
}

function getServicoLabel(servico) {
  return SERVICO_LABELS[servico] || display(servico);
}

// ─── Data fetcher ────────────────────────────────────────────────────────────

async function fetchReportData(base44, tipo, id) {
  const acompanhamento = await base44.asServiceRole.entities.AcompanhamentoCarga.get(id);
  if (!acompanhamento) throw new Error('Registro não encontrado');

  let obra = null;
  let regional = null;
  let projeto = null;
  let faixaGranulometrica = null;

  if (acompanhamento.obra_id) {
    obra = await base44.asServiceRole.entities.Obra.get(acompanhamento.obra_id);
    if (obra?.regional_id) {
      regional = await base44.asServiceRole.entities.Regional.get(obra.regional_id);
    }
  }

  if (acompanhamento.project_id) {
    projeto = await base44.asServiceRole.entities.Project.get(acompanhamento.project_id);
    if (projeto?.faixa_granulometrica_id) {
      try {
        faixaGranulometrica = await base44.asServiceRole.entities.FaixaGranulometrica.get(projeto.faixa_granulometrica_id);
      } catch { /* faixa opcional */ }
    }
  }

  return { acompanhamento, obra, regional, projeto, faixaGranulometrica };
}

// ─── Presentation model mapper (ported from relatorioAcompanhamentoCargaMapper) ─

function mapAcompanhamentoToPresentation({ acompanhamento, obra, regional, projeto, faixaGranulometrica }) {
  return {
    cliente: display(regional?.cliente),
    rodovia: display(acompanhamento.rodovia),
    sub_trecho: display(acompanhamento.sub_trecho),
    projeto_nome: display(projeto?.name),
    servico_label: getServicoLabel(acompanhamento.servico),
    obra_nome: display(obra?.name),
    trecho: display(acompanhamento.trecho),
    usina_fornecedora: display(acompanhamento.usina_fornecedora),
    faixa_especificada: display(faixaGranulometrica?.nome),
    laboratorista: display(acompanhamento.laboratorista_name),
    data: formatDate(acompanhamento.data),
    cargas: (acompanhamento.cargas || []).map((carga, index) => ({
      numero: index + 1,
      placa: display(carga?.placa, ''),
      hora_saida: display(carga?.hora_saida, ''),
      peso_toneladas: display(carga?.peso_toneladas, ''),
      hora_chegada: display(carga?.hora_chegada, ''),
      temp_chegada: display(carga?.temp_chegada, ''),
      hora_aplicacao: display(carga?.hora_aplicacao, ''),
      temp_espalhamento: display(carga?.temp_espalhamento, ''),
      temp_compactacao: display(carga?.temp_compactacao, ''),
      pista: display(carga?.pista, ''),
      espessura_cm: display(carga?.espessura_cm, ''),
      estaca_inicial: display(carga?.estaca_inicial, ''),
      estaca_final: display(carga?.estaca_final, ''),
      observacoes: display(carga?.observacoes, ''),
    })),
    observacoes_gerais: display(acompanhamento.observacoes_gerais, '—'),
    logo_url: regional?.logo_url || DEFAULT_LOGO_URL,
    sig: {
      labName: display(acompanhamento.laboratorista_name, ''),
      labEmail: display(acompanhamento.created_by, ''),
      labCreatedDate: formatDateBrasilia(acompanhamento.created_date),
      approverName: display(acompanhamento.approver_details?.name, ''),
      approverEmail: display(acompanhamento.approved_by, ''),
      approverPosition: display(acompanhamento.approver_details?.position, ''),
      approverCREA: display(acompanhamento.approver_details?.crea_number, ''),
      approverDate: formatDateBrasilia(acompanhamento.approved_date),
      clientName: display(acompanhamento.client_signature?.engineer_name, ''),
      clientEmail: display(acompanhamento.client_signature?.signed_by, ''),
      clientCREA: display(acompanhamento.client_signature?.crea_number, ''),
      clientDate: formatDateBrasilia(acompanhamento.client_signature?.signed_date),
    },
  };
}

// ─── Image fetcher (logo → base64) ────────────────────────────────────────────

async function fetchImageAsBase64(url) {
  try {
    const resp = await fetch(url, { redirect: 'follow' });
    if (!resp.ok) return null;
    const contentType = resp.headers.get('content-type') || 'image/png';
    const buffer = await resp.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

// ─── PDF builder ──────────────────────────────────────────────────────────────

function buildPdf(data, logoBase64) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = 297;
  const pageH = 210;
  const margin = 8;
  let y = margin;

  // ── Header ──
  if (logoBase64) {
    try { doc.addImage(logoBase64, 'PNG', margin, y, 30, 12); } catch { /* skip logo */ }
  }
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Acompanhamento de Aplicação de CAUQ', pageW / 2, y + 6, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.data, pageW - margin - 4, y + 6, { align: 'right' });
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 14, pageW - margin, y + 14);
  y += 18;

  // ── Dados da Obra ──
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageW - 2 * margin, 5, 'F');
  doc.text('DADOS DA OBRA', pageW / 2, y + 3.5, { align: 'center' });
  y += 6;

  const obraFields = [
    { label: 'CLIENTE', value: data.cliente },
    { label: 'RODOVIA', value: data.rodovia },
    { label: 'SUB-TRECHO', value: data.sub_trecho },
    { label: 'Nº DO PROJETO', value: data.projeto_nome },
    { label: 'SERVIÇO', value: data.servico_label },
    { label: 'OBRA', value: data.obra_nome },
    { label: 'TRECHO', value: data.trecho },
    { label: 'USINA FORNECEDORA', value: data.usina_fornecedora },
    { label: 'FAIXA ESPECIFICADA', value: data.faixa_especificada },
    { label: 'LABORATORISTA', value: data.laboratorista },
  ];

  const colCount = 5;
  const colW = (pageW - 2 * margin) / colCount;
  const fieldH = 8;
  doc.setFontSize(6);

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < colCount; col++) {
      const idx = row * colCount + col;
      if (idx >= obraFields.length) break;
      const f = obraFields[idx];
      const x = margin + col * colW;

      doc.setFont('helvetica', 'bold');
      doc.text(f.label, x + 1, y + 3);
      doc.setFont('helvetica', 'normal');
      const valStr = String(f.value);
      const splitVal = doc.splitTextToSize(valStr, colW - 2);
      doc.text(splitVal[0] || '', x + 1, y + 6);

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);
      doc.rect(x, y, colW, fieldH);
    }
    y += fieldH;
  }
  y += 3;

  // ── Tabela de Cargas ──
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageW - 2 * margin, 5, 'F');
  doc.text('DADOS DA USINA / PISTA', pageW / 2, y + 3.5, { align: 'center' });
  y += 6;

  const headers = [
    'Nº', 'PLACA', 'H SAÍDA', 'PESO(t)', 'H CHEG', 'T CHEG(°C)',
    'H APLIC', 'T ESPAL(°C)', 'T COMP(°C)', 'PISTA', 'ESP(cm)', 'EST IN', 'EST FIN', 'OBSERVAÇÕES',
  ];
  // Column widths in % of available width
  const colPercents = [3, 6, 6, 5, 5, 6, 5, 6, 6, 5, 5, 5, 5, 32];
  const availW = pageW - 2 * margin;
  const colWidths = colPercents.map(p => (availW * p) / 100);

  // Header row
  doc.setFontSize(5);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(241, 245, 249);
  let xPos = margin;
  doc.rect(xPos, y, availW, 6, 'F');
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], xPos + colWidths[i] / 2, y + 4, { align: 'center' });
    xPos += colWidths[i];
  }
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.rect(margin, y, availW, 6);
  y += 6;

  // Data rows
  doc.setFont('helvetica', 'normal');
  const rowH = 5;
  for (let r = 0; r < data.cargas.length; r++) {
    const carga = data.cargas[r];
    if (y + rowH > pageH - margin - 30) {
      doc.addPage();
      y = margin;
    }

    if (r % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, availW, rowH, 'F');
    }

    const cells = [
      String(carga.numero),
      String(carga.placa),
      String(carga.hora_saida),
      String(carga.peso_toneladas),
      String(carga.hora_chegada),
      String(carga.temp_chegada),
      String(carga.hora_aplicacao),
      String(carga.temp_espalhamento),
      String(carga.temp_compactacao),
      String(carga.pista),
      String(carga.espessura_cm),
      String(carga.estaca_inicial),
      String(carga.estaca_final),
    ];

    xPos = margin;
    for (let i = 0; i < cells.length; i++) {
      doc.text(cells[i], xPos + colWidths[i] / 2, y + 3.5, { align: 'center' });
      xPos += colWidths[i];
    }
    // Observações (left-aligned)
    const obsText = doc.splitTextToSize(String(carga.observacoes), colWidths[13] - 1);
    doc.text(obsText[0] || '', xPos + 1, y + 3.5);

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.15);
    doc.rect(margin, y, availW, rowH);
    y += rowH;
  }
  y += 4;

  // ── Observações Gerais ──
  if (y + 16 > pageH - margin - 25) {
    doc.addPage();
    y = margin;
  }
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageW - 2 * margin, 5, 'F');
  doc.text('OBSERVAÇÃO GERAL', pageW / 2, y + 3.5, { align: 'center' });
  y += 6;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const obsLines = doc.splitTextToSize(String(data.observacoes_gerais), pageW - 2 * margin - 2);
  const obsBoxH = Math.max(12, obsLines.length * 3.5 + 2);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.rect(margin, y, pageW - 2 * margin, obsBoxH);
  doc.text(obsLines, margin + 1, y + 4);
  y += obsBoxH + 4;

  // ── Signature Footer ──
  if (y + 22 > pageH - margin) {
    doc.addPage();
    y = margin;
  }

  const sigColW = (pageW - 2 * margin) / 3;
  const sigY = pageH - margin - 20;

  function drawSigBlock(x, label, name, email, extra, date) {
    const centerX = x + sigColW / 2;
    if (name) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.text(name, centerX, sigY - 2, { align: 'center' });
    }
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    if (email) doc.text(email, centerX, sigY + 1, { align: 'center' });
    if (extra) doc.text(extra, centerX, sigY + 4, { align: 'center' });
    if (date) doc.text(`em ${date}`, centerX, sigY + 7, { align: 'center' });

    doc.setDrawColor(107, 114, 128);
    doc.setLineWidth(0.4);
    const lineW = sigColW * 0.75;
    doc.line(centerX - lineW / 2, sigY + 10, centerX + lineW / 2, sigY + 10);

    doc.setFont('helvetica', 'bold');
    doc.text(label, centerX, sigY + 13, { align: 'center' });
  }

  drawSigBlock(margin, 'LABORATORISTA', data.sig.labName, data.sig.labEmail, '', data.sig.labCreatedDate);
  drawSigBlock(margin + sigColW, 'RESPONSÁVEL', data.sig.approverName, data.sig.approverEmail, data.sig.approverCREA ? `CREA: ${data.sig.approverCREA}` : '', data.sig.approverDate);
  drawSigBlock(margin + 2 * sigColW, 'CLIENTE', data.sig.clientName, data.sig.clientEmail, data.sig.clientCREA ? `CREA: ${data.sig.clientCREA}` : '', data.sig.clientDate);

  return doc;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessLevel = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
    if (!ALLOWED_ACCESS_LEVELS.has(accessLevel)) {
      return Response.json({ error: 'Sem permissão para gerar relatórios' }, { status: 403 });
    }

    const body = await req.json();
    const { tipo, id } = body;

    if (!tipo || !ALLOWED_TIPOS.has(tipo)) {
      return Response.json({ error: `Tipo de relatório não suportado: "${tipo}"` }, { status: 400 });
    }
    if (!id || !VALID_ID_REGEX.test(String(id))) {
      return Response.json({ error: 'ID inválido' }, { status: 400 });
    }

    console.log(`📄 Gerando PDF server-side: tipo=${tipo}, id=${id}`);

    const { acompanhamento, obra, regional, projeto, faixaGranulometrica } = await fetchReportData(base44, tipo, id);
    const data = mapAcompanhamentoToPresentation({ acompanhamento, obra, regional, projeto, faixaGranulometrica });

    const logoBase64 = await fetchImageAsBase64(data.logo_url);
    const doc = buildPdf(data, logoBase64);

    const pdfBytes = doc.output('arraybuffer');
    const fileName = `acompanhamento_carga_${data.data.replace(/\//g, '-')}.pdf`;

    console.log(`✅ PDF gerado: ${fileName} (${pdfBytes.byteLength} bytes)`);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(pdfBytes.byteLength),
      },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ Erro ao gerar PDF:', msg);
    return Response.json({ error: 'Erro ao gerar PDF', details: msg }, { status: 500 });
  }
});