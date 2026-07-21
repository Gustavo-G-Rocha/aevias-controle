/**
 * Funções puras para ControleExecucaoServicos.
 * Sem dependências de React ou Base44.
 */

import { todayISO } from "@/utils/formInitialData";

// ── Estado inicial ────────────────────────────────────────────────────────────

export const getInitialFormData = () => ({
  obra_id: "",
  data: todayISO(),
  laboratorista_name: "",
  rodovia: "",
  trecho: "",
  servicos: [],
  fotos: [],
  observacoes_gerais: "",
  status: "rascunho",
});

export const getInitialServico = () => ({
  servico: "",
  estaca_inicial: "",
  estaca_final: "",
  comprimento_m: null,
  espessura_cm: null,
  largura_m: null,
  quantidade: null,
  executora: "",
});

// ── Filtros ───────────────────────────────────────────────────────────────────

/**
 * Filtra obras para exibição (apenas gerenciamento).
 */
export function filtrarObras(obras) {
  return obras.filter(o => o.tipo_obra === 'gerenciamento');
}

// ── Permissões ────────────────────────────────────────────────────────────────

export function calcCanEdit(editMode, formData, userEmail) {
  return !editMode || (!formData.approved && formData.created_by === userEmail);
}

// ── Manipulação de serviços ───────────────────────────────────────────────────

export const MAX_SERVICOS = 15;

export function addServico(servicos) {
  if (servicos.length >= MAX_SERVICOS) return null;
  return [...servicos, getInitialServico()];
}

export function removeServico(servicos, index) {
  return servicos.filter((_, i) => i !== index);
}

export function updateServico(servicos, index, field, value) {
  return servicos.map((s, i) => i === index ? { ...s, [field]: value } : s);
}

// ── Validação ─────────────────────────────────────────────────────────────────

export function validateFormData(formData, finalizar) {
  if (!formData.obra_id || !formData.data) {
    return "Preencha os campos obrigatórios: Obra e Data.";
  }
  if (finalizar && formData.servicos.length === 0) {
    return "Adicione pelo menos um serviço antes de finalizar.";
  }
  if (finalizar && formData.servicos.some(s => !s.servico)) {
    return "Descreva todos os serviços adicionados antes de finalizar.";
  }
  return null;
}

// ── Persistência ──────────────────────────────────────────────────────────────

export function buildDataToSave(formData, finalizar) {
  return { ...formData, status: finalizar ? "finalizado" : "rascunho" };
}