import { useEffect, useState } from 'react';

/**
 * Retorna um valor "debounced" — só atualiza após `delay` ms
 * sem novas alterações. Útil para adiar computações pesadas
 * disparadas por inputs de texto (ex.: filtragem de listas).
 */
export function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;