import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getNotificationLink } from "@/utils/notificationRouting";

const NotificationContext = createContext(null);
export const useNotificationContext = () => useContext(NotificationContext);

/**
 * Centraliza o estado das notificações in-app: busca inicial,
 * subscription em tempo real, e ação de "ler e navegar".
 * Renderiza apenas o provider — nenhum UI.
 */
export default function NotificationProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    base44.auth.me().then((u) => {
      if (!mounted || !u?.email) return;
      setUserEmail(u.email);
      base44.entities.Notificacao
        .filter({ user_email: u.email, status: "pendente" }, "-created_date", 20)
        .then((list) => { if (mounted) setNotifications(list); });
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    const unsubscribe = base44.entities.Notificacao.subscribe((event) => {
      const n = event.data;
      if (event.type === "create" && n?.user_email === userEmail && n?.status === "pendente") {
        setNotifications((prev) => [n, ...prev.filter((p) => p.id !== n.id)]);
      } else if (event.type === "update" && n) {
        setNotifications((prev) => n.status === "pendente"
          ? prev.map((p) => (p.id === n.id ? n : p))
          : prev.filter((p) => p.id !== n.id));
      } else if (event.type === "delete") {
        setNotifications((prev) => prev.filter((p) => p.id !== event.id));
      }
    });
    return unsubscribe;
  }, [userEmail]);

  const handleRead = useCallback((n) => {
    setNotifications((prev) => {
      const next = prev.filter((p) => p.id !== n.id);
      if (next.length === 0) setOpen(false);
      return next;
    });
    base44.entities.Notificacao.update(n.id, { status: "lida" }).catch(() => {});
    navigate(getNotificationLink(n));
  }, [navigate]);

  const handleDelete = useCallback((n) => {
    setNotifications((prev) => {
      const next = prev.filter((p) => p.id !== n.id);
      if (next.length === 0) setOpen(false);
      return next;
    });
    base44.entities.Notificacao.delete(n.id).catch(() => {});
  }, []);

  return (
    <NotificationContext.Provider value={{
      count: notifications.length,
      notifications,
      open,
      setOpen,
      handleRead,
      handleDelete,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}