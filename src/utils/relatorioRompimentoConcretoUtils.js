/**
 * Formatação de data (YYYY-MM-DD ou ISO)
 */
export const fmtDate = (d) =>
  d ? new Date(d + (d.length === 10 ? "T00:00:00" : "")).toLocaleDateString("pt-BR") : "-";

/**
 * Formatação de número com casas decimais
 */
export const fmtN = (v, d = 2) =>
  v !== null && v !== undefined && !isNaN(parseFloat(v))
    ? parseFloat(v).toFixed(d)
    : "-";

/**
 * Formatação de datetime com timezone
 */
export const fmtDateTime = (d) => {
  if (!d) return "-";
  const n = !d.endsWith("Z") && !d.includes("+") ? d + "Z" : d;
  return new Date(n).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
};

/**
 * Agrupa array de CPs em séries de 2
 */
export const agruparEmSeries = (cps) => {
  if (!cps || cps.length === 0) return [];
  const series = [];
  for (let i = 0; i < cps.length; i += 2) {
    series.push([cps[i], cps[i + 1]].filter(Boolean));
  }
  return series;
};

/**
 * Calcula resistência do exemplar (maior valor da série)
 */
export const resistenciaExemplar = (serieCps) => {
  const vals = serieCps
    .map((cp) => parseFloat(cp.resistencia))
    .filter((v) => !isNaN(v) && v > 0);
  if (vals.length === 0) return "-";
  return Math.max(...vals).toFixed(2);
};

/**
 * Retorna valor formatado da linha da tabela
 */
export const getValorLinha = (row, cp) => {
  if (!cp) return "";
  switch (row.label) {
    case "DATA DA RUPTURA":
      return cp.data_ruptura ? fmtDate(cp.data_ruptura) : "-";
    case "CARGA DE RUPTURA":
      return fmtN(cp.carga_ruptura, 2);
    case "ÁREA DO CORPO DE PROVA":
      return fmtN(cp.area_cp, 2);
    case "VÃO CENTRAL DO CP":
      return fmtN(cp.vao_central, 2);
    case "RESISTÊNCIA":
      return fmtN(cp.resistencia, 2);
    case "RESIST. DO EXEMPLAR":
      return null; // handled separately (rowspan)
    default:
      return "";
  }
};

/**
 * Calcula total de colunas para tabela (mínimo 4)
 */
export const calcularTotalColunas = (seriesCompressao) => {
  return Math.max(seriesCompressao.length * 2, 4);
};