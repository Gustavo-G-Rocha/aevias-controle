import { useState, useEffect, useCallback } from "react";
import { obterUsuarioAtual, logout as encerrarSessao } from "@/services/usuariosService";
import { listarObrasRecentes, carregarObrasFuncionarioClienteService } from "@/services/obrasService";
import { listarRegionais } from "@/services/regionaisService";
import { logger } from '@/utils/logger';
import {
  listarSolicitacoesTransferenciaObra,
  listarSolicitacoesTransferenciaRegional,
} from "@/services/solicitacoesService";
import { base44 } from "@/api/base44Client";
import {
  SESSION_KEYS,
  ACCESS_LEVELS,
  ALL_OBRA_TYPE_STUBS,
  getUserAccessLevel,
} from "@/lib/layoutConstants";
import { getDataCache, saveDataCache } from "@/services/offlineStorageService";

function isOffline() {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Carrega usuário e obras do cache offline (IndexedDB).
 * Usado quando não há rede OU quando a rede falha silenciosamente
 * (navigator.onLine true, mas requisições falham — comum em mobile).
 * @returns {{ userData: object|null, obras: object[] }}
 */
async function carregarDoCacheOffline() {
  const cachedUser = await getDataCache('currentUser');
  const userData = cachedUser?.data || null;
  if (!userData) return { userData: null, obras: [] };

  const userAccessLevel = getUserAccessLevel(userData);
  if (userAccessLevel !== ACCESS_LEVELS.USER && userAccessLevel !== ACCESS_LEVELS.FUNCIONARIOS_CLIENTE) {
    return { userData, obras: ALL_OBRA_TYPE_STUBS };
  }

  const cachedObras = await getDataCache('auxData:obras');
  const cachedRegionais = await getDataCache('auxData:regionais');
  const obrasData = cachedObras?.data || [];
  const regionaisData = cachedRegionais?.data || [];
  const emailLower = userData.email.toLowerCase();
  const supervisorEmailLower = userData.supervisor_email?.toLowerCase();

  let regionaisIds;
  if (userAccessLevel === ACCESS_LEVELS.FUNCIONARIOS_CLIENTE) {
    const emailsToCheck = new Set([emailLower]);
    if (supervisorEmailLower) emailsToCheck.add(supervisorEmailLower);
    regionaisIds = regionaisData
      .filter(r => (r.clientes_responsaveis || []).some(e => emailsToCheck.has(e.toLowerCase())))
      .map(r => r.id);
  } else {
    regionaisIds = regionaisData
      .filter(r =>
        (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
        (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
      )
      .map(r => r.id);
  }

  const regionaisSet = new Set(regionaisIds);
  const statusFilter = userAccessLevel === ACCESS_LEVELS.FUNCIONARIOS_CLIENTE
    ? () => true
    : (o) => o.status === "em_andamento";
  const obras = regionaisIds.length > 0
    ? obrasData.filter(o => regionaisSet.has(o.regional_id) && statusFilter(o))
    : [];
  return { userData, obras };
}

export function useLayoutData() {
  const [user, setUser] = useState(null);
  const [obrasDoUsuario, setObrasDoUsuario] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [pendingTransfers, setPendingTransfers] = useState(0);

  const loadUserAndObras = useCallback(async () => {
    setLoadingUser(true);

    // ── Modo offline (modelo WhatsApp) ──
    // Sem rede: usar usuário e dados auxiliares em cache para não quebrar a navegação.
    if (isOffline()) {
      logger.log('[useLayoutData] Offline — carregando do cache');
      try {
        const { userData, obras } = await carregarDoCacheOffline();
        setUser(userData);
        setObrasDoUsuario(obras);
      } catch (e) {
        logger.error('[useLayoutData] Erro ao carregar cache offline:', e);
        setUser(null);
        setObrasDoUsuario([]);
      } finally {
        setLoadingUser(false);
      }
      return;
    }

    try {
      const userData = await obterUsuarioAtual();

      if (userData?.is_active === false) {
        encerrarSessao();
        return;
      }

      setUser(userData);
      const userAccessLevel = getUserAccessLevel(userData);

      if (userAccessLevel === ACCESS_LEVELS.FUNCIONARIOS_CLIENTE) {
        // funcionarios_cliente (inspetor): busca via backend function com escopo
        // server-side (regionais do próprio email ou do supervisor) — o RLS do
        // frontend não cobre este nível de acesso.
        const { regionais: regionaisData, obras: obrasRegional } = await carregarObrasFuncionarioClienteService();
        // Cachear para uso offline
        saveDataCache('auxData:obras', obrasRegional, 'auxData').catch(() => {});
        saveDataCache('auxData:regionais', regionaisData, 'auxData').catch(() => {});
        setObrasDoUsuario(obrasRegional);
      } else if (userAccessLevel === ACCESS_LEVELS.USER) {
        const [obrasData, regionaisData] = await Promise.all([listarObrasRecentes(), listarRegionais()]);
        // Cachear para uso offline
        saveDataCache('auxData:obras', obrasData, 'auxData').catch(() => {});
        saveDataCache('auxData:regionais', regionaisData, 'auxData').catch(() => {});

        const emailLower = userData.email.toLowerCase();

        // user (laboratorista): regionais onde está alocado
        const regionaisIds = regionaisData
          .filter(r =>
            (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
            (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
          )
          .map(r => r.id);

        const regionaisSet = new Set(regionaisIds);
        // user (laboratorista): apenas obras em andamento
        const obrasRegional = regionaisIds.length > 0
          ? obrasData.filter(o => regionaisSet.has(o.regional_id) && o.status === "em_andamento")
          : [];

        setObrasDoUsuario(obrasRegional);
      } else {
        setObrasDoUsuario(ALL_OBRA_TYPE_STUBS);
      }

      // Carregar transferências pendentes para gestores/sala técnica
      if (userAccessLevel === ACCESS_LEVELS.GESTOR_CONTRATO || userAccessLevel === ACCESS_LEVELS.SALA_TECNICA) {
        const [regionaisData, transferenciaObra, transferenciaRegional] = await Promise.all([
          listarRegionais(),
          listarSolicitacoesTransferenciaObra(),
          listarSolicitacoesTransferenciaRegional(),
        ]);

        const emailLower = userData.email?.toLowerCase();
        const regionaisIds = regionaisData
          .filter(r =>
            r.gestor_contrato_responsavel?.toLowerCase() === emailLower ||
            (r.gestores_contrato_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
            (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
          )
          .map(r => r.id);

        const regionaisSet = new Set(regionaisIds);

        const pendentes =
          transferenciaObra.filter(t => t.status === "pendente" && (regionaisSet.has(t.obra_destino_id) || regionaisSet.has(t.obra_atual_id))).length +
          transferenciaRegional.filter(t => t.status === "pendente" && regionaisSet.has(t.regional_destino_id)).length;

        setPendingTransfers(pendentes);
      }
    } catch (error) {
      logger.error("Erro ao carregar usuário e obras:", error);
      // Erro de autenticação real: desloga. Falha de rede (comum em mobile
      // com navigator.onLine mentindo): cai para o cache offline.
      if (error?.status === 401 || error?.status === 403) {
        setUser(null);
        setObrasDoUsuario([]);
      } else {
        try {
          const { userData, obras } = await carregarDoCacheOffline();
          logger.warn('[useLayoutData] Rede falhou — usando cache offline');
          setUser(userData);
          setObrasDoUsuario(obras);
        } catch {
          setUser(null);
          setObrasDoUsuario([]);
        }
      }
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    loadUserAndObras();
  }, [loadUserAndObras]);

  // Atualizar last_login apenas uma vez por sessão
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEYS.LAST_LOGIN)) return;
    sessionStorage.setItem(SESSION_KEYS.LAST_LOGIN, "1");
    base44.functions.invoke("updateLastLogin", {}).catch(() => {});
  }, []);

  // Desabilitar tradução automática
  useEffect(() => {
    document.querySelector("html")?.setAttribute("translate", "no");
    document.querySelector("html")?.setAttribute("lang", "pt-BR");
    if (!document.querySelector('meta[name="google"]')) {
      const meta = document.createElement("meta");
      meta.name = "google";
      meta.content = "notranslate";
      document.head.appendChild(meta);
    }
  }, []);

  return { user, obrasDoUsuario, loadingUser, pendingTransfers };
}