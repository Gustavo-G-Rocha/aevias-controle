import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { resolveInitialTheme, THEMES } from '@/utils/themeStorage'

// Aplica o tema salvo antes do primeiro render para evitar "flash" de tema errado.
const initialTheme = resolveInitialTheme({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  matchMedia: typeof window !== 'undefined' ? window.matchMedia?.bind(window) : undefined,
});
document.documentElement.classList.toggle('dark', initialTheme === THEMES.DARK);

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)