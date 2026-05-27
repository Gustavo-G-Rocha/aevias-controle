import { useState, useEffect, useCallback } from "react";
import { Project } from "@/entities/Project";
import { User } from "@/entities/User";
import { FaixaGranulometrica } from "@/entities/FaixaGranulometrica";
import { Regional } from "@/entities/Regional";
import { filterProjectsByUserAccess } from "@/utils/projectsUtils";

export const useProjectsData = () => {
  const [projects, setProjects] = useState([]);
  const [faixas, setFaixas] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, projectsData, faixasData, regionaisData] =
        await Promise.all([
          User.me(),
          Project.list("-created_date", 500),
          FaixaGranulometrica.list(),
          Regional.list(),
        ]);

      setUser(userData);
      setFaixas(faixasData);
      setRegionais(regionaisData);

      const userAccessLevel =
        userData.access_level || (userData.role === "admin" ? "admin" : "user");

      const filtered = filterProjectsByUserAccess(
        projectsData,
        regionaisData,
        userData,
        userAccessLevel
      );

      setProjects(filtered);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { projects, setProjects, faixas, regionais, user, loading, loadData };
};