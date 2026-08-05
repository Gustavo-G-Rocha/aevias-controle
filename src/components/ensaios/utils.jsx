import { MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import { ENSAIO_CONFIG } from "@/components/ensaios/ensaioMappers";
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/constants/ensaioUi";

// ── Helpers de fallback ──────────────────────────────────────────────────────
const defaultLocalInfo = (ensaio) => ({
  tipo: "Local",
  detalhes: ensaio.collection_point || ensaio.location || "Não informado",
  icon: MapPin,
});

// ─── Funções públicas — delegam para o registry único ENSAIO_CONFIG ──────────

export const getLocalInfo = (ensaio) => {
  const cfg = ENSAIO_CONFIG[ensaio.entityType];
  return cfg?.localInfo ? cfg.localInfo(ensaio) : defaultLocalInfo(ensaio);
};

export const getLaboratoristaInfo = (ensaio, allUsers) => {
  if (ensaio.laboratorista_name) return ensaio.laboratorista_name;
  
  if (ensaio.created_by && allUsers) {
    const user = allUsers.find(u => u.email?.toLowerCase() === ensaio.created_by?.toLowerCase());
    if (user) {
      return user.laboratorista_name || user.full_name || ensaio.created_by.split('@')[0];
    }
  }
  
  return ensaio.created_by?.split('@')[0] || "Não identificado";
};

export const getResponsavelInfo = (ensaio) => {
  const cfg = ENSAIO_CONFIG[ensaio.entityType];
  return cfg?.responsavel ? cfg.responsavel(ensaio) : null;
};

export const getEmpreiteiraInfo = (ensaio) => {
  const cfg = ENSAIO_CONFIG[ensaio.entityType];
  return cfg?.hasEmpreiteira ? (ensaio.empreiteira || null) : null;
};

export const getRodoviaInfo = (ensaio) => {
  return ensaio.rodovia || null;
};

export const getTrechoInfo = (ensaio) => {
  return ensaio.trecho || ensaio.estaca || null;
};

export const getNaoConformidades = (ensaio) => {
  const cfg = ENSAIO_CONFIG[ensaio.entityType];
  return cfg?.ncExtractor ? cfg.ncExtractor(ensaio) : [];
};

export const getStatusInfo = (ensaio) => {
  // Se status foi revertido para rascunho, tem prioridade sobre approved
  if (ensaio.status === 'rascunho' && !ensaio.client_signature?.signed_by) {
    return { text: STATUS_LABELS.RASCUNHO, icon: Clock, className: STATUS_BADGE_CLASSES.EXECUCAO };
  }
  if (ensaio.client_signature?.signed_by) {
    return { text: STATUS_LABELS.ASSINADO, icon: CheckCircle, className: STATUS_BADGE_CLASSES.ASSINADO };
  }
  if (ensaio.approved === true) {
    return { text: STATUS_LABELS.APROVADO, icon: CheckCircle, className: STATUS_BADGE_CLASSES.APROVADO };
  }
  if (ensaio.approved === false) {
    return { text: STATUS_LABELS.REPROVADO, icon: XCircle, className: STATUS_BADGE_CLASSES.REPROVADO };
  }
  // Pendente: finalizado pelo laboratorista, aguardando aprovação do gestor/admin.
  // Entidades legadas sem campo status (BoletimSondagem, BoletimSondagemTrado,
  // EnsaioDensidade) com approved=null também são pendentes aguardando aprovação.
  if (ensaio.status === 'finalizado' || (ensaio.approved == null && ensaio.status !== 'rascunho' && !ensaio.client_signature?.signed_by)) {
    return { text: STATUS_LABELS.FINALIZADO, icon: Clock, className: STATUS_BADGE_CLASSES.FINALIZADO };
  }
  return { text: STATUS_LABELS.FINALIZADO, icon: Clock, className: STATUS_BADGE_CLASSES.FINALIZADO };
};