/**
 * Funções puras para AcompanhamentoUsinagem.
 * Sem dependências de React ou Base44.
 */

import { todayISO } from "@/utils/formInitialData";

// ── Estado inicial ────────────────────────────────────────────────────────────

export const getInitialFormData = () => ({
  obra_id: '',
  project_id: '',
  data: todayISO(),
  laboratorista_name: '',
  trecho: '',
  pedreira: '',
  numero_projeto: '',
  faixa_especificada: '',
  rodovia: '',
  usina: '',
  ligante_nome: '',
  temperatura_ligante: '',
  agregados: [],
  cargas: [],
  status: 'rascunho',
});

export const AGREGADO_VAZIO = (total = 0) => ({
  nome: `Agregado ${total + 1}`,
  composicao: '',
  umidade: '',
  temperatura_t1: '',
  temperatura_t2: '',
});

export const CARGA_VAZIA = () => ({
  placa_caminhao: '',
  hora_saida: '',
  peso: '',
  temperatura_1: '',
  temperatura_2: '',
  observacao: '',
});

// ── Projeto → formulário ──────────────────────────────────────────────────────

/**
 * Monta o patch do formData ao selecionar um projeto.
 * Retorna campos que devem ser mesclados (sem project_id e sem faixa — carregada async).
 */
export function buildProjectFormPatch(project) {
  const agregadosDoProjeto = project?.agregados?.map((agg, index) => ({
    nome: agg.nome || `Agregado ${index + 1}`,
    composicao: agg.percentual_mistura || '',
    umidade: '',
    temperatura_t1: '',
    temperatura_t2: '',
  })) || [];

  return {
    numero_projeto: project?.name || '',
    ligante_nome: project?.ligante?.tipo || '',
    pedreira: project?.agregados?.[0]?.pedreira || '',
    agregados: agregadosDoProjeto,
  };
}

/**
 * Monta o patch do formData ao selecionar uma obra.
 */
export function buildObraFormPatch(obra) {
  return {
    obra_id: obra?.id || '',
    project_id: '',
    rodovia: obra?.rodovias?.[0] || '',
    usina: obra?.usinas?.[0] || '',
  };
}

// ── Filtro de projetos por obra/regional ─────────────────────────────────────

/**
 * Filtra projetos CAUQ pertencentes à regional da obra selecionada.
 */
export function filtrarProjetosPorObra(obraId, obras, regionais, projects) {
  const obra = obras.find(o => o.id === obraId);
  if (!obra?.regional_id) return [];
  const regional = regionais.find(r => r.id === obra.regional_id);
  if (!regional?.project_ids) return [];
  return projects.filter(p => regional.project_ids.includes(p.id) && p.tipo_projeto === 'CAUQ');
}

// ── Sanitização para persistência ────────────────────────────────────────────

/**
 * Converte strings vazias em null para campos numéricos de agregados.
 */
export function sanitizeAgregados(agregados) {
  return agregados.map(agg => ({
    nome: agg.nome || '',
    composicao:     agg.composicao     === '' ? null : parseFloat(agg.composicao),
    umidade:        agg.umidade        === '' ? null : parseFloat(agg.umidade),
    temperatura_t1: agg.temperatura_t1 === '' ? null : parseFloat(agg.temperatura_t1),
    temperatura_t2: agg.temperatura_t2 === '' ? null : parseFloat(agg.temperatura_t2),
  }));
}

/**
 * Converte strings vazias em null para campos numéricos de cargas.
 */
export function sanitizeCargas(cargas) {
  return cargas.map(carga => ({
    placa_caminhao: carga.placa_caminhao || '',
    hora_saida:     carga.hora_saida     || '',
    peso:           carga.peso           === '' ? null : parseFloat(carga.peso),
    temperatura_1:  carga.temperatura_1  === '' ? null : parseFloat(carga.temperatura_1),
    temperatura_2:  carga.temperatura_2  === '' ? null : parseFloat(carga.temperatura_2),
    observacao:     carga.observacao     || '',
  }));
}

/**
 * Monta o objeto final para persistência.
 */
export function buildDataToSave(formData, finalizar, editingId) {
  return {
    ...formData,
    temperatura_ligante: formData.temperatura_ligante === '' ? null : parseFloat(formData.temperatura_ligante),
    agregados:  sanitizeAgregados(formData.agregados),
    cargas:     sanitizeCargas(formData.cargas),
    status:     finalizar ? 'finalizado' : 'rascunho',
    was_rejected: editingId && formData.approved === false ? true : (formData.was_rejected || false),
  };
}