import React from "react";
import { XCircle } from "lucide-react";
import { ENSAIO_CONFIG } from "@/components/ensaios/ensaioMappers";

const DISPLAY_NAMES = { RelatorioNC: "Relatório de NC" };

export default function NotificationItem({ notification, onRead }) {
  const name = ENSAIO_CONFIG[notification.entity_name]?.name
    || DISPLAY_NAMES[notification.entity_name]
    || notification.entity_name;

  return (
    <button
      onClick={() => onRead(notification)}
      className="w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-black/5 transition-colors"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex items-start gap-2">
        <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {name} foi reprovado
          </p>
          {notification.message && (
            <p className="text-xs line-clamp-2" style={{ color: "var(--color-text-muted)" }}>
              Motivo: {notification.message}
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