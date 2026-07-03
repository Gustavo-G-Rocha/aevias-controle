import { useState, useCallback } from "react";
import { atualizarUsuario, inviteUser } from "@/services/usuariosService";
import { atualizarRegional } from "@/services/regionaisService";
import {
  resolveAccessLevel,
  deriveRoleFromAccessLevel,
  getRegionaisDoUsuario,
} from "@/utils/usersUtils";

export function useUsersActions({ currentUser, regionais, loadData }) {
  const [isFormOpen,   setIsFormOpen]   = useState(false);
  const [editingUser,  setEditingUser]  = useState(null);

  const handleEdit = useCallback((user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingUser(null);
  }, []);

  const handleSaveUser = useCallback(async (userData) => {
    const currentAccessLevel = resolveAccessLevel(currentUser);
    const isGestorOrSalaTecnica = currentAccessLevel === 'gestor_contrato' || currentAccessLevel === 'sala_tecnica_afirmaevias';

    try {
      if (editingUser?.id) {
        // EDIÇÃO: enviar apenas campos customizados do schema
        const customFields = {
          laboratorista_name: userData.laboratorista_name,
          company:            userData.company,
          position:           userData.position,
          phone:              userData.phone,
          crea_number:        userData.crea_number,
          is_active:          userData.is_active,
          access_level:       userData.access_level,
        };

        const cleanedFields = Object.fromEntries(
          Object.entries(customFields).filter(([, v]) => v !== '' && v !== null && v !== undefined)
        );

        if (cleanedFields.access_level) {
          cleanedFields.role = deriveRoleFromAccessLevel(cleanedFields.access_level);
        }

        await atualizarUsuario(editingUser.id, cleanedFields);
        alert("Usuário atualizado com sucesso!");
      } else {
        // CRIAÇÃO via invite (User.create retorna 405 — usuários entram por convite)
        await inviteUser(
          userData.email,
          deriveRoleFromAccessLevel(userData.access_level) === 'admin' ? 'admin' : 'user'
        );

        // Alocar na regional se gestor/sala técnica criando laboratorista
        if (isGestorOrSalaTecnica && userData.access_level === 'user') {
          const regionaisDoUsuario = getRegionaisDoUsuario(currentAccessLevel, currentUser.email, regionais);
          const regionalDoUsuario  = regionaisDoUsuario[0];

          if (regionalDoUsuario) {
            const laboratoristasAtuais = regionalDoUsuario.laboratoristas_responsaveis || [];
            const novoEmail = userData.email.toLowerCase();
            if (!laboratoristasAtuais.some(e => e.toLowerCase() === novoEmail)) {
              await atualizarRegional(regionalDoUsuario.id, {
                laboratoristas_responsaveis: [...laboratoristasAtuais, userData.email],
              });
            }
          }
        }

        const successMessage = isGestorOrSalaTecnica && userData.access_level === 'user'
          ? "Usuário cadastrado com sucesso! O laboratorista foi automaticamente alocado na sua regional. Um convite foi enviado por email."
          : "Usuário cadastrado com sucesso! Um convite foi enviado por email.";

        alert(successMessage);
      }

      setIsFormOpen(false);
      setEditingUser(null);
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      const mensagemErro =
        error.response?.data?.detail  ||
        error.response?.data?.message ||
        error.message                  ||
        "Erro desconhecido ao salvar usuário";
      alert(`Erro ao salvar usuário: ${mensagemErro}`);
    }
  }, [editingUser, currentUser, regionais, loadData]);

  return { isFormOpen, setIsFormOpen, editingUser, handleEdit, handleCloseForm, handleSaveUser };
}