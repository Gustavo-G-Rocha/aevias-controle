/**
 * Funções puras para RegistroFresagemCBUQ.
 * Sem dependências de React ou Base44.
 */

import { todayISO } from "@/utils/formInitialData";
import { canUserEditRecord } from "@/utils/recordEditPermission";

// ── Estado inicial ────────────────────────────────────────────────────────────

export const getInitialFormData = () => ({
  obra_id: "",
  project_id: "",
  data: todayISO(),
  data_fim: "",
  laboratorista_name: "",
  contratada: "",
  numero_contrato: "",
  especificacao_granulometrica: "",
  material: "",
  camada: "",
  rodovia: "",
  sentido_pista: "",
  condicoes_tempo: { manha: "", tarde: "", noite: "" },
  tipo_localizacao: "km",
  registros: [],
  dmt: null,
  fotos: [],
  observacoes: "",
  status: "rascunho",
});

export const getInitialRegistro = () => ({
  localizacao_inicial: "",
  localizacao_final: "",
  faixa: "",
  largura_m: null,
  extensao_m: null,
  espessura_m: null,
  pintura_bd_be_mts: null,
  pintura_4x12_qtde: null,
  pintura_2x2_qtde: null,
  pintura_zebrado_mts: null,
  tacha_bd_be_unid: null,
  tacha_4x12_unid: null,
  tacha_2x2_unid: null,
  tacha_zebrado_unid: null,
  dreno_m: null,
});

// ── Filtros ───────────────────────────────────────────────────────────────────

/**
 * Filtra obras para exibição (supervisão e conservação — onde há fresagem/CBUQ).
 */
export function filtrarObras(obras) {
  return obras.filter(o => o.tipo_obra === 'supervisao' || o.tipo_obra === 'conservacao');
}

// ── Permissões ────────────────────────────────────────────────────────────────

export function calcCanEdit(editMode, formData, user, obra, regionais = []) {
  if (!editMode) return true;
  if (formData.approved || formData.client_signature?.signed_by) return false;
  return canUserEditRecord(user, formData, obra, regionais);
}

// ── Manipulação de linhas ─────────────────────────────────────────────────────

export const MAX_REGISTROS = 30;

export function addRegistro(registros) {
  if (registros.length >= MAX_REGISTROS) return null;
  return [...registros, getInitialRegistro()];
}

export function removeRegistro(registros, index) {
  return registros.filter((_, i) => i !== index);
}

export function updateRegistro(registros, index, field, value) {
  return registros.map((r, i) => i === index ? { ...r, [field]: value } : r);
}

// ── Validação ─────────────────────────────────────────────────────────────────

export function validateFormData(formData, finalizar) {
  if (!formData.obra_id || !formData.data) {
    return "Preencha os campos obrigatórios: Obra e Início da Atividade.";
  }
  if (finalizar && !formData.rodovia) {
    return "Selecione a rodovia antes de finalizar.";
  }
  if (finalizar && formData.registros.length === 0) {
    return "Adicione pelo menos um lançamento antes de finalizar.";
  }
  if (finalizar && formData.registros.some(r => !r.localizacao_inicial || !r.localizacao_final)) {
    return "Informe a localização inicial e final de todos os lançamentos antes de finalizar.";
  }
  return null;
}

// ── Persistência ──────────────────────────────────────────────────────────────

export function buildDataToSave(formData, finalizar) {
  return { ...formData, status: finalizar ? "finalizado" : "rascunho" };
}