import { useState, useEffect, useCallback } from "react";
import { obterUsuarioAtual, logout as encerrarSessao } from "@/services/usuariosService";
import { listarObrasRecentes } from "@/services/obrasService";
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

export function useLayoutData() {
  const [user, setUser] = useState(null);
  const [obrasDoUsuario, setObrasDoUsuario] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [pendingTransfers, setPendingTransfers] = useState(0);

  const loadUserAndObras = useCallback(async () => {
    setLoadingUser(true);
    try {
      const userData = await obterUsuarioAtual();

      if (userData?.is_active === false) {
        encerrarSessao();
        return;
      }

      setUser(userData);
      const userAccessLevel = getUserAccessLevel(userData);

      if (userAccessLevel === ACCESS_LEVELS.USER || userAccessLevel === ACCESS_LEVELS.FUNCIONARIOS_CLIENTE) {
        const [obrasData, regionaisData] = await Promise.all([listarObrasRecentes(), listarRegionais()]);

        const emailLower = userData.email.toLowerCase();
        const supervisorEmailLower = userData.supervisor_email?.toLowerCase();

        let regionaisIds;
        if (userAccessLevel === ACCESS_LEVELS.FUNCIONARIOS_CLIENTE) {
          // funcionarios_cliente: encontra regionais onde o supervisor OU o próprio email
          // está em clientes_responsaveis
          const emailsToCheck = new Set([emailLower]);
          if (supervisorEmailLower) emailsToCheck.add(supervisorEmailLower);
          regionaisIds = regionaisData
            .filter(r => (r.clientes_responsaveis || []).some(e => emailsToCheck.has(e.toLowerCase())))
            .map(r => r.id);
        } else {
          // user (laboratorista): regionais onde está alocado
          regionaisIds = regionaisData
            .filter(r =>
              (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
              (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
            )
            .map(r => r.id);
        }

        const regionaisSet = new Set(regionaisIds);
        // funcionarios_cliente: vê todas as obras da regional do supervisor (independente de status);
        // user (laboratorista): apenas obras em andamento
        const statusFilter = userAccessLevel === ACCESS_LEVELS.FUNCIONARIOS_CLIENTE
          ? () => true
          : (o) => o.status === "em_andamento";
        const obrasRegional = regionaisIds.length > 0
          ? obrasData.filter(o => regionaisSet.has(o.regional_id) && statusFilter(o))
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
      setUser(null);
      setObrasDoUsuario([]);
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