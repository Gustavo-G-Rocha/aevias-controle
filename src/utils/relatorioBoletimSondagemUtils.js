/**
 * Formata data para pt-BR em UTC
 */
export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-";

/**
 * Formata datetime para pt-BR com timezone America/Sao_Paulo
 */
export const formatDateTime = (d) => {
  if (!d) return "N/A";
  const normalized =
    !d.endsWith("Z") && !d.includes("+") && !d.includes("-", 10)
      ? d + "Z"
      : d;
  return new Date(normalized).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "medium",
  });
};

/**
 * Formata número com casas decimais
 */
export const fmtNum = (v, dec = 2) =>
  v !== null && v !== undefined ? parseFloat(v).toFixed(dec) : "-";

/**
 * Verifica se boletim possui segunda coluna de classificação
 */
export const temSegundaClassificacao = (camadas) =>
  (camadas || []).some(
    (c) => c.classificacao_2 !== null && c.classificacao_2 !== undefined
  );

/**
 * Retorna array de densidades compatível com ambos os formatos (antigo e novo)
 */
export const getDensidades = (boletim) => {
  if (boletim.densidades_in_situ?.length > 0) return boletim.densidades_in_situ;
  if (boletim.densidade_in_situ) return [boletim.densidade_in_situ];
  return [{}];
};

/**
 * Calcula umidade de uma amostra da umidade natural 2
 */
export const calcUmidadeNatural2 = (un2, idx) => {
  const csu = un2[`massa_cap_solo_umido_${idx}`];
  const css = un2[`massa_cap_solo_seco_${idx}`];
  const cap = un2[`massa_capsula_${idx}`];
  if (csu && css && cap != null) {
    const ss = css - cap;
    return ss > 0 ? parseFloat((((csu - css) / ss) * 100).toFixed(2)) : null;
  }
  return null;
};

/**
 * Calcula média de umidade de uma tabela de umidade natural
 */
export const calcMediaUmidade = (u1, u2) => {
  if (u1 != null && u2 != null) return `${((u1 + u2) / 2).toFixed(2)}%`;
  if (u1 != null) return `${fmtNum(u1)}%`;
  return "-";
};

/**
 * Divide array em chunks de tamanho fixo
 */
export const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/**
 * Retorna linhas de dados da tabela de densidade in situ
 */
export const getDensidadeRows = () => [
  { label: "Camada ensaiada", field: "camada_ensaiada", isNum: false },
  { label: "VOLUME", section: true },
  { label: "Peso do frasco antes (g)", field: "peso_frasco_antes", isNum: true, dec: 1 },
  { label: "Peso do frasco depois (g)", field: "peso_frasco_depois", isNum: true, dec: 1 },
  { label: "Peso areia funil e placa (g)", field: "peso_areia_funil_placa", isNum: true, dec: 1 },
  { label: "Massa esp. aparente areia (g/dm³)", field: "massa_esp_aparente_areia", isNum: true, dec: 3 },
  { label: "Peso areia na cavidade (g)", field: "peso_areia_cavidade", isNum: true, dec: 1 },
  { label: "Volume do buraco (dm³)", field: "volume_buraco", isNum: true, dec: 1 },
  { label: "MASSA", section: true },
  { label: "Peso solo + recipiente (g)", field: "peso_solo_recipiente", isNum: true, dec: 1 },
  { label: "Peso do recipiente (g)", field: "peso_recipiente", isNum: true, dec: 1 },
  { label: "Peso do solo (g)", field: "peso_solo", isNum: true, dec: 1 },
  { label: "UMIDADE", section: true },
  { label: "Peso do solo úmido (g)", field: "peso_solo_umido", isNum: true, dec: 1 },
  { label: "Peso do solo seco (g)", field: "peso_solo_seco", isNum: true, dec: 1 },
  { label: "Teor de umidade (%)", field: "teor_umidade", isNum: true, dec: 1 },
  { label: "RESULTADOS", section: true },
  { label: "Dens. Aparente Solo Úmido (g/dm³)", field: "densidade_aparente_solo_umido", isNum: true, dec: 3, result: true },
  { label: "Dens. Aparente Solo Seco (g/dm³)", field: "densidade_aparente_solo_seco", isNum: true, dec: 3, result: true },
];