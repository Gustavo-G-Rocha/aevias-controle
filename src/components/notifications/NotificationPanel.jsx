import React from "react";
import { X } from "lucide-react";
import NotificationItem from "./NotificationItem";

export default function NotificationPanel({ notifications, onRead, onClose }) {
  return (
    <div
      className="w-80 max-w-[calc(100vw-2rem)] max-h-96 flex flex-col rounded-xl shadow-xl border overflow-hidden"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Atualizações
        </p>
        <button
          onClick={onClose}
          aria-label="Fechar notificações"
          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-black/5"
          style={{ color: "var(--color-text-muted)" }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-y-auto">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onRead={onRead} />
        ))}
      </div>
    </div>
  );
}