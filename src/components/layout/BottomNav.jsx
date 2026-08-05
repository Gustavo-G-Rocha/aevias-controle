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

const readSessionStack = (key) => {
  try {
    const raw = window.sessionStorage?.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveSessionStack = (key, stack) => {
  try { window.sessionStorage?.setItem(key, JSON.stringify(stack)); } catch { /* storage indisponível no APK */ }
};

const MAX_STACK_DEPTH = 10;


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
    if (!zone) return;
    const key = `${SESSION_KEYS.TAB_STACK_PREFIX}${zone}`;
    const stack = readSessionStack(key);
    const current = location.pathname + location.search;
    // Empilha apenas se for diferente do topo (evita duplicatas consecutivas)
    if (stack[stack.length - 1] !== current) {
      stack.push(current);
      if (stack.length > MAX_STACK_DEPTH) stack.shift();
      saveSessionStack(key, stack);
    }
  }, [location]);

  const handleTabPress = useCallback((item) => {
    if (item.zone === "menu") {
      setSheetOpen(true);
      return;
    }
    const key = `${SESSION_KEYS.TAB_STACK_PREFIX}${item.zone}`;
    const currentZone = getTabZone(location.pathname);
    if (currentZone === item.zone) {
      // Aba já ativa: limpa a pilha e volta para a raiz da zona
      saveSessionStack(key, [item.path]);
      if (location.pathname + location.search !== item.path) {
        navigate(item.path);
      }
    } else {
      // Troca de aba: restaura o topo da pilha da zona de destino (ou raiz)
      const stack = readSessionStack(key);
      navigate(stack[stack.length - 1] || item.path);
    }
  }, [location.pathname, location.search, navigate]);

  return (
    <>
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex flex-col bottom-nav-safe-area"
      style={{ backgroundColor: 'var(--color-sidebar-bg)' }}>

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