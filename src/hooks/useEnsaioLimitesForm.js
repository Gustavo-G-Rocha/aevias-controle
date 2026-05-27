/**
 * Hook de formulário para EnsaioLimites.
 * Gerencia handlers de mudança de campos.
 */
import { useCallback } from 'react';

export function useEnsaioLimitesForm(data, onChange) {
  const set = useCallback((field, value) => {
    onChange({ ...data, [field]: value });
  }, [data, onChange]);

  const setNested = useCallback((field, index, subfield, value) => {
    const arr = [...(data[field] || [])];
    arr[index] = { ...arr[index], [subfield]: value };
    onChange({ ...data, [field]: arr });
  }, [data, onChange]);

  return { set, setNested };
}