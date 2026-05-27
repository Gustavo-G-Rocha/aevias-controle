import { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Regional } from "@/entities/Regional";
import { base44 } from "@/api/base44Client";
import {
  resolveAccessLevel,
  getRegionaisDoUsuario,
  getEmailsPermitidosPorRegional,
} from "@/utils/usersUtils";

export function useUsersData() {
  const [users, setUsers]             = useState([]);
  const [regionais, setRegionais]     = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUserData = await User.me();
      setCurrentUser(currentUserData);

      const regionaisData = await Regional.list();
      setRegionais(regionaisData);

      const { data: response } = await base44.functions.invoke('getRegionalUsers');
      let allUsers = response.users || [];

      const currentAccessLevel = resolveAccessLevel(currentUserData);

      if (['sala_tecnica_afirmaevias', 'gestor_contrato', 'cliente'].includes(currentAccessLevel)) {
        const regionaisDoUsuario = getRegionaisDoUsuario(currentAccessLevel, currentUserData.email, regionaisData);
        const emailsPermitidos   = getEmailsPermitidosPorRegional(regionaisDoUsuario);
        allUsers = allUsers.filter(u => emailsPermitidos.has(u.email.toLowerCase()));
      }

      setUsers(allUsers);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Não foi possível carregar a lista de usuários. Por favor, contate o administrador.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { users, regionais, currentUser, loading, loadData };
}