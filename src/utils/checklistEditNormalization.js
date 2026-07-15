const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Normaliza um checklist carregado para edição a partir do estado inicial.
 * Objetos de primeiro nível recebem deep-merge e arrays complexos podem
 * fornecer normalizadores específicos da entidade.
 */
export function normalizeChecklistEditData(initialForm, savedData, arrayNormalizers = {}) {
  const normalized = { ...initialForm, ...savedData };

  for (const key of Object.keys(initialForm)) {
    if (isPlainObject(initialForm[key])) {
      normalized[key] = {
        ...initialForm[key],
        ...(isPlainObject(savedData[key]) ? savedData[key] : {}),
      };
    }
  }

  for (const [field, normalizeArray] of Object.entries(arrayNormalizers)) {
    normalized[field] = normalizeArray(savedData[field], initialForm[field]);
  }

  normalized.data = savedData.data
    ? new Date(savedData.data).toISOString().split('T')[0]
    : initialForm.data;
  normalized.fotos = Array.isArray(savedData.fotos) ? savedData.fotos : [];

  return normalized;
}