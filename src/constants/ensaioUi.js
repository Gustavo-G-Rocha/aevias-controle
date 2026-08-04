/**
 * ensaioUi.js — Constantes centrais da UI de ensaios/registros.
 *
 * Centraliza cores de ação, textos de diálogo, classes de badge de status
 * e labels offline que antes estavam duplicados entre TableRowAdmin,
 * TableRowCliente, EnsaioCard, getStatusInfo (ensaios/utils.jsx) e banners.
 *
 * Regra: nenhuma tela deve declarar estas constantes localmente — importe daqui.
 */

// ── Cores de ação (botões inline com style) ─────────────────────────────────
export const ACTION_COLORS = {
  APPROVE: '#566E3D', // verde-oliva escuro — aprovar / assinar
  REJECT: '#800020',  // bordô — reprovar
  EDIT: '#00233B',    // navy — editar
};

// ── Texto do diálogo de assinatura eletrônica ────────────────────────────────
export const SIGN_DIALOG = {
  title: 'Confirmar assinatura digital',
  confirmLabel: 'Assinar registro',
};

/** Monta a descrição padrão do diálogo de assinatura para um registro. */
export const buildSignDescription = (ensaio) =>
  `Confirma a assinatura digital do registro "${ensaio?.sample_id || ensaio?.id}"?`;

// ── Classes de badge de status de workflow ──────────────────────────────────
// Usadas por getStatusInfo (ensaios/utils.jsx). Centralizadas para que
// qualquer consumidor (tabelas, cards, relatórios) use as mesmas classes.
export const STATUS_BADGE_CLASSES = {
  EXECUCAO: 'bg-blue-100/80 text-secondary border border-blue-300/50 hover:bg-blue-200/80 hover:border-blue-400/50 transition-colors',
  ASSINADO: 'bg-muted/10 text-foreground border border-border/30 hover:bg-muted/20 hover:border-border/40 transition-colors',
  APROVADO: 'bg-green-100 text-green-700 border border-green-300/50 hover:bg-green-200 hover:border-green-400/50 transition-colors',
  REPROVADO: 'bg-red-100 text-destructive border border-red-300/50 hover:bg-red-200 hover:border-red-400/50 transition-colors',
  FINALIZADO: 'bg-indigo-100 text-indigo-700 border border-indigo-300/50 hover:bg-indigo-200 hover:border-indigo-400/50 transition-colors',
  PENDENTE_REJEITADO: 'bg-orange-100/80 text-orange-800 border border-border/50 hover:bg-orange-200/80 hover:border-orange-400/50 transition-colors',
  PENDENTE: 'bg-yellow-100 text-yellow-700 border border-yellow-300/50 hover:bg-yellow-200 hover:border-yellow-400/50 transition-colors',
};

// ── Textos de status ────────────────────────────────────────────────────────
export const STATUS_LABELS = {
  RASCUNHO: 'Rascunho',
  EXECUCAO: 'Execução',
  ASSINADO: 'Assinado',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
  FINALIZADO: 'Finalizado',
  PENDENTE: 'Pendente',
};

// ── Badge offline ────────────────────────────────────────────────────────────
export const OFFLINE_BADGE_LABEL = 'Aguardando sincronização';