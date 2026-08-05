import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

const ALLOWED_FIELDS = new Set([
  'laboratorista_name', 'company', 'position', 'phone', 'crea_number',
  'is_active', 'access_level', 'supervisor_email',
]);

function accessLevel(user) {
  return user?.access_level || (user?.role === 'admin' ? 'admin' : 'user');
}

function roleFor(level) {
  return ['admin', 'sala_tecnica_afirmaevias', 'gestor_contrato', 'cliente_supervisor'].includes(level)
    ? 'admin'
    : 'user';
}

function includesEmail(values, email) {
  return (values || []).some((value) => String(value).toLowerCase() === email);
}

function managesRegional(regional, level, email) {
  if (level === 'sala_tecnica_afirmaevias') {
    return includesEmail(regional.salas_tecnicas_responsaveis, email);
  }
  if (level === 'gestor_contrato') {
    return includesEmail(regional.gestores_contrato_responsaveis, email)
      || String(regional.gestor_contrato_responsavel || '').toLowerCase() === email;
  }
  return false;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const actor = await base44.auth.me();
    if (!actor) return Response.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await req.json();
    const userId = typeof body?.userId === 'string' ? body.userId : '';
    const requestedData = body?.data;
    if (!userId || !requestedData || typeof requestedData !== 'object' || Array.isArray(requestedData)) {
      return Response.json({ error: 'Dados da atualização inválidos' }, { status: 400 });
    }

    const target = await base44.asServiceRole.entities.User.get(userId);
    if (!target) return Response.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const actorLevel = accessLevel(actor);
    const targetLevel = accessLevel(target);
    const actorEmail = String(actor.email || '').toLowerCase();
    const targetEmail = String(target.email || '').toLowerCase();
    let allowed = actorLevel === 'admin';

    if (!allowed && ['sala_tecnica_afirmaevias', 'gestor_contrato'].includes(actorLevel)) {
      const regionais = await base44.asServiceRole.entities.Regional.list();
      allowed = regionais.some((regional) =>
        managesRegional(regional, actorLevel, actorEmail)
        && includesEmail(regional.laboratoristas_responsaveis, targetEmail)
      );
      if (targetLevel !== 'user' || requestedData.access_level && requestedData.access_level !== 'user') {
        allowed = false;
      }
    }

    if (!allowed && actorLevel === 'cliente_supervisor') {
      allowed = targetLevel === 'funcionarios_cliente'
        && String(target.supervisor_email || '').toLowerCase() === actorEmail
        && (!requestedData.access_level || requestedData.access_level === 'funcionarios_cliente');
    }

    if (!allowed) {
      return Response.json({ error: 'Sem permissão para atualizar este usuário' }, { status: 403 });
    }

    const simpleFields = new Set([
      'laboratorista_name', 'company', 'position', 'phone', 'crea_number', 'is_active',
    ]);
    const editableFields = ['sala_tecnica_afirmaevias', 'gestor_contrato'].includes(actorLevel)
      ? simpleFields
      : ALLOWED_FIELDS;
    const updateData = {};
    for (const [key, value] of Object.entries(requestedData)) {
      if (!editableFields.has(key)) continue;
      if (typeof value === 'string') updateData[key] = value.trim();
      else if (key === 'is_active' && typeof value === 'boolean') updateData[key] = value;
    }

    const nextLevel = updateData.access_level || targetLevel;
    if (actorLevel !== 'admin' && nextLevel !== targetLevel) {
      return Response.json({ error: 'Você não pode alterar o nível de acesso deste usuário' }, { status: 403 });
    }
    updateData.role = roleFor(nextLevel);

    const updated = await base44.asServiceRole.entities.User.update(userId, updateData);
    return Response.json({ user: updated });
  } catch (error) {
    console.error('Falha ao atualizar usuário gerenciado:', error);
    return Response.json({ error: error?.message || 'Falha ao atualizar usuário' }, { status: 500 });
  }
}