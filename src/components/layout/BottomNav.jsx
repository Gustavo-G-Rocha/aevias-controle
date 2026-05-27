import { useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, FolderOpen, Grid, LayoutDashboard } from "lucide-react";
import { createPageUrl } from "@/utils";
import { SESSION_KEYS, getTabZone } from "@/lib/layoutConstants";

const NAV_ITEMS = [
{ label: "Início", icon: Home, path: "/", zone: "home" },
{ label: "Obras", icon: FolderOpen, path: createPageUrl("Regionais"), zone: "regionais" },
{ label: "Projetos", icon: Grid, path: createPageUrl("Projects"), zone: "projects" },
{ label: "Registros", icon: LayoutDashboard, path: createPageUrl("MeusEnsaios"), zone: "registros" }];


export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const zone = getTabZone(location.pathname);
    if (zone) sessionStorage.setItem(`${SESSION_KEYS.TAB_STACK_PREFIX}${zone}`, location.pathname + location.search);
  }, [location]);

  const handleTabPress = useCallback((item) => {
    const currentZone = getTabZone(location.pathname);
    if (currentZone === item.zone) {
      navigate(item.path);
    } else {
      const saved = sessionStorage.getItem(`${SESSION_KEYS.TAB_STACK_PREFIX}${item.zone}`);
      navigate(saved || item.path);
    }
  }, [location.pathname, navigate]);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around ml-64 bg-[hsl(var(--ring))]"
      style={{ backgroundColor: 'var(--color-sidebar-bg)', borderTop: '1px solid var(--color-sidebar-border)' }}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      
      {NAV_ITEMS.map((item) => {
        const isActive = getTabZone(location.pathname) === item.zone;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => handleTabPress(item)}
            className="flex flex-col items-center gap-1 py-3 px-6 transition-colors select-none"
            style={{ color: isActive ? 'var(--color-secondary)' : 'var(--color-sidebar-text-muted)' }}>
            
            <item.icon className="w-5 h-5" style={{ color: isActive ? 'var(--color-secondary)' : 'var(--color-sidebar-text-muted)' }} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>);

      })}
    </nav>);

}