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

export const PENEIRAS_GROSSAS = [
  { label: '3"', mm: 76.2 }, { label: '2"', mm: 50.8 }, { label: '1"', mm: 25.4 },
  { label: '3/8"', mm: 9.52 }, { label: '4°', mm: 4.76 }, { label: '10°', mm: 2.0 },
];
export const PENEIRAS_FINAS = [{ label: '40', mm: 0.42 }, { label: '200', mm: 0.075 }];

/**
 * Calcula todos os valores derivados do relatório de Limites de Consistência.
 * Função pura — sem dependências React.
 * @param {Object} lim - Dados brutos do ensaio
 * @returns {Object} Todos os valores calculados
 */
export function calcularLimites(lim) {
  const d = lim || {};

  /* Umidade higroscópica */
  const higroT1 = calcUmidade(d.higro_solo_umido_capsula_1, d.higro_solo_seco_capsula_1, d.higro_peso_capsula_1);
  const higroT2 = calcUmidade(d.higro_solo_umido_capsula_2, d.higro_solo_seco_capsula_2, d.higro_peso_capsula_2);
  const validHigro = [higroT1, higroT2].filter(v => v != null);
  const higroMedia = validHigro.length > 0 ? parseFloat((validHigro.reduce((s, v) => s + v, 0) / validHigro.length).toFixed(2)) : null;

  /* Peneiramento grosso */
  const penGrossas = d.peneiras_grossas || PENEIRAS_GROSSAS.map(p => ({ ...p, retido: "" }));
  const retidosGrossos = penGrossas.map(p => parseFloat(p.retido) || 0);
  const totalSeca = parseFloat(d.amostra_total_seca) || null;

  let granGrossaCalc = [];
  if (totalSeca && totalSeca > 0) {
    let acum = totalSeca;
    granGrossaCalc = retidosGrossos.map(ret => {
      const passando = parseFloat((acum - ret).toFixed(3));
      const pct = parseFloat((passando / totalSeca * 100).toFixed(1));
      acum = passando;
      return { retido: ret, passando, passPct: pct };
    });
  }

  /* SP10 */
  const soloSecoRetido10 = (() => {
    const t = retidosGrossos.reduce((s, r) => s + r, 0);
    return t > 0 ? parseFloat(t.toFixed(3)) : null;
  })();

  const soloUmPassando10 = (() => {
    const ut = parseFloat(d.amostra_total_umida);
    if (isNaN(ut) || !retidosGrossos.length) return null;
    const r = parseFloat((ut - retidosGrossos.reduce((s, x) => s + x, 0)).toFixed(3));
    return r > 0 ? r : null;
  })();

  const sp10 = (soloUmPassando10 != null && higroMedia != null)
    ? parseFloat((soloUmPassando10 / (higroMedia / 100 + 1)).toFixed(3))
    : null;

  const amostraTotalSecaCalc = (soloSecoRetido10 != null && sp10 != null)
    ? parseFloat((soloSecoRetido10 + sp10).toFixed(3))
    : null;

  /* Peneiramento fino */
  const penFinas = d.peneiras_finas || PENEIRAS_FINAS.map(p => ({ ...p, retido: "" }));
  const amostParcSeca = parseFloat(d.amostra_parcial_seca) || null;

  let granFinaCalc = [];
  if (amostParcSeca && amostParcSeca > 0) {
    let acum = amostParcSeca;
    granFinaCalc = penFinas.map(pen => {
      const ret = parseFloat(pen.retido) || 0;
      const passando = parseFloat((acum - ret).toFixed(3));
      const pct = parseFloat((passando / amostParcSeca * 100).toFixed(1));
      acum = passando;
      return { retido: ret, passando, passPct: pct };
    });
  }

  /* LL */
  const llRows = d.ll_rows || [];
  const llCalc = llRows.map(calcLLRow);
  const llPoints = llRows.map((r, i) => ({ x: parseFloat(r.num_golpes), y: llCalc[i].teor }))
    .filter(p => p.x > 0 && p.y != null);

  let llYAxisDomain = ['auto', 'auto'];
  if (llPoints.length > 0) {
    const yValues = llPoints.map(p => p.y).filter(y => y != null);
    llYAxisDomain = [parseFloat((Math.min(...yValues) - 5).toFixed(2)), parseFloat((Math.max(...yValues) + 5).toFixed(2))];
  }

  const llFit = fitLogLine(llPoints);

  /* LP */
  const lpRows = d.lp_rows || [];
  const lpTeors = lpRows.map(r => calcUmidade(r.solo_umido_capsula, r.solo_seco_capsula, r.peso_capsula));
  const validLp = lpTeors.filter(v => v != null);
  const lpMedia = validLp.length > 0 ? parseFloat((validLp.reduce((s, v) => s + v, 0) / validLp.length).toFixed(1)) : null;

  /* IP, IG, HRB */
  const IP = llFit?.ll != null && lpMedia != null ? parseFloat((llFit.ll - lpMedia).toFixed(1)) : null;

  let pct200 = null;
  if (granFinaCalc.length && totalSeca && sp10 != null && amostParcSeca) {
    const passando200 = granFinaCalc[granFinaCalc.length - 1]?.passando || 0;
    pct200 = parseFloat(((passando200 / amostParcSeca) * (sp10 / totalSeca) * 100).toFixed(1));
  }

  const pct10 = granGrossaCalc[5]?.passando != null && totalSeca
    ? parseFloat((granGrossaCalc[5].passando / totalSeca * 100).toFixed(1)) : null;

  const pct40 = granFinaCalc[0]?.passando != null && totalSeca && sp10 && amostParcSeca
    ? parseFloat(((granFinaCalc[0].passando / amostParcSeca) * (sp10 / totalSeca) * 100).toFixed(1)) : null;

  const igCalc = calcIG(pct200, llFit?.ll, IP);
  const hrb = classificarHRB(pct10, pct40, pct200, llFit?.ll ?? null, IP, igCalc);

  return {
    higroT1, higroT2, higroMedia,
    penGrossas, granGrossaCalc, totalSeca, retidosGrossos,
    soloSecoRetido10, soloUmPassando10, sp10, amostraTotalSecaCalc,
    penFinas, granFinaCalc, amostParcSeca,
    llRows, llCalc, llPoints, llYAxisDomain, llFit,
    lpRows, lpTeors, lpMedia,
    IP, pct200, pct10, pct40, igCalc, hrb,
  };
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