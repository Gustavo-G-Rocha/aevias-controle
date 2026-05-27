/**
 * Funções puras para RelatorioBoletimSondagemTrado.
 * Utilitários para formatação, transformação e cálculo de dados.
 */

/**
 * Formata data ISO para padrão pt-BR (UTC).
 * @param {string|null} date - Data ISO
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return '-';
  }
};

/**
 * Formata data/hora para pt-BR com timezone São Paulo.
 * @param {string|null} dateTime - Data/hora ISO
 * @returns {string}
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return 'N/A';
  try {
    const normalized =
      !dateTime.endsWith('Z') &&
      !dateTime.includes('+') &&
      !dateTime.includes('-', 10)
        ? dateTime + 'Z'
        : dateTime;
    return new Date(normalized).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Formata número com N decimais.
 * @param {number|null|undefined} value - Valor a formatar
 * @param {number} decimals - Quantidade de decimais (padrão: 2)
 * @returns {string}
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  try {
    return parseFloat(value).toFixed(decimals);
  } catch {
    return '-';
  }
};

/**
 * Obtém logo regional com fallback padrão.
 * @param {Object|null} regional
 * @returns {string}
 */
export const getLogoUrl = (regional) =>
  regional?.logo_url ||
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

/**
 * Calcula umidade a partir de dados de cápsula.
 * @param {number|null} capsulaUmido - Massa cápsula + solo úmido
 * @param {number|null} capsulaSeco - Massa cápsula + solo seco
 * @param {number|null} capsula - Massa cápsula
 * @returns {number|null}
 */
export const calcularUmidade = (capsulaUmido, capsulaSeco, capsula) => {
  if (capsulaUmido == null || capsulaSeco == null || capsula == null) {
    return null;
  }
  const soloSeco = capsulaSeco - capsula;
  if (soloSeco <= 0) return null;
  return (((capsulaUmido - capsulaSeco) / soloSeco) * 100);
};

/**
 * Calcula média de duas umidades.
 * @param {number|null} umidade1
 * @param {number|null} umidade2
 * @returns {string}
 */
export const calcularMediaUmidade = (umidade1, umidade2) => {
  if (umidade1 != null && umidade2 != null) {
    return `${((umidade1 + umidade2) / 2).toFixed(2)}%`;
  }
  if (umidade1 != null) {
    return `${formatNumber(umidade1)}%`;
  }
  return '-';
};

/**
 * Obtém título da face de classificação.
 * @param {string|null} faceClassificacao
 * @returns {string}
 */
export const getFaceTitle = (faceClassificacao) => {
  return faceClassificacao ? `Face: ${faceClassificacao}` : 'Classificação';
};

/**
 * Divide array em chunks de tamanho específico.
 * @param {Array} arr
 * @param {number} size
 * @returns {Array<Array>}
 */
export const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/**
 * Obtém operador/laboratorista.
 * @param {string|null} operador
 * @param {string|null} laboratoristaNome
 * @returns {string}
 */
export const getOperador = (operador, laboratoristaNome) => {
  return operador || laboratoristaNome || '-';
};

/**
 * Obtém cliente, priorizando boletim.cliente sobre regional.cliente.
 * @param {string|null} boletimCliente
 * @param {string|null} regionalCliente
 * @returns {string}
 */
export const getCliente = (boletimCliente, regionalCliente) => {
  return boletimCliente || regionalCliente || '-';
};