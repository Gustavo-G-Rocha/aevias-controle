import fs from 'fs';
import { execSync } from 'child_process';

/**
 * e2e/mock-api.js
 *
 * Servidor mock em memória que intercepta TODAS as chamadas HTTP do SDK Base44
 * via page.route(). Substitui o backend real — não precisa de autenticação,
 * não depende de rede, é 100% determinístico.
 *
 * Padrões interceptados (conforme @base44/sdk):
 *   GET  /api/apps/{appId}/entities/{entity}          → list / filter
 *   GET  /api/apps/{appId}/entities/{entity}/{id}     → get
 *   POST /api/apps/{appId}/entities/{entity}          → create
 *   PUT  /api/apps/{appId}/entities/{entity}/{id}     → update
 *   DELETE /api/apps/{appId}/entities/{entity}/{id}   → delete
 *   GET  /api/apps/{appId}/entities/User/me           → auth.me()
 *   POST /api/apps/{appId}/functions/{func}          → function invoke
 *   GET  /api/apps/public/prod/public-settings/by-id  → AuthContext bootstrap
 *
 * O store é um Map<entityName, Map<id, record>> resetado a cada teste.
 */

// ── Usuários de teste ─────────────────────────────────────────────────────────
const ADMIN_USER = {
  id: 'user-admin-1',
  email: 'admin@e2e.test',
  full_name: 'Admin E2E',
  laboratorista_name: 'Admin E2E',
  role: 'admin',
  access_level: 'admin',
  crea_number: 'CREA-E2E-001',
  created_date: '2026-07-08T08:00:00.000Z',
};

const GESTOR_USER = {
  id: 'user-gestor-1',
  email: 'gestor@e2e.test',
  full_name: 'Eng. Gestor',
  laboratorista_name: 'Eng. Gestor',
  role: 'user',
  access_level: 'gestor_contrato',
  crea_number: 'CREA-E2E-002',
  created_date: '2026-07-08T08:00:00.000Z',
};

const CLIENTE_USER = {
  id: 'user-cliente-1',
  email: 'cliente@e2e.test',
  full_name: 'Eng. Cliente',
  laboratorista_name: 'Eng. Cliente',
  role: 'user',
  access_level: 'cliente',
  crea_number: 'CREA-E2E-003',
  created_date: '2026-07-08T08:00:00.000Z',
};

// ── Dados seed ────────────────────────────────────────────────────────────────
const SEED_REGIONAL = {
  id: 'regional-1',
  name: 'Regional E2E',
  laboratoristas_responsaveis: [ADMIN_USER.email],
  salas_tecnicas_responsaveis: [],
  project_ids: ['project-1'],
  created_date: '2026-07-08T08:00:00.000Z',
  updated_date: '2026-07-08T08:00:00.000Z',
};

const SEED_OBRA = {
  id: 'obra-1',
  name: 'Obra E2E Teste',
  code: 'OBR-001',
  regional_id: SEED_REGIONAL.id,
  tipo_obra: 'supervisao',
  status: 'em_andamento',
  created_date: '2026-07-08T08:00:00.000Z',
  updated_date: '2026-07-08T08:00:00.000Z',
};

const SEED_PROJECT = {
  id: 'project-1',
  name: 'Projeto CAUQ E2E',
  tipo_projeto: 'CAUQ',
  status: 'ativo',
  faixa_granulometrica_id: 'faixa-1',
  ligante: { tipo: 'CAP 50/70' },
  agregados: [{ nome: 'Agregado 1', pedreira: 'Pedreira E2E' }],
  created_date: '2026-07-08T08:00:00.000Z',
  updated_date: '2026-07-08T08:00:00.000Z',
};

const SEED_FAIXA = {
  id: 'faixa-1',
  name: 'Faixa E2E',
  nome: 'Faixa E2E',
  peneiras: [],
  created_date: '2026-07-08T08:00:00.000Z',
  updated_date: '2026-07-08T08:00:00.000Z',
};

