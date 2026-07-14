import { useEffect, useCallback, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, FolderOpen, Grid, LayoutDashboard, Settings, ChevronUp } from "lucide-react";
import { createPageUrl } from "@/utils";
import { SESSION_KEYS, getTabZone } from "@/lib/layoutConstants";
import MobileNavSheet from "./MobileNavSheet";

const NAV_ITEMS = [
{ label: "Início", icon: Home, path: "/", zone: "home" },
{ label: "Obras", icon: FolderOpen, path: createPageUrl("Regionais"), zone: "regionais" },
{ label: "Projetos", icon: Grid, path: createPageUrl("Projects"), zone: "projects" },
{ label: "Registros", icon: LayoutDashboard, path: createPageUrl("MeusEnsaios"), zone: "registros" },
{ label: "Ajustes", icon: Settings, path: createPageUrl("Settings"), zone: "settings" }];


export default function BottomNav({ userAccessLevel, canManageSystem, pendingTransfers }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const touchStartY = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartY.current === null) return;
    if (touchStartY.current - e.touches[0].clientY > 30) {
      touchStartY.current = null;
      setSheetOpen(true);
    }
  }, []);

  useEffect(() => {
    const zone = getTabZone(location.pathname);
    if (zone) sessionStorage.setItem(`${SESSION_KEYS.TAB_STACK_PREFIX}${zone}`, location.pathname + location.search);
  }, [location]);

  const handleTabPress = useCallback((item) => {
    if (item.zone === "settings") {
      navigate(item.path);
      return;
    }
    const currentZone = getTabZone(location.pathname);
    if (currentZone === item.zone) {
      navigate(item.path);
    } else {
      const saved = sessionStorage.getItem(`${SESSION_KEYS.TAB_STACK_PREFIX}${item.zone}`);
      navigate(saved || item.path);
    }
  }, [location.pathname, navigate]);

  return (
    <>
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex flex-col"
      style={{ backgroundColor: 'var(--color-sidebar-bg)', borderTop: '1px solid var(--color-sidebar-border)', paddingBottom: "env(safe-area-inset-bottom)" }}>

      <button
        type="button"
        aria-label="Abrir menu completo"
        onClick={() => setSheetOpen(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="w-full flex flex-col items-center gap-0.5 pt-1.5 pb-1 active:bg-white/5">
        <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-sidebar-text-muted)' }} />
        <span className="block w-12 h-1 rounded-full" style={{ backgroundColor: 'var(--color-sidebar-text-muted)' }} />
        <span className="text-[10px] font-medium" style={{ color: 'var(--color-sidebar-text-muted)' }}>Menu</span>
      </button>

      <div className="flex items-center justify-around">
      {NAV_ITEMS.map((item) => {
        const isActive = item.zone === "settings"
          ? location.pathname.toLowerCase().startsWith("/settings")
          : getTabZone(location.pathname) === item.zone;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => handleTabPress(item)}
            className="flex flex-col items-center gap-1 py-3 px-4 transition-colors select-none rounded-xl"
            style={{
              color: isActive ? 'var(--color-secondary)' : 'var(--color-sidebar-text-muted)',
              backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent'
            }}>
            
            <item.icon className="w-5 h-5" style={{ color: isActive ? 'var(--color-secondary)' : 'var(--color-sidebar-text-muted)' }} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>);

      })}
      </div>
    </nav>
    <MobileNavSheet
      open={sheetOpen}
      onOpenChange={setSheetOpen}
      userAccessLevel={userAccessLevel}
      canManageSystem={canManageSystem}
      pendingTransfers={pendingTransfers} />
    </>);

}