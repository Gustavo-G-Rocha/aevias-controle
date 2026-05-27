import { useState, useMemo } from "react";
import { filterUsers, resolveAccessLevel } from "@/utils/usersUtils";

export function useUsersFilters(users, currentUser) {
  const [searchTerm, setSearchTerm] = useState("");

  const userAccessLevel    = resolveAccessLevel(currentUser);
  const isAdmin            = userAccessLevel === 'admin';
  const isSalaTecnica      = userAccessLevel === 'sala_tecnica_afirmaevias';
  const isGestorContrato   = userAccessLevel === 'gestor_contrato';
  const isCliente          = userAccessLevel === 'cliente';
  const canManageUsers     = isAdmin || isSalaTecnica || isGestorContrato;

  const filteredUsers = useMemo(
    () => filterUsers(users, searchTerm),
    [users, searchTerm]
  );

  return {
    searchTerm, setSearchTerm,
    filteredUsers,
    userAccessLevel, isAdmin, isSalaTecnica, isGestorContrato, isCliente, canManageUsers,
  };
}