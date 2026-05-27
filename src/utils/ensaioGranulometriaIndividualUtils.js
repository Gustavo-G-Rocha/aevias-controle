/**
 * Funções puras para EnsaioGranulometriaIndividual.
 * Sem dependências de React ou Base44.
 */
import { filtrarPeneirasPorFaixa, PENEIRAS_CONFIG } from "@/constants/sieves";

// ── Estado inicial ────────────────────────────────────────────────────────────

export const AGREGADO_VAZIO = () => ({
  nome: "", peso_umido: "", peso_seco: "", agua: "", umidade: "", granulometria: {},
});

export const getInitialFormData = () => ({
  obra_id: "",
  project_id: "",
  tipo_material: "",
  data_ensaio: new Date().toISOString().split('T')[0],
  horario: "",
  rodovia: "",
  pedreira: "",
  faixa: "",
  local_coleta: "",
  agregados: [AGREGADO_VAZIO()],
  equivalente_areia: {
    medicoes: [
      { topo_argila: "", topo_areia: "", equivalente: "" },
      { topo_argila: "", topo_areia: "", equivalente: "" },
      { topo_argila: "", topo_areia: "", equivalente: "" },
    ],
    media: "",
  },
  observacoes: "",
  status: "rascunho",
});

// ── Campos permitidos (proteção contra prototype pollution) ───────────────────

export const AGREGADO_CAMPOS_PERMITIDOS = ['nome', 'peso_umido', 'peso_seco'];
export const GRANULOMETRIA_CAMPOS_PERMITIDOS = ['retido', 'passante'];
export const EQUIVALENTE_CAMPOS_PERMITIDOS = ['topo_argila', 'topo_areia'];

// ── Cálculos de agregado ──────────────────────────────────────────────────────

/**
 * Calcula água e umidade a partir de peso úmido e peso seco.
 * @returns {{ agua: string, umidade: string } | {}}
 */
export function calcAgregadoUmidade(pesoUmidoStr, pesoSecoStr) {
  const pesoUmido = parseFloat(pesoUmidoStr) || 0;
  const pesoSeco  = parseFloat(pesoSecoStr)  || 0;
  if (!pesoUmido) return {};
  const agua    = (pesoUmido - pesoSeco).toFixed(2);
  const umidade = pesoSeco > 0
    ? (((pesoUmido - pesoSeco) / pesoSeco) * 100).toFixed(2)
    : "";
  return { agua, umidade };
}

/**
 * Recalcula os passantes de todas as peneiras para um agregado.
 * @param {object} granulometria - mapa pKey → { retido, passante }
 * @param {number} pesoSeco
 * @param {object|null} selectedFaixa
 * @returns {object} granulometria atualizada (novo objeto)
 */
export function recalcPassantes(granulometria, pesoSeco, selectedFaixa) {
  if (!pesoSeco || pesoSeco <= 0) return granulometria;
  const peneirasKeys = filtrarPeneirasPorFaixa(selectedFaixa, PENEIRAS_CONFIG).map(p => p.key);
  const updated = { ...granulometria };
  let retidoAcumulado = 0;
  peneirasKeys.forEach(pKey => {
    const retido = parseFloat(updated[pKey]?.retido) || 0;
    retidoAcumulado += retido;
    updated[pKey] = {
      ...(updated[pKey] || {}),
      passante: ((pesoSeco - retidoAcumulado) / pesoSeco * 100).toFixed(2),
    };
  });
  return updated;
}

// ── Cálculos de equivalente de areia ─────────────────────────────────────────

/**
 * Calcula o equivalente de areia para uma medição.
 * @returns {string} valor formatado ou ""
 */
export function calcEquivalente(topoArgilaStr, topoAreiaStr) {
  const h1 = parseFloat(topoArgilaStr) || 0;
  const h2 = parseFloat(topoAreiaStr)  || 0;
  if (!h1 || !h2) return "";
  return ((h2 / h1) * 100).toFixed(2);
}

/**
 * Calcula a média dos equivalentes válidos de uma lista de medições.
 * @param {object[]} medicoes
 * @returns {string}
 */
export function calcMediaEquivalente(medicoes) {
  const validos = medicoes.filter(m => m.equivalente && !isNaN(parseFloat(m.equivalente)));
  if (!validos.length) return "";
  return (validos.reduce((sum, m) => sum + parseFloat(m.equivalente), 0) / validos.length).toFixed(2);
}

// ── Projeto ───────────────────────────────────────────────────────────────────

/**
 * Extrai as pedreiras únicas dos agregados de um projeto.
 */
export function getPedreirasDoProjeto(projeto) {
  if (!projeto?.agregados?.length) return "";
  return [...new Set(projeto.agregados.map(a => a.pedreira).filter(Boolean))].join(' + ');
}

/**
 * Constrói os agregados iniciais a partir do projeto, adicionando um extra vazio
 * se o total for menor que 4.
 */
export function buildAgregadosDoProjeto(projeto) {
  const lista = projeto.agregados.map(agg => ({
    nome:         agg.nome || "",
    peso_umido:   "",
    peso_seco:    "",
    agua:         "",
    umidade:      "",
    granulometria: {},
  }));
  if (lista.length < 4) lista.push(AGREGADO_VAZIO());
  return lista;
}