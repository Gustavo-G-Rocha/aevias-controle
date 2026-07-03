/**
 * logger.js
 * Logging centralizado com gate de ambiente.
 * Em produção (build) as chamadas são no-ops; em desenvolvimento repassam ao console,
 * evitando exposição de detalhes internos no console do navegador em produção.
 */
const isDev = import.meta.env?.DEV ?? false;

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  error: (...args) => {
    if (isDev) console.error(...args);
  },
};

export default logger;