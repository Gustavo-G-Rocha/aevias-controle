/**
 * Hook de carregamento de dados iniciais da página de Regionais.
 * Responsabilidades: buscar user, regionais, obras, users, projects;
 * filtrar regionais por nível de acesso; expor loadData para refresh.
 */
import { useState, useEffect, useCallback } from "react";
import { obterUsuarioAtual, listarUsuarios } from "@/services/usuariosService";
import { listarRegionais } from "@/services/regionaisService";
import { listarRegistros } from "@/services/recordsService";
import { carregarObrasFuncionarioClienteService } from "@/services/obrasService";
import { listarProjects } from "@/services/projectsService";
import { getUserAccessLevel, filtrarRegionaisPorAcesso } from "@/utils/regionaisUtils";
import { getDataCache } from "@/services/offlineStorageService";
import { logger } from '@/utils/logger';

export function useRegionaisData() {
  const [regionais, setRegionais] = useState([]);
  const [todasRegionais, setTodasRegionais] = useState([]);
  const [obras, setObras] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Offline: usa o cache preparado na última abertura com rede
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const [cUser, cRegionais, cObras, cProjects] = await Promise.all([
          getDataCache("currentUser"),
          getDataCache("auxData:regionais"),
          getDataCache("auxData:obras"),
          getDataCache("auxData:projects"),
        ]);
        const cachedUser = cUser?.data;
        if (cachedUser) {
          setUser(cachedUser);
          const accessLevel = getUserAccessLevel(cachedUser);
          const regionaisData = cRegionais?.data ?? [];
          setTodasRegionais(regionaisData);
          setRegionais(filtrarRegionaisPorAcesso(regionaisData, cachedUser, accessLevel));
          setObras(cObras?.data ?? []);
          setUsers([]);
          setProjects(cProjects?.data ?? []);
        }
        return;
      }

      const userData = await obterUsuarioAtual();
      setUser(userData);

      const accessLevel = getUserAccessLevel(userData);

      // funcionarios_cliente (inspetor): regionais e obras vêm de backend function
      // com escopo server-side — o RLS do frontend não cobre este nível de acesso.
      if (userData.access_level === 'funcionarios_cliente') {
        const [{ regionais: minhasRegionais, obras: obrasFc }, projectsFc] = await Promise.all([
          carregarObrasFuncionarioClienteService(),
          listarProjects().catch(() => []),
        ]);
        setTodasRegionais(minhasRegionais);
        setRegionais(minhasRegionais);
        setObras(obrasFc);
        setUsers([]);
        setProjects(projectsFc);
        return;
      }

      const [regionaisData, obrasData, projectsData] = await Promise.all([
        listarRegionais("-created_date", 100),
        listarRegistros('Obra', '-created_date', 2000),
        listarProjects(),
      ]);

      setTodasRegionais(regionaisData);

      // Carregar users apenas se não for laboratorista (sem permissão de listagem)
      let usersData = [];
      if (accessLevel !== 'user' && accessLevel !== 'funcionarios_cliente') {
        try {
          usersData = await listarUsuarios();
        } catch (e) {
          logger.error('[Regionais] Sem permissão para listar usuários:', e?.message || e);
        }
      }

      setRegionais(filtrarRegionaisPorAcesso(regionaisData, userData, accessLevel));
      setObras(obrasData);
      setUsers(usersData);
      setProjects(projectsData);
    } catch (error) {
      logger.error("[Regionais] Erro ao carregar dados:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { regionais, todasRegionais, obras, users, projects, user, loading, loadData };
}