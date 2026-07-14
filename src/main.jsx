import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import ErrorBoundary from '@/components/ErrorBoundary'
import '@/index.css'
import { resolveInitialTheme, THEMES } from '@/utils/themeStorage'
import { initObservability } from '@/utils/observabilityInit'

// Inicializa a pipeline de observabilidade antes do primeiro render.
// Configura o sink estruturado + handlers globais (window.onerror, unhandledrejection).
initObservability();

// Registra o service worker para o app funcionar offline (código das telas
// fica salvo no dispositivo). Apenas em produção — em dev o Vite serve módulos.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Aplica o tema salvo antes do primeiro render para evitar "flash" de tema errado.
const initialTheme = resolveInitialTheme({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  matchMedia: typeof window !== 'undefined' ? window.matchMedia?.bind(window) : undefined,
});
document.documentElement.classList.toggle('dark', initialTheme === THEMES.DARK);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)