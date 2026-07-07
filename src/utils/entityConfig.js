// Configuração centralizada de entidades — deriva do registry único ENSAIO_CONFIG.
// Mantém a API pública (ENTITY_CONFIG, getEntityLabel, getEntityColor,
// getEntityDescription, PIE_COLORS) para não quebrar consumidores existentes.

import { ENSAIO_CONFIG } from "@/components/ensaios/ensaioMappers";

// Deriva ENTITY_CONFIG a partir do registry único, mantendo a mesma shape
// (label, color, description) esperada pelos consumidores.
export const ENTITY_CONFIG = Object.fromEntries(
  Object.entries(ENSAIO_CONFIG).map(([key, cfg]) => [
    key,
    { label: cfg.label ?? cfg.name, color: cfg.color, description: cfg.description },
  ])
);

export const PIE_COLORS = ['#00233B', '#566E3D', '#BFCF99', '#FBBF24', '#800020'];

export function getEntityLabel(type) {
  return ENTITY_CONFIG[type]?.label ?? type;
}

export function getEntityColor(type) {
  return ENTITY_CONFIG[type]?.color ?? '#999999';
}

export function getEntityDescription(type) {
  return ENTITY_CONFIG[type]?.description ?? 'Nova atividade';
}