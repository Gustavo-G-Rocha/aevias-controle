import { lazy } from 'react';

const RELOAD_FLAG = 'chunk_reload_attempted';

/**
 * lazy() resiliente a deploys: quando um novo deploy invalida os chunks
 * com hash antigos, o import dinâmico da rota falha ("Failed to fetch
 * dynamically imported module"). Aqui recarregamos a página UMA vez para
 * buscar o index novo; se falhar de novo, o erro borbulha normalmente.
 */
export function lazyWithRetry(importer) {
  return lazy(async () => {
    try {
      const module = await importer();
      sessionStorage.removeItem(RELOAD_FLAG);
      return module;
    } catch (error) {
      if (!sessionStorage.getItem(RELOAD_FLAG)) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
        // Nunca resolve — a página está recarregando
        return new Promise(() => {});
      }
      throw error;
    }
  });
}