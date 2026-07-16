/**
 * offlineSimulation.js
 * Utilitário central para simulação manual de modo offline.
 *
 * Permite que usuários (e automação de testes) alternem o app para
 * modo offline sem depender de DevTools ou alteração de rede real.
 * O estado é persistido em localStorage e propagado via eventos
 * window 'online'/'offline', que os hooks existentes já escutam.
 */

const STORAGE_KEY = 'aevias_offline_simulation';

export function getOfflineSimulation() {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Retorna true se o app deve se comportar como offline — seja por
 * simulação manual ou por perda real de conexão (navigator.onLine).
 */
export function isEffectivelyOffline() {
  if (getOfflineSimulation()) return true;
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

export function setOfflineSimulation(active) {
  try {
    if (active) {
      window.localStorage.setItem(STORAGE_KEY, 'true');
      window.dispatchEvent(new Event('offline'));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event('online'));
    }
  } catch {
    /* noop */
  }
}

export function toggleOfflineSimulation() {
  setOfflineSimulation(!getOfflineSimulation());
}