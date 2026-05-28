/**
 * Lógica pura para RelatorioCAUQTabelas
 */

/**
 * Determina padding condicionado a realizar_marshall
 */
export const getPaddingClass = (realizarMarshall) => {
  return realizarMarshall ? 'px-0.5 py-0' : 'px-2 py-1.5';
};

/**
 * Determina classes de font-size para tabelas
 */
export const getTableFontSize = (realizarMarshall, type = 'default') => {
  const configs = {
    default: realizarMarshall ? 'text-[7px]' : 'text-[9px]',
    granulometria_header: realizarMarshall ? 'text-[9px]' : 'text-[11px]',
    extracao_header: realizarMarshall ? 'text-[8px]' : 'text-[11px]',
  };
  return configs[type] || configs.default;
};

/**
 * Valida se valor está fora da faixa (para coloração)
 */
export const estáForaDaFaixa = (valor, min, max) => {
  if (!min || !max || !valor) return false;
  const v = parseFloat(valor);
  const minVal = parseFloat(min);
  const maxVal = parseFloat(max);
  return v < minVal || v > maxVal;
};

/**
 * Valida se valor está abaixo do mínimo (para coloração red)
 */
export const estáAbaixoMin = (valor, min) => {
  if (!min || !valor) return false;
  return parseFloat(valor) < parseFloat(min);
};

/**
 * Valida se valor está fora da faixa (min/max)
 */
export const estáForaDaFaixaMinMax = (valor, min, max) => {
  if (!min || !max || !valor) return false;
  const v = parseFloat(valor);
  const minVal = parseFloat(min);
  const maxVal = parseFloat(max);
  return v < minVal || v > maxVal;
};

/**
 * Detecta se há dados de RTCD para renderizar seção
 */
export const temDadosRTCD = (cpsValidos) => {
  return cpsValidos.some(cp => cp?.rtcd_leitura != null && cp?.rtcd_leitura !== '');
};

/**
 * Detecta se há dados de Estabilidade para renderizar seção
 */
export const temDadosEstabilidade = (cpsValidos) => {
  return cpsValidos.some(cp => cp?.estabilidade_leitura != null && cp?.estabilidade_leitura !== '');
};

/**
 * Extrai const_prensa do primeiro CP, com fallback
 */
export const extrairConstPrensa = (cpsValidos) => {
  const cp0 = cpsValidos?.[0];
  if (!cp0) return '1.0000';
  const val = parseFloat(cp0.const_prensa);
  return isNaN(val) ? '1.0000' : val.toFixed(4);
};

/**
 * Formata número com fallback a '-'
 */
export const fmtNum = (val, decimais = 1) => {
  if (val == null || val === '') return '-';
  const n = parseFloat(val);
  return isNaN(n) ? '-' : n.toFixed(decimais);
};