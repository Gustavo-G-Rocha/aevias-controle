import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Sincroniza modais/drawers com o histórico do Router: cada modal aberto
 * empilha uma entrada no history; o botão "voltar" fecha o modal do topo
 * em vez de sair da rota atual. Fechamento programático (X, ESC, ação)
 * consome a entrada correspondente para não deixar estados fantasma.
 */
const stack = [];
let listenerInstalled = false;
let suppressNextPop = 0;
let nextId = 1;

function installListener() {
  if (listenerInstalled || typeof window === "undefined") return;
  listenerInstalled = true;
  window.addEventListener("popstate", () => {
    if (suppressNextPop > 0) {
      suppressNextPop -= 1;
      return;
    }
    const entry = stack.pop();
    if (entry) entry.close();
  });
}

export function useModalHistory(open, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    installListener();
    const id = nextId++;
    const entry = {
      id,
      popped: false,
      close: () => {
        entry.popped = true;
        closeRef.current?.();
      },
    };
    stack.push(entry);
    try {
      window.history.pushState(
        { ...(window.history.state || {}), __modalId: id },
        ""
      );
    } catch {
      // pushState pode falhar em contextos restritos — modal segue funcional
    }
    return () => {
      const i = stack.indexOf(entry);
      if (i !== -1) stack.splice(i, 1);
      // Só consome a entrada se ela ainda for o topo do history —
      // se uma navegação já ocorreu, não voltar (evitaria corrida de rotas).
      if (!entry.popped && window.history.state?.__modalId === id) {
        suppressNextPop += 1;
        window.history.back();
      }
    };
  }, [open]);
}

/**
 * Adapta componentes Radix/vaul (controlados ou não) para o useModalHistory.
 * Retorna [isOpen, handleOpenChange] prontos para passar ao Root.
 */
export function useHistoryControlledOpen({ open, defaultOpen, onOpenChange }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;

  const handleOpenChange = useCallback(
    (value) => {
      if (!isControlled) setUncontrolledOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  useModalHistory(isOpen, () => handleOpenChange(false));

  return [isOpen, handleOpenChange];
}