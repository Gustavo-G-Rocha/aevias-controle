import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      // CRÍTICO PARA OFFLINE: por padrão o React Query PAUSA queries quando
      // navigator.onLine é false — o queryFn nunca roda e o fallback para o
      // cache do IndexedDB (obras/regionais/projetos) nunca é executado.
      // 'always' garante que o queryFn rode offline e leia o cache local.
      networkMode: 'always',
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 3 * 60 * 1000,   // 3 minutos — dados são "frescos" por 3 min
      gcTime: 10 * 60 * 1000,     // 10 minutos — cache mantido em memória por 10 min
    },
    mutations: {
      networkMode: 'always',
    },
  },
});