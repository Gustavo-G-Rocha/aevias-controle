import { useState, useEffect, useCallback } from "react";
import { obterUsuarioAtual } from "@/services/usuariosService";
import { listarProjects } from "@/services/projectsService";
import { listarFaixas } from "@/services/faixasService";
import { listarRegionais } from "@/services/regionaisService";
import { filterProjectsByUserAccess } from "@/utils/projectsUtils";
import { getDataCache } from "@/services/offlineStorageService";

export const useProjectsData = () => {
  const [projects, setProjects] = useState([]);
  const [faixas, setFaixas] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Offline: usa o cache preparado na última abertura com rede
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const [cUser, cProjects, cFaixas, cRegionais] = await Promise.all([
          getDataCache("currentUser"),
          getDataCache("auxData:projects"),
          getDataCache("auxData:faixas"),
          getDataCache("auxData:regionais"),
        ]);
        const userData = cUser?.data;
        if (userData) {
          setUser(userData);
          setFaixas(cFaixas?.data ?? []);
          setRegionais(cRegionais?.data ?? []);
          const userAccessLevel =
            userData.access_level || (userData.role === "admin" ? "admin" : "user");
          setProjects(
            filterProjectsByUserAccess(
              cProjects?.data ?? [],
              cRegionais?.data ?? [],
              userData,
              userAccessLevel
            )
          );
        }
        return;
      }

      const [userData, projectsData, faixasData, regionaisData] =
        await Promise.all([
          obterUsuarioAtual(),
          listarProjects('-created_date', 500),
          listarFaixas(),
          listarRegionais(),
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