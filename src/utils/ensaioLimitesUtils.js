/**
 * Funções puras para EnsaioLimites.
 * Utilitários para cálculos, mapeamento e transformação de dados.
 */

/**
 * Normaliza um valor numérico para decimal específico.
 * @param {number|string} v - Valor
 * @param {number} d - Casas decimais (default: 2)
 * @returns {number|null}
 */
export const normalizeNumber = (v, d = 2) => {
  const f = parseFloat(v);
  return isNaN(f) ? null : parseFloat(f.toFixed(d));
};

/**
 * Calcula a umidade dado peso úmido, seco e tara.
 * @param {number|string} umido - Peso úmido
 * @param {number|string} seco - Peso seco
 * @param {number|string} tara - Tara (peso da cápsula)
 * @returns {number|null}
 */
export const calcUmidade = (umido, seco, tara) => {
  const agua = normalizeNumber(umido) - normalizeNumber(seco);
  const solo = normalizeNumber(seco) - normalizeNumber(tara);
  if (!agua || !solo || solo <= 0) return null;
  return parseFloat(((agua / solo) * 100).toFixed(2));
};

/**
 * Calcula LL row: água, solo, teor de umidade.
 * @param {Object} row - Linha com propriedades solo_umido_capsula, solo_seco_capsula, peso_capsula
 * @returns {Object} { agua, solo, teor }
 */
export const calcLLRow = (row) => {
  const agua = normalizeNumber(row.solo_umido_capsula, 3) != null && normalizeNumber(row.solo_seco_capsula, 3) != null
    ? parseFloat((normalizeNumber(row.solo_umido_capsula, 3) - normalizeNumber(row.solo_seco_capsula, 3)).toFixed(3))
    : null;
  const solo = normalizeNumber(row.solo_seco_capsula, 3) != null && normalizeNumber(row.peso_capsula, 3) != null
    ? parseFloat((normalizeNumber(row.solo_seco_capsula, 3) - normalizeNumber(row.peso_capsula, 3)).toFixed(3))
    : null;
  const teor = agua != null && solo != null && solo > 0
    ? parseFloat(((agua / solo) * 100).toFixed(2))
    : null;
  return { agua, solo, teor };
};

/**
 * Calcula LP row: teor de umidade.
 * @param {Object} row - Linha com propriedades de umidade
 * @returns {number|null}
 */
export const calcLPRow = (row) => {
  return calcUmidade(row.solo_umido_capsula, row.solo_seco_capsula, row.peso_capsula);
};

/**
 * Regressão linear simples para curva LL.
 * @param {Array} points - Pontos { x, y }
 * @returns {Object|null} { a, b, ll } ou null
 */
export const fitLogLine = (points) => {
  const valid = points.filter(p => p.x > 0 && p.y != null);
  if (valid.length < 2) return null;
  const n = valid.length;
  const sx = valid.reduce((s, p) => s + p.x, 0);
  const sy = valid.reduce((s, p) => s + p.y, 0);
  const sxx = valid.reduce((s, p) => s + p.x * p.x, 0);
  const sxy = valid.reduce((s, p) => s + p.x * p.y, 0);
  const denom = n * sxx - sx * sx;
  if (Math.abs(denom) < 1e-10) return null;
  const a = (n * sxy - sx * sy) / denom;
  const b = (sy - a * sx) / n;
  const ll = parseFloat((a * 25 + b).toFixed(1));
  return { a, b, ll };
};

/**
 * Classifica HRB (AASHTO) baseado em parâmetros de solo.
 * @param {number} F10 - % passante na peneira #10
 * @param {number} F40 - % passante na peneira #40
 * @param {number} F200 - % passante na peneira #200
 * @param {number} ll - Limite de Liquidez
 * @param {number} ip - Índice de Plasticidade
 * @param {number} ig - Índice de Grupo
 * @returns {string}
 */
export const classificarHRB = (F10, F40, F200, ll, ip, ig) => {
  const f200 = F200 ?? 0;
  const f40 = F40 ?? 0;
  const f10 = F10 ?? 0;
  const llv = ll ?? 0;
  const ipv = ip ?? 0;
  const igv = ig ?? 0;

  // Solos Granulares: F200 ≤ 35
  if (f200 <= 35) {
    if (f10 <= 50 && f40 <= 30 && ipv <= 6 && igv === 0) return "A1-a";
    if (f40 <= 50 && ipv <= 6 && igv === 0) return "A1-b";
    if (f40 >= 51 && ipv === 0 && f200 <= 10 && igv === 0) return "A3";
    if (llv <= 40 && ipv <= 10 && igv === 0) return "A2-4";
    if (llv >= 41 && ipv <= 10 && igv === 0) return "A2-5";
    if (llv <= 40 && ipv >= 11 && igv <= 4) return "A2-6";
    if (llv >= 41 && ipv >= 11 && igv <= 4) return "A2-7";
  }

  // Solos Siltosos e Argilosos: F200 > 35
  if (f200 >= 36 && llv <= 40 && ipv <= 10 && igv <= 8) return "A4";
  if (f200 >= 36 && llv >= 41 && ipv <= 10 && igv <= 12) return "A5";
  if (f200 >= 36 && llv <= 40 && ipv >= 11 && igv <= 16) return "A6";
  if (f200 >= 36 && llv >= 41 && ipv >= 11 && ipv <= (llv - 30) && igv <= 20) return "A7-5";
  if (f200 >= 36 && llv >= 41 && ipv >= 11 && ipv > (llv - 30) && igv <= 20) return "A7-6";

  return "-";
};

/**
 * Calcula o índice de grupo (IG).
 * @param {number} pct200 - % passante na peneira #200
 * @param {number} ll - Limite de Liquidez
 * @param {number} ip - Índice de Plasticidade
 * @returns {number|null}
 */
export const calcIndexGroup = (pct200, ll, ip) => {
  if (pct200 == null || ll == null || ip == null) return null;
  const F = pct200;
  const ll200 = F < 35 ? 0 : Math.min(F, 75) - 35;
  const ip200 = F < 15 ? 0 : Math.min(F, 55) - 15;
  const llAt = ll < 40 ? 0 : Math.min(ll, 60) - 40;
  const ipAt = ip < 10 ? 0 : Math.min(ip, 30) - 10;

  const ig = parseFloat((0.2 * ll200 + 0.005 * ll200 * llAt + 0.01 * ip200 * ipAt).toFixed(0));
  return Math.max(0, ig);
};

/**
 * Formata um número com casas decimais específicas.
 * @param {number} value - Valor a formatar
 * @param {number} decimals - Número de casas decimais
 * @returns {string}
 */
export const formatValue = (value, decimals = 2) => {
  if (value == null) return "-";
  return parseFloat(value.toFixed(decimals)).toString();
};