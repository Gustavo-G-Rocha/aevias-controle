import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getReportLink } from "@/components/ensaios/ensaioMappers";
import NotificationPanel from "./NotificationPanel";

export default function NotificationAgent() {
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

  const handleRead = async (n) => {
    setNotifications((prev) => prev.filter((p) => p.id !== n.id));
    if (notifications.length <= 1) setOpen(false);
    base44.entities.Notificacao.update(n.id, { status: "lida" }).catch(() => {});
    const link = n.entity_name === "RelatorioNC"
      ? `/RelatorioNC?id=${n.entity_id}`
      : getReportLink({ entityType: n.entity_name, id: n.entity_id });
    navigate(link);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col items-end gap-2 print:hidden">
      {open && (
        <NotificationPanel
          notifications={notifications}
          onRead={handleRead}
          onClose={() => setOpen(false)}
        />
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notificações (${notifications.length} pendentes)`}
        className="relative h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-text-on-primary)" }}
      >
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center justify-center">
          {notifications.length}
        </span>
      </button>
    </div>
  );
}