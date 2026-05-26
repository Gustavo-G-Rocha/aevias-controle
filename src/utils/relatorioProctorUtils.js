/**
 * Funções puras para RelatorioProctor.
 * Sem side effects, sem chamadas de API.
 */

// ── Constantes ────────────────────────────────────────────────────────────────

export const PENETRACOES = [0.64, 1.27, 1.91, 2.54, 3.81, 5.08, 6.35, 7.62, 8.89];
export const TEMPOS = [0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0];
export const PRESSAO_PADRAO = { 3: 70.31, 5: 105.46 };

// ── Formatação ────────────────────────────────────────────────────────────────

export const fmtN = (v, d = 2) =>
  (v !== null && v !== undefined && !isNaN(v)) ? parseFloat(v).toFixed(d) : '-';

export const fmtDate = (d) =>
  d ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('pt-BR') : '-';

export const fmtDateTime = (d) => {
  if (!d) return '-';
  const n = (!d.endsWith('Z') && !d.includes('+')) ? d + 'Z' : d;
  return new Date(n).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
};

// ── Cálculos ──────────────────────────────────────────────────────────────────

/** Calcula pressões ISC, ISC a 2.54 mm e a 5.08 mm para um cilindro */
export function calcISC(cil, fatorAnel) {
  const fator = parseFloat(fatorAnel);
  if (isNaN(fator) || fator <= 0) return { pressoes: Array(9).fill(null), isc254: null, isc508: null, isc: null };
  const pressoes = (cil.leituras || []).map(l => {
    const v = parseFloat(l);
    return !isNaN(v) && v > 0 ? parseFloat((v * fator).toFixed(2)) : null;
  });
  const isc254 = pressoes[3] != null ? parseFloat((pressoes[3] / PRESSAO_PADRAO[3] * 100).toFixed(1)) : null;
  const isc508 = pressoes[5] != null ? parseFloat((pressoes[5] / PRESSAO_PADRAO[5] * 100).toFixed(1)) : null;
  const isc = (isc254 != null && isc508 != null) ? Math.max(isc254, isc508) : (isc254 ?? isc508);
  return { pressoes, isc254, isc508, isc };
}

/** Calcula diferença e expansão (%) a partir dos dados de um cilindro de expansão */
export function calcExpansao(exp) {
  const alt = parseFloat(exp.altura_inicial);
  const l1 = parseFloat(exp.leitura_1dia);
  const vals = [exp.leitura_2dia, exp.leitura_3dia, exp.leitura_4dia];
  const lastVal = [...vals].reverse().find(v => v !== '' && v != null && !isNaN(parseFloat(v)));
  const lFinal = lastVal != null ? parseFloat(lastVal) : null;
  const diferenca = !isNaN(l1) && lFinal != null
    ? parseFloat((lFinal - l1).toFixed(2))
    : (exp.diferenca != null ? parseFloat(exp.diferenca) : null);
  const expansao_pct = diferenca != null && !isNaN(alt) && alt > 0
    ? parseFloat((diferenca / alt * 100).toFixed(2))
    : (exp.expansao_pct != null ? parseFloat(exp.expansao_pct) : null);
  return { diferenca, expansao_pct };
}

/** Regressão linear simples — retorna { a, b } tal que y = a*x + b */
export function fitLinear(points) {
  if (points.length < 2) return null;
  const n = points.length;
  const sx  = points.reduce((s, p) => s + p.x, 0);
  const sy  = points.reduce((s, p) => s + p.y, 0);
  const sxx = points.reduce((s, p) => s + p.x * p.x, 0);
  const sxy = points.reduce((s, p) => s + p.x * p.y, 0);
  const denom = n * sxx - sx * sx;
  if (Math.abs(denom) < 1e-10) return null;
  const a = (n * sxy - sx * sy) / denom;
  const b = (sy - a * sx) / n;
  return { a, b };
}

/** Avalia uma parábola (a·x² + b·x + c) num ponto x */
export function evalParabola(parabola, x) {
  if (!parabola || x == null) return null;
  return parseFloat((parabola.a * x ** 2 + parabola.b * x + parabola.c).toFixed(2));
}

/** Constrói pontos de curva parabólica para um range de x */
export function buildParabolaCurve(pts, par) {
  if (!par || !pts.length) return [];
  const xs = pts.map(p => p.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  return Array.from({ length: 30 }, (_, i) => {
    const x = minX + (maxX - minX) * i / 29;
    return { x: parseFloat(x.toFixed(2)), y: parseFloat((par.a * x ** 2 + par.b * x + par.c).toFixed(3)) };
  });
}

/** Constrói campos informativos para o cabeçalho do relatório */
export function buildInfoFields(ensaio, obra) {
  return [
    ["OBRA",          obra?.name             || '-'],
    ["LOCAL",         ensaio.local_coleta    || '-'],
    ["MATERIAL",      ensaio.material        || '-'],
    ["RODOVIA",       ensaio.rodovia         || '-'],
    ["ENERGIA",       ensaio.energia_compactacao || '-'],
    ["LABORATORISTA", ensaio.laboratorista_name || '-'],
    ["TRECHO",        ensaio.trecho          || '-'],
    ["CAMADA",        ensaio.camada          || '-'],
    ["DATA",          fmtDate(ensaio.data_ensaio)],
  ];
}