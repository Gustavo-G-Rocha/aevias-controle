import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/** Escapa caracteres HTML para impedir injeção de markup no corpo do e-mail. */
function escapeHtml(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Valida URL de print — aceita apenas http(s) e evita javascript:/data: schemes. */
function safeImageUrl(url: unknown): string | null {
  if (typeof url !== 'string' || !url) return null;
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Automação de entidade envia: { event, data, old_data, payload_too_large }
    const report = body?.data || null;
    const reportId = body?.event?.entity_id || body?.entity_id || report?.id;

    let bugReport = report;
    if (!bugReport && reportId) {
      bugReport = await base44.asServiceRole.entities.BugReport.get(reportId);
    }
    if (!bugReport) {
      return Response.json({ error: 'Sem dados do bug report' }, { status: 400 });
    }

    const solicitante = escapeHtml(bugReport.created_by || 'Usuário não identificado');
    const pagina = escapeHtml(bugReport.pagina || '—');
    const descricao = escapeHtml(bugReport.descricao || '');
    const prints = (bugReport.prints || [])
      .map(safeImageUrl)
      .filter((u): u is string => u !== null);
    const printsHtml = prints.length > 0
      ? prints.map((url) => `<img src="${escapeHtml(url)}" style="max-width:300px;margin:5px;border:1px solid #ccc;" />`).join("")
      : "<p>Nenhum print anexado.</p>";

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: "gustavo.rocha@afirmaevias.com.br",
      subject: `Novo relato de erro — ${pagina}`,
      body: `
        <h2>Novo relato de erro</h2>
        <p><strong>Solicitante:</strong> ${solicitante}</p>
        <p><strong>Página:</strong> ${pagina}</p>
        <p><strong>Descrição:</strong></p>
        <p style="white-space:pre-wrap;">${descricao}</p>
        <h3>Prints:</h3>
        ${printsHtml}
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});