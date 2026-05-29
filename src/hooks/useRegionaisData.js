/**
 * Hook de carregamento de dados iniciais da página de Regionais.
 * Responsabilidades: buscar user, regionais, obras, users, projects; 
 * filtrar regionais por nível de acesso; expor loadData para refresh.
 */
import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { getUserAccessLevel, filtrarRegionaisPorAcesso } from "@/utils/regionaisUtils";

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
      const userData = await base44.auth.me();
      setUser(userData);

      const accessLevel = getUserAccessLevel(userData);

      const [regionaisData, obrasData, projectsData] = await Promise.all([
        base44.entities.Regional.list("-created_date", 100),
        base44.entities.Obra.list(),
        base44.entities.Project.list(),
      ]);

      setTodasRegionais(regionaisData);

      // Carregar users apenas se não for laboratorista (sem permissão de listagem)
      let usersData = [];
      if (accessLevel !== 'user') {
        try {
          usersData = await base44.entities.User.list();
        } catch (e) {
          console.error('[Regionais] Sem permissão para listar usuários:', e?.message || e);
        }
      }

      setRegionais(filtrarRegionaisPorAcesso(regionaisData, userData, accessLevel));
      setObras(obrasData);
      setUsers(usersData);
      setProjects(projectsData);
    } catch (error) {
      console.error("[Regionais] Erro ao carregar dados:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { regionais, todasRegionais, obras, users, projects, user, loading, loadData };
}