/**
 * Roteamento e exibição de notificações in-app.
 *
 * Funções puras — cada tipo de notificação define para onde o clique
 * leva e como o item é exibido (ícone, cor, título).
 */
import { getReportLink } from "@/components/ensaios/ensaioMappers";

/** Resolve o destino do clique de uma notificação. */
export function getNotificationLink(notification) {
  if (!notification) return "/";
  const { tipo, entity_name, entity_id } = notification;
  if (tipo === "chamado_respondido" || entity_name === "BugReport") {
    return entity_id ? `/ReportarErro?chamado=${entity_id}` : "/ReportarErro";
  }
  if (entity_name === "RelatorioNC") {
    return `/RelatorioNC?id=${entity_id}`;
  }
  return getReportLink({ entityType: entity_name, id: entity_id });
}

/**
 * Retorna a configuração visual do item de notificação.
 * `entityDisplayName` é o nome amigável já resolvido da entidade.
 */
export function getNotificationDisplay(notification, entityDisplayName) {
  const name = entityDisplayName || notification?.entity_name || "Registro";
  switch (notification?.tipo) {
    case "chamado_respondido":
      return {
        icon: "resposta",
        colorClass: "text-blue-600",
        title: "Seu chamado recebeu uma resposta",
        messagePrefix: "Resposta: ",
      };
    case "assinatura_pendente":
      return {
        icon: "assinatura",
        colorClass: "text-amber-600",
        title: `${name} aguarda sua assinatura`,
        messagePrefix: "",
      };
    case "reprovacao":
    default:
      return {
        icon: "reprovacao",
        colorClass: "text-red-600",
        title: `${name} foi reprovado`,
        messagePrefix: "Motivo: ",
      };
  }
}