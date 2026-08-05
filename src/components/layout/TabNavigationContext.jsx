import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useLocation, useNavigationType, useNavigate } from "react-router-dom";
import { SESSION_KEYS, TAB_ZONES, getTabZone } from "@/lib/layoutConstants";

/**
 * Tab Navigation Context
 *
 * Provides per-zone navigation stack management (like native mobile tabs):
 * - Each bottom-tab zone maintains its own history stack in sessionStorage.
 * - Switching tabs restores the target zone's stack top (preserving its history).
 * - Pressing the active tab resets to the zone root.
 * - `popZone` navigates back within the current zone's stack.
 * - `direction` exposes the intended animation direction ('push'|'pop'|'switch'|'fade')
 *   so PageTransition can animate correctly (slide vs fade) without guessing
 *   from the global navigation type.
 */

const TabNavigationContext = createContext(null);

const MAX_STACK_DEPTH = 10;
const TAB_DIR_STATE_KEY = "__tabDir";

const readSessionStack = (key) => {
  try {
    const raw = window.sessionStorage?.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveSessionStack = (key, stack) => {
  try {
    window.sessionStorage?.setItem(key, JSON.stringify(stack));
  } catch {
    /* storage indisponível no APK */
  }
};

/**
 * Computes the animation direction synchronously during render.
 *
 * Priority:
 *  1. Browser back (POP) within same zone → 'pop'
 *  2. Explicit override from programmatic navigation → that value
 *  3. First render → 'fade'
 *  4. Not in a tab zone → 'fade'
 *  5. Zone changed (tab switch) → 'switch'
 *  6. REPLACE → 'fade'
 *  7. Default (PUSH) → 'push'
 */
function computeDirection(
  navigationType,
  didInit,
  currentZone,
  prevZone,
  stateOverride
) {
  if (navigationType === "POP" && prevZone === currentZone) return "pop";
  if (stateOverride) return stateOverride;
  if (!didInit) return "fade";
  if (!currentZone) return "fade";
  if (prevZone !== currentZone) return "switch";
  if (navigationType === "REPLACE") return "fade";
  return "push";
}

export function TabNavigationProvider({ children }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const navigate = useNavigate();

  const currentPath = location.pathname + location.search;
  const currentZone = getTabZone(location.pathname);
  const stateOverride = location.state?.[TAB_DIR_STATE_KEY] || null;

  const prevZoneRef = useRef(currentZone);
  const didInitRef = useRef(false);

  // Compute direction synchronously — refs still hold previous-render values
  const direction = computeDirection(
    navigationType,
    didInitRef.current,
    currentZone,
    prevZoneRef.current,
    stateOverride
  );

  // Side effects: update per-zone stacks and refs (after render)
  useEffect(() => {
    if (!currentZone) {
      didInitRef.current = true;
      prevZoneRef.current = currentZone;
      return;
    }

    const key = `${SESSION_KEYS.TAB_STACK_PREFIX}${currentZone}`;

    if (!didInitRef.current) {
      // First render — initialize or reconcile stack
      const stack = readSessionStack(key);
      if (stack.length === 0) {
        saveSessionStack(key, [currentPath]);
      } else if (stack[stack.length - 1] !== currentPath) {
        stack.push(currentPath);
        if (stack.length > MAX_STACK_DEPTH) stack.shift();
        saveSessionStack(key, stack);
      }
      didInitRef.current = true;
    } else if (prevZoneRef.current !== currentZone) {
      // Zone switch — ensure current path is at top (restored by switchToZone)
      const stack = readSessionStack(key);
      if (stack.length === 0) {
        saveSessionStack(key, [currentPath]);
      }
    } else if (navigationType === "POP") {
      // Back navigation — pop the stack
      const stack = readSessionStack(key);
      if (stack.length > 1) {
        stack.pop();
        saveSessionStack(key, stack);
      }
    } else if (navigationType === "REPLACE") {
      const stack = readSessionStack(key);
      if (stack.length > 0) {
        stack[stack.length - 1] = currentPath;
      } else {
        stack.push(currentPath);
      }
      saveSessionStack(key, stack);
    } else {
      // PUSH — add to stack if different from top
      const stack = readSessionStack(key);
      if (stack[stack.length - 1] !== currentPath) {
        stack.push(currentPath);
        if (stack.length > MAX_STACK_DEPTH) stack.shift();
        saveSessionStack(key, stack);
      }
    }

    prevZoneRef.current = currentZone;
  }, [currentZone, currentPath, navigationType]);

  const switchToZone = useCallback(
    (zone) => {
      const zoneRoot = TAB_ZONES[zone]?.[0] || "/";
      const key = `${SESSION_KEYS.TAB_STACK_PREFIX}${zone}`;
      const stack = readSessionStack(key);
      const target = stack.length > 0 ? stack[stack.length - 1] : zoneRoot;
      navigate(target, { state: { [TAB_DIR_STATE_KEY]: "switch" } });
    },
    [navigate]
  );

  const resetZone = useCallback(
    (zone) => {
      const zoneRoot = TAB_ZONES[zone]?.[0] || "/";
      const key = `${SESSION_KEYS.TAB_STACK_PREFIX}${zone}`;
      saveSessionStack(key, [zoneRoot]);
      if (currentPath !== zoneRoot) {
        navigate(zoneRoot, { state: { [TAB_DIR_STATE_KEY]: "fade" } });
      }
    },
    [navigate, currentPath]
  );

  const popZone = useCallback(() => {
    if (!currentZone) return false;
    const key = `${SESSION_KEYS.TAB_STACK_PREFIX}${currentZone}`;
    const stack = readSessionStack(key);
    if (stack.length > 1) {
      stack.pop();
      saveSessionStack(key, stack);
      const target = stack[stack.length - 1];
      navigate(target, { state: { [TAB_DIR_STATE_KEY]: "pop" } });
      return true;
    }
    return false;
  }, [currentZone, navigate]);

  const value = useMemo(
    () => ({ currentZone, direction, switchToZone, resetZone, popZone }),
    [currentZone, direction, switchToZone, resetZone, popZone]
  );

  return (
    <TabNavigationContext.Provider value={value}>
      {children}
    </TabNavigationContext.Provider>
  );
}

export function useTabNavigation() {
  return useContext(TabNavigationContext);
}