import React from "react";
import { XCircle, MessageSquare, PenLine } from "lucide-react";
import { ENSAIO_CONFIG } from "@/components/ensaios/ensaioMappers";
import { getNotificationDisplay } from "@/utils/notificationRouting";

const DISPLAY_NAMES = { RelatorioNC: "Relatório de NC", BugReport: "Chamado" };
const ICONS = { reprovacao: XCircle, resposta: MessageSquare, assinatura: PenLine };

export default function NotificationItem({ notification, onRead }) {
  const name = ENSAIO_CONFIG[notification.entity_name]?.name
    || DISPLAY_NAMES[notification.entity_name]
    || notification.entity_name;
  const display = getNotificationDisplay(notification, name);
  const Icon = ICONS[display.icon] || XCircle;

  return (
    <button
      onClick={() => onRead(notification)}
      className="w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-black/5 transition-colors"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex items-start gap-2">
        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${display.colorClass}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {display.title}
          </p>
          {notification.message && (
            <p className="text-xs line-clamp-2" style={{ color: "var(--color-text-muted)" }}>
              {display.messagePrefix}{notification.message}
            </p>
          )}
          <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-subtle)" }}>
            {new Date(notification.created_date).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>
    </button>
  );
}