// Constantes e cálculos puros do formulário de Ensaio CAUQ.
// Extraídos de pages/EnsaioCAUQ/hooks/useEnsaioCAUQForm.jsx.

/** Tabela de correção de estabilidade Marshall por espessura (DNIT) */
export const TABELA_CORRECAO_ESTABILIDADE = [
  [50.8,1.47],[51.0,1.45],[51.2,1.44],[51.6,1.43],[51.8,1.42],
  [52.0,1.41],[52.2,1.40],[52.4,1.39],[52.6,1.38],[52.9,1.37],
  [53.1,1.36],[53.3,1.35],[53.5,1.34],[53.8,1.33],[54.0,1.32],
  [54.2,1.31],[54.5,1.30],[54.7,1.29],[54.9,1.28],[55.1,1.27],
  [55.4,1.26],[55.6,1.25],[55.8,1.24],[56.1,1.23],[56.3,1.22],
  [56.6,1.21],[56.8,1.20],[57.2,1.19],[57.4,1.18],[57.7,1.18],
  [58.1,1.16],[58.4,1.15],[58.7,1.14],[59.0,1.13],[59.3,1.12],
  [59.7,1.11],[60.0,1.10],[60.3,1.09],[60.6,1.08],[60.9,1.07],
  [61.1,1.06],[61.4,1.05],[61.9,1.04],[62.3,1.03],[62.7,1.02],
  [63.1,1.01],[63.5,1.00],[63.9,0.99],[64.3,0.98],[64.7,0.97],
  [65.1,0.96],[65.6,0.95],[66.1,0.94],[66.7,0.93],[67.1,0.92],
  [67.5,0.91],[67.9,0.90],[68.3,0.89],[68.8,0.88],[69.3,0.87],
  [69.9,0.86],[70.3,0.85],[70.8,0.84],[71.4,0.83],[72.2,0.82],
  [73.0,0.81],[73.5,0.80],[74.0,0.79],[74.6,0.78],[75.4,0.77],
  [76.2,0.76],
];

/** Interpolação linear na tabela de correção de estabilidade */
export function getFatorCorrecaoEstabilidade(alturaMm) {
  const t = TABELA_CORRECAO_ESTABILIDADE;
  if (alturaMm <= t[0][0]) return t[0][1];
  if (alturaMm >= t[t.length - 1][0]) return t[t.length - 1][1];
  for (let i = 0; i < t.length - 1; i++) {
    if (alturaMm >= t[i][0] && alturaMm <= t[i + 1][0]) {
      const [x0, y0] = t[i];
      const [x1, y1] = t[i + 1];
      return y0 + ((alturaMm - x0) * (y1 - y0)) / (x1 - x0);
    }
  }
  return 1.0;
}

/** Template de corpo de prova vazio */
export const novoCorpoProva = (numero) => ({
  numero,
  metodo_rompimento: "estabilidade_fluencia",
  peso_ar: null, peso_imerso: null, peso_sss: null,
  volume: null, densidade_aparente: null, volume_vazios: null,
  vcb: null, vam: null, rbv: null,
  altura: null, const_prensa: 1.0,
  rtcd_leitura: null, rtcd_valor: null,
  estabilidade_leitura: null, estabilidade_corrigida: null,
  fluencia_leitura_inicial: null, fluencia_leitura_final: null, fluencia: null,
});