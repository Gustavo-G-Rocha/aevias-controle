import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook de logout automático por inatividade.
 *
 * O que este hook faz (camada cliente):
 *  - Monitora atividade do usuário (clique, toque, digitação, scroll)
 *  - Dispara aviso prévio antes do timeout (ex.: 60s antes)
 *  - Executa logout automático após período configurado sem interação
 *  - Revalida ao retornar do segundo plano (visibilitychange) — se o tempo
 *    decorrido desde a última atividade excede o timeout, desloga imediatamente
 *
 * O que NÃO faz (controlado pela plataforma Base44):
 *  - Definir tempo de expiração do access_token
 *  - Rotacionar refresh_token
 *  - Armazenar token em httpOnly cookie
 *
 * @param {Object} options
 * @param {boolean} options.enabled - Só ativo quando autenticado
 * @param {number} options.timeoutMs - Tempo total de inatividade antes do logout (default: 15 min)
 * @param {number} options.warningMs - Tempo antes do timeout para exibir aviso (default: 60s)
 * @param {Function} options.onTimeout - Callback executado quando o timeout expira
 */
export function useSessionTimeout({
  enabled = false,
  timeoutMs = 15 * 60 * 1000,
  warningMs = 60 * 1000,
  onTimeout,
}) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const lastActivityRef = useRef(Date.now());
  const timeoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);

  // Mantém a ref atualizada sem recriar timers
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const clearTimers = useCallback(() => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const executeLogout = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    setCountdown(0);
    if (onTimeoutRef.current) {
      onTimeoutRef.current();
    }
  }, [clearTimers]);

  const startCountdown = useCallback(() => {
    const warningAt = Date.now();
    const expiresAt = warningAt + warningMs;
    setCountdown(Math.ceil(warningMs / 1000));

    countdownIntervalRef.current = setInterval(() => {
      const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
      if (remaining <= 0) {
        executeLogout();
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }, [warningMs, executeLogout]);

  const resetTimers = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    setCountdown(0);

    if (!enabled) return;

    lastActivityRef.current = Date.now();

    // Timer de aviso: dispara `warningMs` antes do timeout total
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, timeoutMs - warningMs);

    // Timer de timeout absoluto (caso o usuário ignore o aviso)
    timeoutTimerRef.current = setTimeout(() => {
      executeLogout();
    }, timeoutMs);
  }, [enabled, timeoutMs, warningMs, clearTimers, startCountdown, executeLogout]);

  // Listener de atividade do usuário
  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    resetTimers();

    let throttled = false;
    const handleActivity = () => {
      if (throttled) return;
      throttled = true;
      requestAnimationFrame(() => { throttled = false; });
      // Só reseta se não estiver no estado de aviso (o aviso tem seus próprios controles)
      if (!showWarning) {
        lastActivityRef.current = Date.now();
        // Reagendar timers sem limpar o countdown se já estiver contando
        clearTimeout(warningTimerRef.current);
        clearTimeout(timeoutTimerRef.current);
        warningTimerRef.current = setTimeout(() => {
          setShowWarning(true);
          startCountdown();
        }, timeoutMs - warningMs);
        timeoutTimerRef.current = setTimeout(() => {
          executeLogout();
        }, timeoutMs);
      }
    };

    const events = ['mousedown', 'touchstart', 'keydown', 'scroll', 'mousemove'];
    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearTimers();
    };
  }, [enabled, timeoutMs, warningMs]);

  // Listener de visibilitychange — revalida ao retornar do segundo plano
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= timeoutMs) {
          // Tempo suficiente passou em segundo plano — deslogar
          executeLogout();
        } else if (elapsed >= timeoutMs - warningMs) {
          // Está na janela de aviso — mostrar aviso imediatamente
          setShowWarning(true);
          startCountdown();
        } else {
          // Ainda dentro do período seguro — resetar timers
          resetTimers();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, timeoutMs, warningMs, executeLogout, startCountdown, resetTimers]);

  const extendSession = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  const logoutNow = useCallback(() => {
    executeLogout();
  }, [executeLogout]);

  return {
    showWarning,
    countdown,
    extendSession,
    logoutNow,
  };
}