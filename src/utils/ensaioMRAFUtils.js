/**
 * Funções puras para o EnsaioMRAF.
 * Nenhuma dependência de React ou Base44.
 */

import { todayISO } from "@/utils/formInitialData";

/**
 * Retorna o estado inicial do formulário.
 */
export const getInitialFormData = () => ({
  obra_id: "",
  project_id: "",
  data_ensaio: todayISO(),
  horario: "",
  placa_caminhao: "",
  local_coleta: "",
  usina_fornecedora: "",
  pedreira: "",
  rodovia: "",
  trecho: "",
  tipo_ligante: "",
  temperatura_cap: null,
  faixa_especificada: "",
  ensaio_realizado_por: "Afirma Evias",
  extracao_ligante: {
    amostra_umida: null,
    amostra_seca: null,
    umidade: null,
    amostra_com_ligante: null,
    amostra_sem_ligante: null,
    fator_correcao: 1.0,
    peso_ligante: null,
    teor_ligante: null,
    residuo_emulsao: null,
    percentual_emulsao: null,
  },
  granulometria: { peso_retido_peneiras: {} },
  observacoes: "",
  status: "rascunho",
  approved: null,
  rejection_reason: null,
});

/**
 * Calcula os campos derivados da extração de ligante.
 * Retorna um objeto com apenas os campos que devem ser atualizados.
 * @param {object} ext - objeto extracao_ligante
 * @returns {object} patches
 */
export function calcExtracaoLigante(ext) {
  const patches = {};

  if (ext.amostra_umida && ext.amostra_seca) {
    patches.umidade = parseFloat(
      (((ext.amostra_umida - ext.amostra_seca) / ext.amostra_seca) * 100).toFixed(2)
    );
  }

  if (ext.amostra_com_ligante && ext.amostra_sem_ligante && ext.fator_correcao) {
    const pesoLigante = (ext.amostra_com_ligante - ext.amostra_sem_ligante) * ext.fator_correcao;
    const teorLigante = (pesoLigante / ext.amostra_sem_ligante) * 100;
    patches.peso_ligante = parseFloat(pesoLigante.toFixed(2));
    patches.teor_ligante = parseFloat(teorLigante.toFixed(2));
  }

  // Usa teor_ligante calculado agora ou o que já existia no ext
  const teorParaEmulsao = patches.teor_ligante ?? ext.teor_ligante;
  if (teorParaEmulsao && ext.residuo_emulsao) {
    patches.percentual_emulsao = parseFloat(
      ((teorParaEmulsao / ext.residuo_emulsao) * 100).toFixed(2)
    );
  }

  return patches;
}

/**
 * Calcula o % passante para uma peneira na posição `index`.
 * @param {object[]} peneiras - lista de peneiras do projeto
 * @param {object}   pesosRetidos - mapa key → peso
 * @param {number}   index - índice da peneira atual
 * @param {number}   pesoInicial - amostra sem ligante (g)
 * @returns {string} valor formatado ou '-'
 */
export function calcPassante(peneiras, pesosRetidos, index, pesoInicial) {
  if (!pesoInicial || pesoInicial <= 0) return '-';
  let acumulado = 0;
  for (let i = 0; i <= index; i++) {
    acumulado += pesosRetidos?.[peneiras[i].key] || 0;
  }
  return ((pesoInicial - acumulado) / pesoInicial * 100).toFixed(1);
}

/**
 * Extrai pedreira(s) de um projeto a partir de seus agregados.
 * @param {object} project
 * @returns {string}
 */
export function getPedreiraDoProjeto(project) {
  if (!project?.agregados?.length) return "";
  const pedreiras = project.agregados
    .map(ag => ag.pedreira)
    .filter(Boolean)
    .filter((p, idx, arr) => arr.indexOf(p) === idx);
  return pedreiras.join(", ");
}

/**
 * Constrói o patch de formData ao selecionar um projeto MRAF.
 * @param {string}   projectId
 * @param {object[]} projects
 * @param {object[]} faixas
 * @returns {object} patch de formData
 */
export function buildProjectPatch(projectId, projects, faixas) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return { project_id: "" };

  const faixa = faixas.find(f => f.id === project.faixa_granulometrica_id);
  return {
    project_id:        projectId,
    faixa_especificada: faixa ? faixa.nome : "Não definida",
    tipo_ligante:      project.ligante?.tipo || "",
    pedreira:          getPedreiraDoProjeto(project),
  };
}