import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Retorna as regionais e obras do funcionário de cliente (inspetor).
// Escopo aplicado server-side: apenas regionais onde o próprio email
// ou o do supervisor está em clientes_responsaveis, e as obras dessas
// regionais (filtro por regional_id direto na query — sem trazer dados
// de outros inquilinos para a memória).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const accessLevel = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
    if (accessLevel !== 'funcionarios_cliente') {
      return Response.json({ error: 'Apenas funcionários de cliente podem usar este endpoint' }, { status: 403 });
    }

    const emailLower = (user.email || '').toLowerCase();
    const supervisorLower = (user.supervisor_email || '').toLowerCase();
    const emails = new Set([emailLower]);
    if (supervisorLower) emails.add(supervisorLower);

    const regionais = await base44.asServiceRole.entities.Regional.list('-created_date', 200);
    const minhasRegionais = regionais.filter(r =>
      (r.clientes_responsaveis || []).some(e => emails.has((e || '').toLowerCase()))
    );
    const regionaisIds = minhasRegionais.map(r => r.id);

    const obras = regionaisIds.length > 0
      ? await base44.asServiceRole.entities.Obra.filter(
          { regional_id: { $in: regionaisIds } },
          '-created_date',
          500
        )
      : [];

    return Response.json({ regionais: minhasRegionais, obras });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});