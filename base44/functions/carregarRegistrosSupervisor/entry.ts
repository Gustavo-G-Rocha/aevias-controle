import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

const ALL_RECORD_ENTITIES = [
  'DiarioObra',
  'EnsaioCAUQ',
  'EnsaioMRAF',
  'EnsaioDensidade',
  'EnsaioDensidadeInSitu',
  'EnsaioTaxaPinturaImprimacao',
  'ChecklistUsina',
  'ChecklistAplicacao',
  'ChecklistMRAF',
  'ChecklistConcretagem',
  'ChecklistTerraplanagem',
  'ChecklistReciclagem',
  'EnsaioSondagem',
  'EnsaioGranulometriaIndividual',
  'AcompanhamentoUsinagem',
  'AcompanhamentoCarga',
  'ControleExecucaoServicos',
  'EnsaioManchaPendulo',
  'EnsaioVigaBenkelman',
  'EnsaioTaxaMRAF',
  'BoletimSondagem',
  'BoletimSondagemTrado',
  'EnsaioProctor',
  'EnsaioRompimentoConcreto',
  'GranuMistura',
  'CertificacaoUsina',
  'EnsaioTaxaInsumos',
  'RegistroFresagemCBUQ',
];

// 500 registros/página × 6 páginas = até 3.000 registros por entidade.
// Cobertura: ~6 meses de registros diários mesmo em obras de alto volume
// (ex: DiarioObra com 5 obras × 180 dias = 900 registros — bem dentro do limite).
// O problema original era MAX_PAGES=20 (10k/entidade × 28 entidades = 280k)
// que causava timeout. 6 páginas × 3 rounds de 10 entidades paralelas
// = ~18 chamadas sequenciais no pior caso — dentro do timeout.
const PAGE_SIZE = 500;
const MAX_PAGES = 6;

async function loadEntityRecords(base44, entityType, query) {
  if (!query) return { records: [], truncated: false };
  const all = [];
  let skip = 0;
  let truncated = false;
  for (let page = 0; page < MAX_PAGES; page++) {
    const batch = await base44.entities[entityType].filter(query, '-created_date', PAGE_SIZE, skip);
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
    if (page === MAX_PAGES - 1 && batch.length === PAGE_SIZE) {
      truncated = true;
    }
  }
  return { records: all, truncated };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const accessLevel = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
    if (accessLevel !== 'cliente_supervisor' && accessLevel !== 'cliente') {
      return Response.json({ error: 'Apenas clientes e supervisores podem usar este endpoint' }, { status: 403 });
    }

    const userEmail = (user.email || '').toLowerCase();

    // Regionais vinculadas ao usuário (clientes_responsaveis OU supervisores_responsaveis)
    const regionais = await base44.asServiceRole.entities.Regional.list();
    const minhasRegionais = regionais.filter(r =>
      [...(r.clientes_responsaveis || []), ...(r.supervisores_responsaveis || [])]
        .some(e => e?.toLowerCase() === userEmail)
    );
    const regionaisIds = new Set(minhasRegionais.map(r => r.id));

    // Regionais onde ele é SUPERVISOR (poder de aprovação)
    const aprovaRegionaisIds = new Set(
      regionais
        .filter(r => (r.supervisores_responsaveis || []).some(e => e?.toLowerCase() === userEmail))
        .map(r => r.id)
    );

    // Demais lotes/regionais do MESMO cliente → visualização apenas (read-only)
    const meusClientes = new Set(
      minhasRegionais.map(r => (r.cliente || '').trim().toLowerCase()).filter(Boolean)
    );
    const escopoRegionaisIds = new Set(regionaisIds);
    regionais.forEach(r => {
      if (meusClientes.has((r.cliente || '').trim().toLowerCase())) escopoRegionaisIds.add(r.id);
    });

    // Obras do escopo (todas as regionais do cliente) e obras aprováveis
    const obras = await base44.asServiceRole.entities.Obra.list('-created_date', 1000);
    const obraIds = new Set(
      obras.filter(o => escopoRegionaisIds.has(o.regional_id)).map(o => o.id)
    );
    const obraIdsAprovaveis = new Set(
      obras.filter(o => aprovaRegionaisIds.has(o.regional_id)).map(o => o.id)
    );

    // Emails dos funcionarios_cliente subordinados
    const users = await base44.asServiceRole.entities.User.list();
    // Emails de staff da Afirma Evias (registros deles não são aprováveis pelo supervisor do cliente)
    const STAFF_LEVELS = new Set(['user', 'sala_tecnica_afirmaevias', 'gestor_contrato', 'admin']);
    const staffEmails = new Set(
      users
        .filter(u => STAFF_LEVELS.has(u.access_level || (u.role === 'admin' ? 'admin' : 'user')))
        .map(u => (u.email || '').toLowerCase())
    );
    const subordinateEmails = new Set(
      users
        .filter(u => u.access_level === 'funcionarios_cliente' && (u.supervisor_email || '').toLowerCase() === userEmail)
        .map(u => (u.email || '').toLowerCase())
        .filter(Boolean)
    );

    // Construir query de escopo: obras do mesmo cliente OU registros criados por subordinados.
    // O escopo é validado acima e a leitura elevada é necessária para que o RLS da sessão
    // não esconda os demais lotes que devem permanecer disponíveis somente para consulta.
    const obraIdsArray = [...obraIds];
    const subordinateEmailsArray = [...subordinateEmails];
    const orClauses = [];
    if (obraIdsArray.length > 0) orClauses.push({ obra_id: { $in: obraIdsArray } });
    if (subordinateEmailsArray.length > 0) orClauses.push({ created_by: { $in: subordinateEmailsArray } });
    const entityQuery = orClauses.length === 0
      ? null
      : orClauses.length === 1
        ? orClauses[0]
        : { $or: orClauses };

    if (!entityQuery) {
      return Response.json({
        records: [],
        obraIds: [...obraIds],
        subordinateEmails: [...subordinateEmails],
        approvableIds: [],
        truncated: false,
      });
    }

    const BATCH = 10;
    const allRecords = [];
    let anyTruncated = false;

    for (let i = 0; i < ALL_RECORD_ENTITIES.length; i += BATCH) {
      const batch = ALL_RECORD_ENTITIES.slice(i, i + BATCH);
      const settled = await Promise.allSettled(
        batch.map(type => loadEntityRecords(base44.asServiceRole, type, entityQuery))
      );
      settled.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          const type = batch[idx];
          for (const record of r.value.records) {
            allRecords.push({ ...record, entityType: type });
          }
          if (r.value.truncated) anyTruncated = true;
        }
      });
    }

    // Dedup por ID (filtro de escopo já aplicado na query)
    const seen = new Set();
    const deduped = allRecords.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    // IDs que o supervisor pode aprovar/reprovar: registros finalizados de obras
    // das regionais onde é supervisor e criados por pessoal do cliente (não staff).
    const approvableIds = deduped
      .filter(r =>
        r.status !== 'rascunho' &&
        obraIdsAprovaveis.has(r.obra_id) &&
        r.created_by &&
        !staffEmails.has(r.created_by.toLowerCase())
      )
      .map(r => r.id);

    return Response.json({
      records: deduped,
      obraIds: [...obraIds],
      subordinateEmails: [...subordinateEmails],
      approvableIds,
      truncated: anyTruncated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}