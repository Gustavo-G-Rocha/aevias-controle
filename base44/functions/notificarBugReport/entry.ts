import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

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

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // O ID do BugReport vem exclusivamente do envelope do evento de
    // automação da entidade (event.entity_id / entity_id). Nunca
    // confiamos no objeto `data` do corpo — um chamador anônimo poderia
    // forjar um payload com conteúdo/assunto arbitrários e disparar
    // e-mails de phishing. Buscamos sempre o registro real no banco;
    // o e-mail reflete somente dados que passaram pelo fluxo de
    // criação protegido por RLS.
    const reportId = body?.event?.entity_id || body?.entity_id;

    if (!reportId) {
      return Response.json({ error: 'ID do bug report ausente' }, { status: 400 });
    }

    let bugReport;
    try {
      bugReport = await base44.asServiceRole.entities.BugReport.get(reportId);
    } catch {
      return Response.json({ error: 'Bug report não encontrado' }, { status: 404 });
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
}