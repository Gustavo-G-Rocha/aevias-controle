import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Optimistic UI para ações de salvar: exibe feedback de sucesso
 * imediatamente ao clicar, antes do retorno da rede. Se a promise
 * do handler rejeitar, o estado de sucesso é revertido na hora
 * (o tratamento de erro/toast continua a cargo do handler original).
 */
export function useOptimisticSave(onSave, { duration = 2000 } = {}) {
  const [showSaved, setShowSaved] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const revert = useCallback(() => {
    clearTimeout(timerRef.current);
    setShowSaved(false);
  }, []);

  const handleClick = useCallback((e) => {
    // Feedback instantâneo de sucesso
    setShowSaved(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowSaved(false), duration);

    let result;
    try {
      result = onSave?.(e);
    } catch (err) {
      revert();
      throw err;
    }
    if (result && typeof result.then === "function") {
      // Reverte o feedback se a operação falhar
      result.then(undefined, revert);
    }
    return result;
  }, [onSave, duration, revert]);

  return { showSaved, handleClick };
}