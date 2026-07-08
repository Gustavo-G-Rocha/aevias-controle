import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  // Pré-empacota dependências para evitar 504 "Outdated Optimize Dep" em testes E2E.
  // Sem isso, páginas lazy-loaded (ex: EnsaioCAUQ) causam re-otimização sob demanda,
  // invalidando o cache anterior e quebrando o import dinâmico.
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react/jsx-runtime',
      'react-router-dom',
      '@tanstack/react-query',
      '@base44/sdk',
      'lucide-react',
      'class-variance-authority', 'clsx', 'tailwind-merge',
      'date-fns', 'moment',
      'lodash',
      'recharts',
      'framer-motion',
      'react-hook-form', '@hookform/resolvers', 'zod',
      'react-markdown',
      'react-quill',
      'react-leaflet',
      '@hello-pangea/dnd',
      'three',
      'sonner',
      'cmdk',
      'input-otp',
      'vaul',
      'html2canvas', 'jspdf', 'pdfjs-dist',
      'xlsx',
      'uuid',
      'axios',
      'canvas-confetti',
      'embla-carousel-react',
      'react-day-picker',
      'react-resizable-panels',
      'react-hot-toast',
      'next-themes',
    ],
  },
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true
    }),
    react(),
  ]
});