/**
 * Funções puras extraídas de RelatorioLimites.jsx.
 * Sem efeitos colaterais, sem dependências React.
 */

/** Formata número com d casas decimais; retorna '-' para valores inválidos. */
export const fmtN = (v, d = 2) =>
  (v !== null && v !== undefined && !isNaN(parseFloat(v)))
    ? parseFloat(v).toFixed(d)
    : '-';

/** Calcula teor de umidade (%) a partir de pesos. Retorna null se inválido. */
export function calcUmidade(umido, seco, tara) {
  const agua = parseFloat(umido) - parseFloat(seco);
  const solo = parseFloat(seco) - parseFloat(tara);
  if (isNaN(agua) || isNaN(solo) || solo <= 0) return null;
  return parseFloat(((agua / solo) * 100).toFixed(2));
}

/** Calcula teor de umidade para uma linha de LL. */
export function calcLLRow(row) {
  const agua = parseFloat(row.solo_umido_capsula) - parseFloat(row.solo_seco_capsula);
  const solo = parseFloat(row.solo_seco_capsula) - parseFloat(row.peso_capsula);
  if (isNaN(agua) || isNaN(solo) || solo <= 0) return { teor: null };
  return { teor: parseFloat(((agua / solo) * 100).toFixed(2)) };
}

/**
 * Ajuste linear simples (regressão y = ax + b) sobre os pontos (x, y).
 * Retorna { a, b, ll } onde ll é o valor interpolado em x=25, ou null.
 */
export function fitLogLine(points) {
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
  return { a, b, ll: parseFloat((a * 25 + b).toFixed(1)) };
}

/** Calcula o Índice de Grupo (IG) conforme AASHTO. */
export function calcIG(F200, ll, ip) {
  if (F200 == null || ll == null || ip == null) return null;
  const ll200 = F200 < 35 ? 0 : Math.min(F200, 75) - 35;
  const ip200 = F200 < 15 ? 0 : Math.min(F200, 55) - 15;
  const llAt = ll < 40 ? 0 : Math.min(ll, 60) - 40;
  const ipAt = ip < 10 ? 0 : Math.min(ip, 30) - 10;
  return Math.max(0, parseFloat(
    (0.2 * ll200 + 0.005 * ll200 * llAt + 0.01 * ip200 * ipAt).toFixed(0)
  ));
}

/** Classifica o solo segundo HRB/AASHTO. */
export function classificarHRB(F10, F40, F200, ll, ip, ig) {
  const f200 = F200 ?? 0, f40 = F40 ?? 0, f10 = F10 ?? 0;
  const llv = ll ?? 0, ipv = ip ?? 0, igv = ig ?? 0;
  if (f200 <= 35) {
    if (f10 <= 50 && f40 <= 30 && ipv <= 6 && igv === 0) return "A1-a";
    if (f40 <= 50 && ipv <= 6 && igv === 0) return "A1-b";
    if (f40 >= 51 && ipv === 0 && f200 <= 10 && igv === 0) return "A3";
    if (llv <= 40 && ipv <= 10 && igv === 0) return "A2-4";
    if (llv >= 41 && ipv <= 10 && igv === 0) return "A2-5";
    if (llv <= 40 && ipv >= 11 && igv <= 4) return "A2-6";
    if (llv >= 41 && ipv >= 11 && igv <= 4) return "A2-7";
  }
  if (f200 >= 36 && llv <= 40 && ipv <= 10 && igv <= 8) return "A4";
  if (f200 >= 36 && llv >= 41 && ipv <= 10 && igv <= 12) return "A5";
  if (f200 >= 36 && llv <= 40 && ipv >= 11 && igv <= 16) return "A6";
  if (f200 >= 36 && llv >= 41 && ipv >= 11 && ipv <= (llv - 30) && igv <= 20) return "A7-5";
  if (f200 >= 36 && llv >= 41 && ipv >= 11 && ipv > (llv - 30) && igv <= 20) return "A7-6";
  return "-";
}

/** Formata data ISO (YYYY-MM-DD) para pt-BR. */
export const fmtDate = (d) =>
  d ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('pt-BR') : '-';

/** Formata datetime ISO para pt-BR (fuso America/Sao_Paulo). */
export const fmtDateTime = (d) => {
  if (!d) return '-';
  const n = (!d.endsWith('Z') && !d.includes('+')) ? d + 'Z' : d;
  return new Date(n).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  });
};