/**
 * Utilitários para Certificação de Usinas
 */

export const OPCOES_CONFORME = ["Conforme", "Não conforme"];
export const OPCOES_SIM_NAO = ["Sim", "Não"];
export const OPCOES_POSSUI = ["Possui", "Não possui"];

export const CLASSES_USINA = ["Classe I", "Classe II", "Classe III"];

export const PENEIRAS_GRANULOMETRIA = [
  '1 1/2"', '1"', '3/4"', '1/2"', '3/8"', '#4', '#10', '#40', '#80', '#200',
];

/** Inicializa array de linhas para tabela de ensaios de validação */
export function initEnsaioValidacaoRows(count = 4) {
  return Array.from({ length: count }, () => ({
    projeto: null,
    obtido: null,
    erro: null,
    desvio_padrao: null,
  }));
}

/** Inicializa linhas de granulometria (peneiras fixas) */
export function initGranulometriaRows() {
  return PENEIRAS_GRANULOMETRIA.map((peneira) => ({
    peneira,
    projeto: null,
    obtido: null,
    erro: null,
  }));
}

/** Calcula erro = obtido - projeto */
export function calcularErro(projeto, obtido) {
  if (projeto == null || obtido == null) return null;
  const p = parseFloat(projeto);
  const o = parseFloat(obtido);
  if (isNaN(p) || isNaN(o)) return null;
  return parseFloat((o - p).toFixed(4));
}

/** Calcula desvio padrão de um array de números */
export function calcularDesvioPadrao(valores) {
  const nums = valores.filter((v) => v != null && !isNaN(parseFloat(v))).map(parseFloat);
  if (nums.length < 2) return null;
  const media = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variancia = nums.reduce((acc, v) => acc + (v - media) ** 2, 0) / nums.length;
  return parseFloat(Math.sqrt(variancia).toFixed(4));
}

/** Contagem de conformes/não conformes numa seção flat */
export function contarConformidades(secao) {
  if (!secao || typeof secao !== 'object') return { conforme: 0, nao_conforme: 0, total: 0 };
  let conforme = 0;
  let nao_conforme = 0;
  Object.values(secao).forEach((v) => {
    if (v === 'Conforme') conforme++;
    else if (v === 'Não conforme') nao_conforme++;
  });
  return { conforme, nao_conforme, total: conforme + nao_conforme };
}

/** Valida campos obrigatórios mínimos do formulário */
export function validarCertificacao(formData, saveStatus) {
  if (saveStatus === 'rascunho') return { valid: true };
  if (!formData.data_vistoria) return { valid: false, message: 'Informe a data da vistoria.' };
  if (!formData.razao_social?.trim()) return { valid: false, message: 'Informe a razão social.' };
  if (!formData.obra_id) return { valid: false, message: 'Selecione uma obra.' };
  return { valid: true };
}