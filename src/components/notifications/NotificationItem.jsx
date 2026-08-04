import React from "react";
import { XCircle, MessageSquare, PenLine, X } from "lucide-react";
import { ENSAIO_CONFIG } from "@/components/ensaios/ensaioMappers";
import { getNotificationDisplay } from "@/utils/notificationRouting";

const DISPLAY_NAMES = { RelatorioNC: "Relatório de NC", BugReport: "Chamado" };
const ICONS = { reprovacao: XCircle, resposta: MessageSquare, assinatura: PenLine };

export default function NotificationItem({ notification, onRead, onDelete }) {
  const name = ENSAIO_CONFIG[notification.entity_name]?.name
    || DISPLAY_NAMES[notification.entity_name]
    || notification.entity_name;
  const display = getNotificationDisplay(notification, name);
  const Icon = ICONS[display.icon] || XCircle;

  return (
    <div
      className="relative w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-black/5 transition-colors"
      style={{ borderColor: "var(--color-border)" }}
    >
      <button
        onClick={() => onRead(notification)}
        className="w-full text-left"
      >
      <div className="flex items-start gap-2 pr-6">
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
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(notification); }}
          aria-label="Excluir notificação"
          className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-md hover:bg-black/10"
          style={{ color: "var(--color-text-muted)" }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}