/**
 * Hook de carregamento de dados iniciais da página de Regionais.
 * Responsabilidades: buscar user, regionais, obras, users, projects; 
 * filtrar regionais por nível de acesso; expor loadData para refresh.
 */
import { useState, useEffect, useCallback } from "react";
import { Regional } from "@/entities/Regional";
import { Obra } from "@/entities/Obra";
import { User } from "@/entities/User";
import { Project } from "@/entities/Project";
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
      const userData = await User.me();
      setUser(userData);

      const accessLevel = getUserAccessLevel(userData);

      const [regionaisData, obrasData, projectsData] = await Promise.all([
        Regional.list("-created_date", 100),
        Obra.list(),
        Project.list(),
      ]);

      setTodasRegionais(regionaisData);

      // Carregar users apenas se não for laboratorista (sem permissão de listagem)
      let usersData = [];
      if (accessLevel !== 'user') {
        try {
          usersData = await User.list();
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