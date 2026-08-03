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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const accessLevel = user.access_level || (user.role === 'admin' ? 'admin' : 'user');
    if (accessLevel !== 'cliente_supervisor' && accessLevel !== 'cliente') {
      return Response.json({ error: 'Apenas clientes e supervisores podem usar este endpoint' }, { status: 403 });
    }

    const userEmail = (user.email || '').toLowerCase();

    // Regionais onde o usuário está em clientes_responsaveis OU supervisores_responsaveis
    // Usa o contexto do próprio usuário (RLS filtra apenas suas regionais)
    const regionais = await base44.entities.Regional.list();
    const supervisorRegionais = regionais.filter(r =>
      [...(r.clientes_responsaveis || []), ...(r.supervisores_responsaveis || [])]
        .some(e => e?.toLowerCase() === userEmail)
    );
    const regionaisIds = new Set(supervisorRegionais.map(r => r.id));

    // Obras das regionais do supervisor (RLS aplicada sob o contexto do usuário)
    const obras = await base44.entities.Obra.list('-created_date', 500);
    const obraIds = new Set(
      obras.filter(o => regionaisIds.has(o.regional_id)).map(o => o.id)
    );

    // Emails dos funcionarios_cliente subordinados
    const users = await base44.asServiceRole.entities.User.list();
    const subordinateEmails = new Set(
      users
        .filter(u => u.access_level === 'funcionarios_cliente' && (u.supervisor_email || '').toLowerCase() === userEmail)
        .map(u => (u.email || '').toLowerCase())
        .filter(Boolean)
    );

    // Construir query de escopo: obras do supervisor OU registros criados por subordinados.
    // O filtro é aplicado na query do SDK (nível do banco) sob o contexto do próprio usuário,
    // aplicando RLS nativa sem elevar privilégios com asServiceRole.
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
      });
    }

    const BATCH = 10;
    const allRecords = [];
    let anyTruncated = false;

    for (let i = 0; i < ALL_RECORD_ENTITIES.length; i += BATCH) {
      const batch = ALL_RECORD_ENTITIES.slice(i, i + BATCH);
      const settled = await Promise.allSettled(
        batch.map(type => loadEntityRecords(base44, type, entityQuery))
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

    return Response.json({
      records: deduped,
      obraIds: [...obraIds],
      subordinateEmails: [...subordinateEmails],
      truncated: anyTruncated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});