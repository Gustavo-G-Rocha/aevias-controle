/**
 * Shared: criação e limpeza de notificações in-app (entidade Notificacao).
 *
 * Usado por assinarEletronicamente (criar "assinatura_pendente" após
 * aprovação) e gerenciarAprovacao (limpar pendências quando o documento
 * é assinado). Todas as funções são não-bloqueantes: falhas de
 * notificação nunca devem quebrar a operação principal.
 */

/**
 * Marca como lidas todas as notificações pendentes de um tipo para um
 * registro específico — para TODOS os destinatários. Usado quando a ação
 * esperada (ex: assinar) foi concluída e a pendência deixou de existir.
 */
export async function marcarNotificacoesLidas(
  base44: any,
  entityName: string,
  recordId: string,
  tipo: string,
): Promise<void> {
  try {
    const pendentes = await base44.asServiceRole.entities.Notificacao.filter(
      { entity_name: entityName, entity_id: recordId, tipo, status: 'pendente' },
      '-created_date',
      50,
    );
    for (const n of pendentes || []) {
      await base44.asServiceRole.entities.Notificacao.update(n.id, { status: 'lida' });
    }
  } catch (e: any) {
    console.error('[notificacoes] Erro ao marcar lidas:', e?.message);
  }
}

/**
 * Notifica os clientes responsáveis da regional de que um documento
 * aprovado aguarda assinatura. Resolve a cadeia registro → obra →
 * regional → clientes_responsaveis. Não duplica notificações pendentes.
 */
export async function notificarAssinaturaPendente(
  base44: any,
  entityName: string,
  recordId: string,
  record: any,
  actorEmail: string,
): Promise<void> {
  try {
    if (!record?.obra_id) return;
    const obra = await base44.asServiceRole.entities.Obra.get(record.obra_id);
    if (!obra?.regional_id) return;
    const regional = await base44.asServiceRole.entities.Regional.get(obra.regional_id);
    const actor = (actorEmail || '').toLowerCase();
    const destinatarios = [...new Set(
      (regional?.clientes_responsaveis || [])
        .filter((e: string) => e && e.toLowerCase() !== actor)
    )];
    for (const email of destinatarios) {
      const existentes = await base44.asServiceRole.entities.Notificacao.filter(
        {
          user_email: email,
          entity_name: entityName,
          entity_id: recordId,
          tipo: 'assinatura_pendente',
          status: 'pendente',
        },
        '-created_date',
        1,
      );
      if (existentes && existentes.length > 0) continue;
      await base44.asServiceRole.entities.Notificacao.create({
        user_email: email,
        entity_name: entityName,
        entity_id: recordId,
        tipo: 'assinatura_pendente',
        message: 'Documento aprovado aguardando sua assinatura.',
        status: 'pendente',
      });
    }
  } catch (e: any) {
    console.error('[notificacoes] Erro ao notificar assinatura pendente:', e?.message);
  }
}