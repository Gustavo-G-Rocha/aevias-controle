export const TIPOS_CHECKLIST = [
  { value: "DiarioObra", label: "Diário de Obra" },
  { value: "ChecklistUsina", label: "Checklist de Usina" },
  { value: "ChecklistAplicacao", label: "Checklist de Aplicação" },
  { value: "ChecklistMRAF", label: "Checklist MRAF" },
  { value: "ChecklistConcretagem", label: "Checklist de Concretagem" },
  { value: "ChecklistTerraplanagem", label: "Checklist de Terraplanagem" },
  { value: "ChecklistReciclagem", label: "Checklist de Reciclagem" }
];

export const INITIAL_FORM_DATA = {
  numero_rnc: "",
  cliente: "",
  rodovia: "",
  trecho: "",
  fiscal: "",
  data_nc: new Date().toISOString().split("T")[0],
  campo: "",
  executora: "",
  contrato: "",
  descricao_nc: "",
  acoes: "",
  local_nc: "",
  categoria_nc: "",
  parametro_nc: ""
};

export function validateNovaNC(obraId, form) {
  const errors = [];
  if (!obraId || obraId.trim() === "") {
    errors.push("Obra é obrigatória");
  }
  if (!form.descricao_nc || form.descricao_nc.trim() === "") {
    errors.push("Descrição da NC é obrigatória");
  }
  if (!form.data_nc || form.data_nc.trim() === "") {
    errors.push("Data da NC é obrigatória");
  }
  return errors;
}

export function mapChecklistToForm(checklist, currentForm) {
  if (!checklist) return currentForm;
  return {
    ...currentForm,
    rodovia: checklist.rodovia || currentForm.rodovia,
    trecho: checklist.trecho || currentForm.trecho,
    campo: checklist.laboratorista_name || currentForm.campo,
    data_nc: checklist.data || currentForm.data_nc,
    executora: checklist.empreiteira || checklist.usina || currentForm.executora
  };
}

export function mapObraToForm(obra, regional, currentForm) {
  if (!obra) return currentForm;
  return {
    ...currentForm,
    cliente: regional?.cliente || "",
    contrato: obra.code || "",
    executora: (obra.empreiteiras || [])[0] || "",
    rodovia: (obra.rodovias || [])[0] || ""
  };
}

export function getChecklistDisplayLabel(checklist) {
  if (!checklist) return "";
  const parts = [];
  if (checklist.data) parts.push(checklist.data);
  if (checklist.rodovia) parts.push(checklist.rodovia);
  if (checklist.trecho) parts.push(checklist.trecho);
  return parts.join(" – ");
}

export function findChecklistById(checklists, id) {
  if (!checklists || !Array.isArray(checklists)) return undefined;
  return checklists.find(c => c.id === id);
}

export function isChecklistFound(checklists, id) {
  return findChecklistById(checklists, id) !== undefined;
}

export function filterChecklistsByObra(checklists, obraId) {
  if (!checklists || !Array.isArray(checklists) || !obraId) return [];
  return checklists.filter(c => c.obra_id === obraId);
}

export function initializeFormWithUser(user) {
  return {
    relatorio_criador: user?.laboratorista_name || user?.full_name || ""
  };
}

export function prepareNCPayload(form, obraId, obras, tipoChecklist, checklistId, user, fotos, pdfs) {
  const managerName = user?.laboratorista_name || user?.full_name || "";
  return {
    ...form,
    obra_id: obraId,
    obra_nome: obras.find(o => o.id === obraId)?.name || "",
    relatorio_criador: managerName,
    checklist_ref_tipo: tipoChecklist,
    checklist_ref_id: checklistId,
    fotos,
    pdfs: (pdfs || []).map(p => ({ url: p.url || p, nome: p.nome || p })),
    status: "aberta",
    pendente_aprovacao_cliente: true,
    manager_signature: {
      signed_by: user?.email || "",
      signed_date: new Date().toISOString(),
      manager_name: managerName,
      crea_number: user?.crea_number || ""
    }
  };
}