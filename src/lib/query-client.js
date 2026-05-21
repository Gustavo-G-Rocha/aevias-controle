import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 3 * 60 * 1000,   // 3 minutos — dados são "frescos" por 3 min
      gcTime: 10 * 60 * 1000,     // 10 minutos — cache mantido em memória por 10 min
    },
  },
});