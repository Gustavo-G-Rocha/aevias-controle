import React from "react";
import { Bell } from "lucide-react";
import { useNotificationContext } from "./NotificationProvider";
import NotificationPanel from "./NotificationPanel";

/**
 * Sino de notificações com contador dinâmico e painel dropdown.
 * variant="mobile"  → integrado no header móvel (sem fundo próprio)
 * variant="desktop" → fixo no canto superior direito (fundo primary)
 *
 * Não renderiza nada quando não há notificações pendentes.
 */
export default function NotificationBell({ variant = "desktop" }) {
  const { count, notifications, open, setOpen, handleRead, handleDelete } = useNotificationContext();
  const isMobile = variant === "mobile";

  return (
    <>
      {open && (
        <div
          className={`fixed z-[60] ${isMobile ? "top-14 right-2" : "top-16 right-4"}`}
        >
          <NotificationPanel
            notifications={notifications}
            onRead={handleRead}
            onDelete={handleDelete}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notificações${count > 0 ? ` (${count} pendentes)` : ""}`}
        className={`relative flex items-center justify-center transition-transform hover:scale-105 ${
          isMobile ? "h-9 w-9 rounded-lg" : "h-11 w-11 rounded-full shadow-lg"
        }`}
        style={
          isMobile
            ? { color: "var(--color-sidebar-text)" }
            : { backgroundColor: "var(--color-primary)", color: "var(--color-text-on-primary)" }
        }
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span
            className={`absolute rounded-full bg-red-600 text-white font-bold flex items-center justify-center ${
              isMobile
                ? "-top-0.5 -right-0.5 h-4 min-w-[16px] px-1 text-[10px]"
                : "-top-1 -right-1 h-5 min-w-[20px] px-1 text-xs"
            }`}
          >
            {count}
          </span>
        )}
      </button>
    </>
  );
}