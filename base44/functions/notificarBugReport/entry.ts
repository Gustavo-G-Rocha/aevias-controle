import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

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

    const solicitante = bugReport.created_by || 'Usuário não identificado';
    const prints = bugReport.prints || [];
    const printsHtml = prints.length > 0
      ? prints.map((url) => `<img src="${url}" style="max-width:300px;margin:5px;border:1px solid #ccc;" />`).join("")
      : "<p>Nenhum print anexado.</p>";

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: "gustavo.rocha@afirmaevias.com.br",
      subject: `Novo relato de erro — ${bugReport.pagina || 'Página não informada'}`,
      body: `
        <h2>Novo relato de erro</h2>
        <p><strong>Solicitante:</strong> ${solicitante}</p>
        <p><strong>Página:</strong> ${bugReport.pagina || '—'}</p>
        <p><strong>Descrição:</strong></p>
        <p style="white-space:pre-wrap;">${bugReport.descricao || ''}</p>
        <h3>Prints:</h3>
        ${printsHtml}
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});