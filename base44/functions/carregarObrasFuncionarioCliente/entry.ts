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
    if (!user) return Response.json({ error: 'Unauthorized', errorCategory: 'auth' }, { status: 401 });

    const accessLevel = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
    if (accessLevel !== 'funcionarios_cliente') {
      return Response.json({ error: 'Apenas funcionários de cliente podem usar este endpoint', errorCategory: 'permission' }, { status: 403 });
    }

    // Se o token estiver defasado, o email pode estar vazio — sinaliza
    // para o frontend forçar reautenticação em vez de tratar como vazio.
    const emailLower = (user.email || '').toLowerCase();
    if (!emailLower) {
      console.warn('[carregarObrasFuncionarioCliente] Token sem email — possível sessão defasada.');
      return Response.json(
        { error: 'Sessão defasada. Faça login novamente.', errorCategory: 'auth' },
        { status: 401 }
      );
    }
    const supervisorLower = (user.supervisor_email || '').toLowerCase();
    const emails = new Set([emailLower]);
    if (supervisorLower) emails.add(supervisorLower);

    const regionais = await base44.asServiceRole.entities.Regional.list('-created_date', 200);
    const minhasRegionais = regionais.filter(r =>
      (r.clientes_responsaveis || []).some(e => emails.has((e || '').toLowerCase()))
    );
    const regionaisIds = minhasRegionais.map(r => r.id);

    // Diagnóstico: se nenhuma regional foi encontrada, registra no log para que
    // o admin possa identificar se é configuração faltante (email não vinculado)
    // ou token defasado. Antes era silencioso — o usuário via lista vazia sem
    // causa identificável.
    if (minhasRegionais.length === 0) {
      console.warn(
        `[carregarObrasFuncionarioCliente] Nenhuma regional encontrada para o usuário.`,
        { email: emailLower, supervisor_email: supervisorLower, totalRegionais: regionais.length }
      );
    }

    const obras = regionaisIds.length > 0
      ? await base44.asServiceRole.entities.Obra.filter(
          { regional_id: { $in: regionaisIds } },
          '-created_date',
          500
        )
      : [];

    // Sinaliza quando o resultado é vazio para o frontend distinguir
    // "sem acesso configurado" de erro de rede.
    const warning = minhasRegionais.length === 0
      ? 'Nenhuma regional vinculada ao seu email ou do seu supervisor. Verifique com o administrador.'
      : null;

    return Response.json({ regionais: minhasRegionais, obras, warning });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});