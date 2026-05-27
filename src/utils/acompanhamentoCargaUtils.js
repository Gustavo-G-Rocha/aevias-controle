/**
 * Funções puras para AcompanhamentoCarga.
 * Sem dependências de React ou Base44.
 */

// ── Estado inicial ────────────────────────────────────────────────────────────

export const getInitialFormData = () => ({
  obra_id: "",
  project_id: "",
  data: new Date().toISOString().split('T')[0],
  jornada: { horario_inicio: "", horario_fim: "" },
  laboratorista_name: "",
  rodovia: "",
  trecho: "",
  sub_trecho: "",
  usina_fornecedora: "",
  servico: "",
  cargas: [],
  observacoes_gerais: "",
  status: "rascunho",
});

export const getInitialCarga = (numeroCarga) => ({
  numero_carga: numeroCarga,
  placa: "",
  hora_saida: "",
  peso_toneladas: null,
  hora_chegada: "",
  temp_chegada: null,
  hora_aplicacao: "",
  temp_espalhamento: null,
  temp_compactacao: null,
  pista: "",
  espessura_cm: null,
  estaca_inicial: "",
  estaca_final: "",
  observacoes: "",
});

// ── Filtros ───────────────────────────────────────────────────────────────────

/**
 * Filtra obras para exibição (apenas conservacao e implantacao).
 */
export function filtrarObras(obras) {
  return obras.filter(o => o.tipo_obra === 'conservacao' || o.tipo_obra === 'implantacao');
}

/**
 * Filtra projetos disponíveis por regional da obra (apenas tipo CAUQ).
 */
export function filtrarProjetosDisponiveis(obraId, obras, regionais, projects) {
  const obra = obras.find(o => o.id === obraId);
  const regional = regionais.find(r => r.id === obra?.regional_id);
  return projects.filter(p => regional?.project_ids?.includes(p.id) && p.tipo_projeto === 'CAUQ');
}

// ── Permissões ────────────────────────────────────────────────────────────────

/**
 * Determina se o formulário pode ser editado.
 */
export function calcCanEdit(editMode, formData, userEmail) {
  return !editMode || (!formData.approved && formData.created_by === userEmail);
}

// ── Manipulação de cargas ─────────────────────────────────────────────────────

export const MAX_CARGAS = 20;

/**
 * Adiciona uma nova carga à lista, respeitando o limite de MAX_CARGAS.
 * Retorna null se o limite foi atingido.
 */
export function addCarga(cargas) {
  if (cargas.length >= MAX_CARGAS) return null;
  return [...cargas, getInitialCarga(cargas.length + 1)];
}

/**
 * Remove a carga pelo índice.
 */
export function removeCarga(cargas, index) {
  return cargas.filter((_, i) => i !== index);
}

/**
 * Atualiza um campo de uma carga pelo índice.
 */
export function updateCarga(cargas, index, field, value) {
  return cargas.map((carga, i) => i === index ? { ...carga, [field]: value } : carga);
}

// ── Validação ─────────────────────────────────────────────────────────────────

/**
 * Valida os dados antes de salvar.
 * Retorna string de erro ou null se válido.
 */
export function validateFormData(formData, finalizar) {
  if (!formData.obra_id || !formData.data) {
    return "Preencha os campos obrigatórios: Obra e Data.";
  }
  if (finalizar && formData.cargas.length === 0) {
    return "Adicione pelo menos uma carga antes de finalizar.";
  }
  return null;
}

// ── Persistência ──────────────────────────────────────────────────────────────

/**
 * Monta o payload para criação/atualização.
 */
export function buildDataToSave(formData, finalizar) {
  return { ...formData, status: finalizar ? "finalizado" : "rascunho" };
}