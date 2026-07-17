import { useEffect, useCallback, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, FolderOpen, Grid, LayoutDashboard, Menu } from "lucide-react";
import { createPageUrl } from "@/utils";
import { SESSION_KEYS, getTabZone } from "@/lib/layoutConstants";
import MobileNavSheet from "./MobileNavSheet";

const NAV_ITEMS = [
{ label: "Início", icon: Home, path: "/", zone: "home" },
{ label: "Obras", icon: FolderOpen, path: createPageUrl("Regionais"), zone: "regionais" },
{ label: "Menu", icon: Menu, path: "__menu__", zone: "menu" },
{ label: "Projetos", icon: Grid, path: createPageUrl("Projects"), zone: "projects" },
{ label: "Registros", icon: LayoutDashboard, path: createPageUrl("MeusEnsaios"), zone: "registros" }];

const readSessionPath = (key) => {
  try { return window.sessionStorage?.getItem(key) || null; } catch { return null; }
};

const saveSessionPath = (key, value) => {
  try { window.sessionStorage?.setItem(key, value); } catch { /* storage indisponível no APK */ }
};


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
    if (zone) saveSessionPath(`${SESSION_KEYS.TAB_STACK_PREFIX}${zone}`, location.pathname + location.search);
  }, [location]);

  const handleTabPress = useCallback((item) => {
    if (item.zone === "menu") {
      setSheetOpen(true);
      return;
    }
    const currentZone = getTabZone(location.pathname);
    if (currentZone === item.zone) {
      navigate(item.path);
    } else {
      const saved = readSessionPath(`${SESSION_KEYS.TAB_STACK_PREFIX}${item.zone}`);
      navigate(saved || item.path);
    }
  }, [location.pathname, navigate]);

  return (
    <>
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex flex-col"
      style={{ backgroundColor: 'var(--color-sidebar-bg)', paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}>

      <div className="flex items-center justify-around"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.zone !== "menu" && getTabZone(location.pathname) === item.zone;
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