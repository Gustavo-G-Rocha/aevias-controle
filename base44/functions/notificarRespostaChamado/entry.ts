import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { sanitizeText } from '../../shared/backendCommon.ts';

/**
 * Backend function: notificarRespostaChamado
 *
 * Cria uma notificação in-app para o solicitante quando um admin responde
 * um BugReport (chamado). A resposta em si é gravada pelo frontend na
 * entidade BugReport (RLS permite admin); esta função apenas materializa
 * a notificação — Notificacao tem create: false no RLS, então só o
 * backend (service role) pode criar.
 *
 * Payload: { reportId }
 * Retorna:  { success: true } | { error }
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apenas admins respondem chamados — espelha o RLS de update do BugReport.
    const isAdmin = user.role === 'admin' || user.access_level === 'admin';
    if (!isAdmin) {
      return Response.json({ error: 'Apenas administradores podem notificar respostas de chamados' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { reportId } = body;
    if (!reportId || typeof reportId !== 'string') {
      return Response.json({ error: 'reportId é obrigatório' }, { status: 400 });
    }

    // Busca sempre o registro real — nunca confia em conteúdo do payload.
    let report;
    try {
      report = await base44.asServiceRole.entities.BugReport.get(reportId);
    } catch {
      return Response.json({ error: 'Chamado não encontrado' }, { status: 404 });
    }

    if (!report.resposta_admin) {
      return Response.json({ error: 'Chamado ainda sem resposta registrada' }, { status: 400 });
    }

    // Não notifica o próprio autor da resposta.
    if (!report.created_by || report.created_by === user.email) {
      return Response.json({ success: true, skipped: true });
    }

    const message = sanitizeText(String(report.resposta_admin)).slice(0, 500);

    // Se já existe notificação pendente deste chamado, atualiza a mensagem
    // em vez de acumular duplicatas.
    const existentes = await base44.asServiceRole.entities.Notificacao.filter(
      {
        user_email: report.created_by,
        entity_name: 'BugReport',
        entity_id: reportId,
        tipo: 'chamado_respondido',
        status: 'pendente',
      },
      '-created_date',
      1,
    );
    if (existentes && existentes.length > 0) {
      await base44.asServiceRole.entities.Notificacao.update(existentes[0].id, { message });
      return Response.json({ success: true, updated: true });
    }

    await base44.asServiceRole.entities.Notificacao.create({
      user_email: report.created_by,
      entity_name: 'BugReport',
      entity_id: reportId,
      tipo: 'chamado_respondido',
      message,
      status: 'pendente',
    });

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}