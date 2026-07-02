/**
 * Cores para badges de status
 */
export const STATUS_COLORS = {
  aberta: "bg-red-100 text-destructive",
  em_tratativa: "bg-yellow-100 text-yellow-700",
  encerrada: "bg-green-100 text-green-700",
  cancelada: "bg-gray-100 text-gray-600",
};

/**
 * Rótulos de status
 */
export const STATUS_LABELS = {
  aberta: "Aberta",
  em_tratativa: "Em Tratativa",
  encerrada: "Finalizada",
  cancelada: "Cancelada",
};

/**
 * Determine user access level
 */
export const getUserAccessLevel = (user) => {
  if (!user) return "user";
  return user.access_level || (user.role === "admin" ? "admin" : "user");
};

/**
 * Check if user is gestor
 */
export const isUserGestor = (user) => {
  return getUserAccessLevel(user) === "gestor_contrato";
};

/**
 * Check if user is admin
 */
export const isUserAdmin = (user) => {
  return getUserAccessLevel(user) === "admin";
};

/**
 * Check if user is cliente
 */
export const isUserCliente = (user) => {
  return getUserAccessLevel(user) === "cliente";
};

/**
 * Check if user can change status
 */
export const canUserChangeStatus = (user) => {
  const level = getUserAccessLevel(user);
  return level === "gestor_contrato" || level === "admin" || level === "cliente";
};

/**
 * Count NCs by status
 */
export const countNCsByStatus = (ncs, status) => {
  return ncs.filter((n) => n.status === status).length;
};

/**
 * Format date to pt-BR
 */
export const formatDatePtBR = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

/**
 * Get obra name from NC
 */
export const getObraName = (nc, obras) => {
  const obra = obras.find((o) => o.id === nc.obra_id);
  return obra?.name || nc.obra_nome || "—";
};