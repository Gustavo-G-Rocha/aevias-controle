/**
 * Extract NC ID from URL search params
 */
export const extractNCIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

/**
 * Initialize form with NC data
 */
export const initializeNCForm = (nc) => ({
  numero_rnc: nc.numero_rnc || "",
  cliente: nc.cliente || "",
  rodovia: nc.rodovia || "",
  trecho: nc.trecho || "",
  fiscal: nc.fiscal || "",
  data_nc: nc.data_nc || "",
  campo: nc.campo || "",
  executora: nc.executora || "",
  contrato: nc.contrato || "",
  descricao_nc: nc.descricao_nc || "",
  acoes: nc.acoes || "",
  local_nc: nc.local_nc || "",
  categoria_nc: nc.categoria_nc || "",
  parametro_nc: nc.parametro_nc || "",
});

/**
 * Validate NC form fields (required: data_nc, descricao_nc)
 */
export const validateNCForm = (form) => {
  return !!(form.descricao_nc && form.data_nc);
};

/**
 * Build update payload for NC
 */
export const buildNCUpdatePayload = (form, fotos, pdfs) => ({
  ...form,
  fotos: (fotos || []).map(f => (typeof f === 'string' ? f : (f?.url || ''))).filter(Boolean),
  pdfs: (pdfs || []).map(p => ({ url: p.url || p, nome: p.nome || p })),
  pendente_aprovacao_cliente: true,
  cliente_aprovacao: null,
  cliente_reprovacao_motivo: null,
});

/**
 * Remove photo by index
 */
export const removePhotoByIndex = (fotos, index) => {
  return fotos.filter((_, idx) => idx !== index);
};

/**
 * Remove PDF by index
 */
export const removePdfByIndex = (pdfs, index) => {
  return pdfs.filter((_, idx) => idx !== index);
};

/**
 * Check if NC has rejection reason
 */
export const hasRejectionReason = (nc) => {
  return !!nc?.cliente_reprovacao_motivo;
};