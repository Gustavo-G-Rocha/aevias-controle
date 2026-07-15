/**
 * logger.js
 * Logging centralizado com gate de ambiente.
 * Em produção (build) as chamadas são no-ops; em desenvolvimento repassam ao console,
 * evitando exposição de detalhes internos no console do navegador em produção.
 */
const isDev = import.meta.env?.DEV === true;

export const createLogger = (enabled = false) => ({
  log: (...args) => {
    if (enabled) console.log(...args);
  },
  error: (...args) => {
    if (enabled) console.error(...args);
  },
  warn: (...args) => {
    if (enabled) console.warn(...args);
  },
  info: (...args) => {
    if (enabled) console.info(...args);
  },
});

export const logger = createLogger(isDev);

export default logger;