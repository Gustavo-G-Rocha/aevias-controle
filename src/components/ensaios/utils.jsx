import { MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import { ENSAIO_CONFIG } from "@/components/ensaios/ensaioMappers";

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

export const getEmpireiteiraInfo = (ensaio) => {
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
    return { text: "Execução", icon: Clock, className: "bg-blue-100/80 text-secondary border border-blue-300/50 hover:bg-blue-200/80 hover:border-blue-400/50 transition-colors" };
  }
  if (ensaio.client_signature?.signed_by) {
    return { text: "Assinado", icon: CheckCircle, className: "bg-muted/10 text-foreground border border-border/30 hover:bg-muted/20 hover:border-border/40 transition-colors" };
  }
  if (ensaio.approved === true) {
    return { text: "Aprovado", icon: CheckCircle, className: "bg-green-100 text-green-700 border border-green-300/50 hover:bg-green-200 hover:border-green-400/50 transition-colors" };
  }
  if (ensaio.approved === false) {
    return { text: "Reprovado", icon: XCircle, className: "bg-red-100 text-destructive border border-red-300/50 hover:bg-red-200 hover:border-red-400/50 transition-colors" };
  }
  if (ensaio.was_rejected === true) {
    return { text: "Pendente", icon: Clock, className: "bg-orange-100/80 text-orange-800 border border-border/50 hover:bg-orange-200/80 hover:border-orange-400/50 transition-colors", wasRejected: true };
  }
  return { text: "Pendente", icon: Clock, className: "bg-yellow-100 text-yellow-700 border border-yellow-300/50 hover:bg-yellow-200 hover:border-yellow-400/50 transition-colors" };
};