// ── Store em memória ───────────────────────────────────────────────────────────
function createStore() {
  const store = {
    Regional: new Map([[SEED_REGIONAL.id, { ...SEED_REGIONAL }]]),
    Obra: new Map([[SEED_OBRA.id, { ...SEED_OBRA }]]),
    Project: new Map([[SEED_PROJECT.id, { ...SEED_PROJECT }]]),
    FaixaGranulometrica: new Map([[SEED_FAIXA.id, { ...SEED_FAIXA }]]),
    User: new Map([
      [ADMIN_USER.id, { ...ADMIN_USER }],
      [GESTOR_USER.id, { ...GESTOR_USER }],
      [CLIENTE_USER.id, { ...CLIENTE_USER }],
    ]),
    EnsaioCAUQ: new Map(),
  };
  let seq = 0;
  return {
    store,
    nextId: (entity) => `${entity}-${++seq}`,
    reset: () => {
      for (const m of Object.values(store)) m.clear();
      store.Regional.set(SEED_REGIONAL.id, { ...SEED_REGIONAL });
      store.Obra.set(SEED_OBRA.id, { ...SEED_OBRA });
      store.Project.set(SEED_PROJECT.id, { ...SEED_PROJECT });
      store.FaixaGranulometrica.set(SEED_FAIXA.id, { ...SEED_FAIXA });
      store.User.set(ADMIN_USER.id, { ...ADMIN_USER });
      store.User.set(GESTOR_USER.id, { ...GESTOR_USER });
      store.User.set(CLIENTE_USER.id, { ...CLIENTE_USER });
      seq = 0;
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function jsonResponse(data, status = 200) {
  return { status, contentType: 'application/json', body: JSON.stringify(data) };
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

function parseBody(request) {
  try {
    return JSON.parse(request.postData() || '{}');
  } catch {
    return {};
  }
}

function nowISO() {
  return new Date().toISOString();
}

function extractAppId(url) {
  const match = url.match(/\/apps\/([^/]+)\//);
  return match ? match[1] : null;
}

function extractEntityAndId(pathname) {
  // /api/apps/{appId}/entities/{entity}/{id}
  const match = pathname.match(/\/api\/apps\/[^/]+\/entities\/([^/]+)(?:\/([^/?]+))?/);
  if (!match) return null;
  return { entity: match[1], id: match[2] };
}

// ── Mock de funções backend ───────────────────────────────────────────────────
function handleFunction(funcName, body, ctx) {
  const { store, nextId } = ctx;

  if (funcName === 'validarESalvarRegistro') {
    const { entityName, data, operation, recordId } = body;
    const entityStore = store[entityName];
    if (!entityStore) return errorResponse(`Entidade desconhecida: ${entityName}`);

    if (operation === 'create') {
      const id = nextId(entityName);
      const record = {
        id,
        created_date: nowISO(),
        updated_date: nowISO(),
        created_by: ADMIN_USER.email,
        ...data,
      };
      entityStore.set(id, record);
      return jsonResponse({ success: true, data: record });
    }

    if (operation === 'update') {
      const current = entityStore.get(recordId);
      if (!current) return errorResponse('Registro não encontrado', 404);
      const updated = { ...current, ...data, updated_date: nowISO() };
      entityStore.set(recordId, updated);
      return jsonResponse({ success: true, data: updated });
    }

    return errorResponse('Operação não suportada');
  }

  if (funcName === 'gerenciarAprovacao') {
    const { action, entityName, recordId, rejectionReason } = body;
    const entityStore = store[entityName];
    if (!entityStore) return errorResponse(`Entidade desconhecida: ${entityName}`);

    const record = entityStore.get(recordId);
    if (!record) return errorResponse('Registro não encontrado', 404);

    if (action === 'approve') {
      const updated = {
        ...record,
        approved: true,
        approved_by: GESTOR_USER.email,
        approved_date: nowISO(),
        approver_details: {
          name: GESTOR_USER.full_name,
          position: GESTOR_USER.access_level,
          crea_number: GESTOR_USER.crea_number,
        },
      };
      entityStore.set(recordId, updated);
      return jsonResponse({ success: true, data: updated });
    }

    if (action === 'reject') {
      const updated = {
        ...record,
        approved: false,
        was_rejected: true,
        rejection_reason: rejectionReason || '',
        approved_by: GESTOR_USER.email,
        approved_date: nowISO(),
        approver_details: {
          name: GESTOR_USER.full_name,
          position: GESTOR_USER.access_level,
          crea_number: GESTOR_USER.crea_number,
        },
      };
      entityStore.set(recordId, updated);
      return jsonResponse({ success: true, data: updated });
    }

    if (action === 'sign') {
      const updated = {
        ...record,
        client_signature: {
          signed_by: CLIENTE_USER.email,
          signed_date: nowISO(),
          engineer_name: CLIENTE_USER.full_name,
          crea_number: CLIENTE_USER.crea_number,
        },
      };
      entityStore.set(recordId, updated);
      return jsonResponse({ success: true, data: updated });
    }

    if (action === 'delete') {
      entityStore.delete(recordId);
      return jsonResponse({ success: true, data: { ok: true } });
    }

    return errorResponse(`Ação não suportada: ${action}`);
  }

  // Funções não especificamente mockadas (ex: updateLastLogin) retornam sucesso genérico
  return jsonResponse({ success: true });
}

// ── Setup do mock ─────────────────────────────────────────────────────────────
export function setupMockApi(page, currentUser = ADMIN_USER) {
  const ctx = createStore();

  // ── Token injection via URL param ───────────────────────────────────────────
  // O SDK lê o token da URL ANTES de qualquer script (app-params.js).
  // Adicionamos ?access_token=… diretamente na URL ao navegar.
  // O addInitScript (localStorage) não é confiável com Vite dev server
  // porque o module preload pode avaliar appParams antes do init script.
  const TOKEN = 'e2e-mock-token';
  const originalGoto = page.goto.bind(page);
  page.goto = async (url, options) => {
    const fullUrl = typeof url === 'string' && url.startsWith('/')
      ? `http://localhost:5173${url}`
      : url;
    const parsed = new URL(fullUrl);
    if (!parsed.searchParams.has('access_token')) {
      parsed.searchParams.set('access_token', TOKEN);
    }
    return originalGoto(parsed.toString(), options);
  };

  // ── Context-level routes ────────────────────────────────────────────────────
  // Usamos page.context().route() para que as rotas se apliquem também a
  // páginas abertas em novas abas (ex: relatório com target="_blank").
  const context = page.context();

  // ── Intercepta 504 "Outdated Optimize Dep" do Vite para zod ─────────────────
  // O Vite dev server da plataforma tem um cache de deps stale que retorna 504
  // para zod.js quando descoberto em chunk lazy-loaded. Servimos um bundle ESM
  // pre-compilado com esbuild como fallback.
  try {
    const bundlePath = '/tmp/zod-bundle.js';
    if (!fs.existsSync(bundlePath)) {
      execSync(
        'npx esbuild /app/node_modules/zod/index.js --bundle --format=esm --outfile=' + bundlePath + ' --platform=browser',
        { encoding: 'utf8', timeout: 30000 }
      );
    }
    const zodBundle = fs.readFileSync(bundlePath, 'utf8');
    context.route('**/.vite/deps/zod.js*', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: zodBundle });
    });
  } catch (e) {
    console.log('[MOCK] Aviso: não foi possível carregar bundle zod:', e.message);
  }

  // Interceptar navegações de NOVAS abas para injetar o token na URL
  context.on('page', async (newPage) => {
    // Aguardar a primeira navegação da nova aba e reescrever a URL com o token
    newPage.on('framenavigated', async (frame) => {
      if (frame === newPage.mainFrame()) {
        const url = new URL(newPage.url());
        if (!url.searchParams.has('access_token') && !url.pathname.startsWith('/login')) {
          url.searchParams.set('access_token', TOKEN);
          try {
            await newPage.goto(url.toString());
          } catch { /* página pode ainda estar carregando */ }
        }
      }
    }, { once: true });
  });

  // ── Intercepta chamadas de logging (app-logs) ────────────────────────────────
  context.route('**/api/app-logs/**', async (route) => {
    return route.fulfill(jsonResponse({ success: true }));
  });

  context.route('**/api/apps/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;
    const method = request.method();

    // ── Analytics (no-op — evita falha de rede) ─────────────────────────────
    if (pathname.includes('/analytics/track/batch')) {
      return route.fulfill(jsonResponse({ success: true }));
    }

    // ── Public settings (bootstrap do AuthContext) ───────────────────────────
    if (pathname.includes('/public-settings/by-id/')) {
      console.log('[MOCK] → public settings');
      return route.fulfill(jsonResponse({
        id: 'e2e-app-id',
        public_settings: {},
        requires_auth: false,
      }));
    }

    // ── Auth: User/me ────────────────────────────────────────────────────────
    if (pathname.endsWith('/entities/User/me') && method === 'GET') {
      return route.fulfill(jsonResponse(currentUser));
    }

    // ── Functions (backend function invoke) ──────────────────────────────────
    const funcMatch = pathname.match(/\/functions\/([^/?]+)/);
    if (funcMatch && method === 'POST') {
      const body = parseBody(request);
      const result = handleFunction(funcMatch[1], body, ctx);
      return route.fulfill(result);
    }

    // ── Entity CRUD ──────────────────────────────────────────────────────────
    const entityInfo = extractEntityAndId(pathname);
    if (entityInfo) {
      const { entity, id } = entityInfo;
      const entityStore = ctx.store[entity];

      // Schema endpoint (não usado em runtime, mas pode ser chamado)
      if (id === 'schema' || pathname.endsWith('/schema')) {
        return route.fulfill(jsonResponse({ properties: {} }));
      }

      if (!entityStore) {
        // Entidade não registrada no store — retorna array vazio para list/filter
        if (method === 'GET' && !id) return route.fulfill(jsonResponse([]));
        return route.fulfill(jsonResponse([]));
      }

      // GET /entities/{entity} → list or filter (com query params)
      if (method === 'GET' && !id) {
        const records = Array.from(entityStore.values());
        return route.fulfill(jsonResponse(records));
      }

      // GET /entities/{entity}/{id} → get
      if (method === 'GET' && id) {
        const record = entityStore.get(id);
        if (!record) return route.fulfill(errorResponse('Não encontrado', 404));
        return route.fulfill(jsonResponse(record));
      }

      // POST /entities/{entity} → create
      if (method === 'POST' && !id) {
        const data = parseBody(request);
        const newId = ctx.nextId(entity);
        const record = {
          id: newId,
          created_date: nowISO(),
          updated_date: nowISO(),
          created_by: currentUser.email,
          ...data,
        };
        entityStore.set(newId, record);
        return route.fulfill(jsonResponse(record));
      }

      // PUT /entities/{entity}/{id} → update
      if (method === 'PUT' && id) {
        const current = entityStore.get(id);
        if (!current) return route.fulfill(errorResponse('Não encontrado', 404));
        const data = parseBody(request);
        const updated = { ...current, ...data, updated_date: nowISO() };
        entityStore.set(id, updated);
        return route.fulfill(jsonResponse(updated));
      }

      // DELETE /entities/{entity}/{id} → delete
      if (method === 'DELETE' && id) {
        entityStore.delete(id);
        return route.fulfill(jsonResponse({ ok: true }));
      }
    }

    // Fallback: resposta vazia para qualquer outra chamada de API não reconhecida.
    // Não usar route.continue() — faria uma requisição real ao Vite dev server,
    // que não tem backend, retornando 404 e poluindo o console.
    return route.fulfill(jsonResponse([]));
  });

  return ctx;
}

export { ADMIN_USER, GESTOR_USER, CLIENTE_USER };