/**
 * Utilitários puros para a página de Não Conformidades.
 * Sem dependências de React ou Base44 — 100% testáveis.
 */

// ---- Constants ----
export const TIPOS_CHECKLIST = [
  { value: "ChecklistUsina", label: "Checklist de Usina", page: "RelatorioChecklist" },
  { value: "ChecklistAplicacao", label: "Checklist de Aplicação", page: "RelatorioChecklistAplicacao" },
  { value: "ChecklistMRAF", label: "Checklist MRAF", page: "RelatorioChecklistMRAF" },
  { value: "ChecklistConcretagem", label: "Checklist de Concretagem", page: "RelatorioChecklistConcretagem" },
  { value: "ChecklistTerraplanagem", label: "Checklist de Terraplanagem", page: "RelatorioChecklistTerraplanagem" },
  { value: "ChecklistReciclagem", label: "Checklist de Reciclagem", page: "RelatorioChecklistReciclagem" },
];

export const TIPOS_COM_NC_EXPLICITA = [
  ...TIPOS_CHECKLIST,
  { value: "DiarioObra", label: "Diário de Obra", page: "RelatorioDiario" },
];

export const RNC_PAGE = "RelatorioNC";

export const OUTROS_TIPOS_REGISTRO = [
  { value: "AcompanhamentoCarga", label: "Acomp. de Cargas", page: "RelatorioAcompanhamentoCarga" },
  { value: "AcompanhamentoUsinagem", label: "Acomp. Usinagem", page: "RelatorioAcompanhamentoUsinagem" },
  { value: "EnsaioCAUQ", label: "Ensaio CAUQ", page: "RelatorioCAUQ" },
  { value: "EnsaioDensidade", label: "Ensaio de Densidade", page: "RelatorioEnsaio" },
  { value: "EnsaioDensidadeInSitu", label: "Densidade In Situ", page: "RelatorioDensidadeInSitu" },
  { value: "EnsaioGranAreia", label: "Granulometria + EA", page: "RelatorioEnsaio" },
  { value: "EnsaioGranulometriaIndividual", label: "Gran. Individual", page: "RelatorioGranulometriaIndividual" },
  { value: "EnsaioMRAF", label: "Ensaio MRAF", page: "RelatorioMRAF" },
  { value: "EnsaioManchaPendulo", label: "Mancha + Pêndulo", page: "RelatorioManchaPendulo" },
  { value: "EnsaioSondagem", label: "Sondagem", page: "RelatorioSondagem" },
  { value: "EnsaioTaxaMRAF", label: "Taxa MRAF", page: "RelatorioTaxaMRAF" },
  { value: "EnsaioTaxaPinturaImprimacao", label: "Taxa Pintura/Imprim.", page: "RelatorioTaxaPinturaImprimacao" },
  { value: "EnsaioVigaBenkelman", label: "Viga Benkelman", page: "RelatorioVigaBenkelman" },
  { value: "ChecklistReciclagem", label: "Checklist de Reciclagem", page: "RelatorioChecklistReciclagem" },
];

export const STATUS_COLORS = { aberta: "#dc2626", em_tratativa: "#d97706", encerrada: "#16a34a", cancelada: "#6b7280" };
export const STATUS_LABELS = { aberta: "Aberta", em_tratativa: "Em Tratativa", encerrada: "Finalizada", cancelada: "Cancelada" };
export const PARAM_COLORS = ["#dc2626","#d97706","#2563eb","#7c3aed","#0891b2","#be185d","#065f46","#92400e","#1e3a5f","#6b21a8"];
export const CHART_COLORS = ["#00233B","#566E3D","#d97706","#0891b2","#7c3aed","#dc2626","#be185d","#065f46","#92400e","#4ade80","#fb923c","#1e3a5f"];
export const TIMELINE_COLORS = ["#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#f97316","#14b8a6","#6366f1","#ef4444","#84cc16","#d946ef"];

// ---- Pure cross-filter functions ----
/**
 * Filtra RNCs por todas as dimensões ativas, exceto a dimensão `skip`.
 * Usar skip='sua_dimensao' nos gráficos para que cada um exiba sua própria distribuição.
 */
export function applyRncFilters(rncs, cncs, f, skip = null) {
  let r = rncs;
  if (skip !== 'obraId' && f.obraId) r = r.filter(x => x.obra_id === f.obraId);
  if (skip !== 'status' && f.status) r = r.filter(x => x.status === f.status);
  if (skip !== 'empreiteira' && f.empreiteira) r = r.filter(x => (x.executora || '') === f.empreiteira);
  if (skip !== 'rodovia' && f.rodovia) r = r.filter(x => (x.rodovia || '') === f.rodovia);
  if (skip !== 'parametro' && f.parametro) {
    const ids = new Set(cncs.filter(nc => nc.parametro === f.parametro).map(nc => nc.obra_id));
    r = r.filter(x => ids.has(x.obra_id));
  }
  if (skip !== 'data' && (f.dataInicial || f.dataFinal)) {
    r = r.filter(x => {
      if (!x.data_nc) return false;
      const dataRnc = new Date(x.data_nc);
      if (f.dataInicial && dataRnc < f.dataInicial) return false;
      if (f.dataFinal) {
        const dataFinalMidnight = new Date(f.dataFinal);
        dataFinalMidnight.setHours(23, 59, 59, 999);
        if (dataRnc > dataFinalMidnight) return false;
      }
      return true;
    });
  }
  return r;
}

/**
 * Filtra CNCs (NCs de checklist) por todas as dimensões ativas, exceto a dimensão `skip`.
 */
export function applyCncFilters(cncs, rncs, f, skip = null) {
  let r = cncs;
  if (skip !== 'obraId' && f.obraId) r = r.filter(nc => nc.obra_id === f.obraId);
  if (skip !== 'parametro' && f.parametro) r = r.filter(nc => nc.parametro === f.parametro);
  if (skip !== 'empreiteira' && f.empreiteira) r = r.filter(nc => (nc.empreiteira || '') === f.empreiteira);
  if (skip !== 'rodovia' && f.rodovia) r = r.filter(nc => (nc.rodovia || '') === f.rodovia);
  if (skip !== 'usina' && f.usina) r = r.filter(nc => (nc.usina || '') === f.usina);
  if (skip !== 'status' && f.status) {
    const ids = new Set(rncs.filter(x => x.status === f.status).map(x => x.obra_id));
    r = r.filter(nc => ids.has(nc.obra_id));
  }
  if (skip !== 'data' && (f.dataInicial || f.dataFinal)) {
    r = r.filter(nc => {
      if (!nc.data) return false;
      const dataNc = new Date(nc.data);
      if (f.dataInicial && dataNc < f.dataInicial) return false;
      if (f.dataFinal) {
        const dataFinalMidnight = new Date(f.dataFinal);
        dataFinalMidnight.setHours(23, 59, 59, 999);
        if (dataNc > dataFinalMidnight) return false;
      }
      return true;
    });
  }
  return r;
}

/**
 * Extrai parâmetros não conformes de um checklist com base no seu tipo.
 * Retorna array de strings com os nomes dos parâmetros não conformes.
 */
export function extrairNaoConformidadesChecklist(checklist, tipo) {
  const ncs = [];
  if (tipo === 'ChecklistUsina' && checklist.controle_cauq) {
    ['extracao_ligante_rotarex','extracao_ligante_soxhlet','granulometria','volume_vazios','rbv','rtcd_25c','estabilidade','fluencia'].forEach(key => {
      const e = checklist.controle_cauq[key];
      if (e?.realizado && e.conforme === false) ncs.push(key.replace(/_/g,' '));
    });
    if (checklist.equivalente_areia_status === 'realizado') {
      const limite = checklist.projeto_equivalente_areia_minimo || 55;
      (checklist.equivalente_areia_resultados || []).forEach(r => { if (r < limite) ncs.push('Equivalente de Areia'); });
    }
  }
  if (tipo === 'ChecklistAplicacao') {
    if (checklist.pintura_ligacao?.taxa_pintura?.realizado && checklist.pintura_ligacao.taxa_pintura.conforme === false) ncs.push('Taxa de Pintura');
    if (checklist.pintura_ligacao?.taxa_pintura_residual?.realizado && checklist.pintura_ligacao.taxa_pintura_residual.conforme === false) ncs.push('Taxa de Pintura Residual');
    if (checklist.controle_aplicacao?.temp_aplicacao_cargas?.realizado && checklist.controle_aplicacao.temp_aplicacao_cargas.conforme === false) ncs.push('Temperatura de Aplicação');
    if (checklist.controle_aplicacao?.espessura_camada?.realizado && checklist.controle_aplicacao.espessura_camada.conforme === false) ncs.push('Espessura da Camada');
  }
  if (tipo === 'ChecklistConcretagem') {
    (checklist.cargas_concreto || []).forEach(carga => {
      if (carga.slump_test?.realizado && carga.slump_test.conforme === false) ncs.push('Slump Test');
      if (carga.espessura_camada?.realizado && carga.espessura_camada.conforme === false) ncs.push('Espessura (Concretagem)');
    });
  }
  if (tipo === 'ChecklistTerraplanagem' && checklist.ensaios_empreiteira) {
    ['compactacao_proctor','isc','umidade_frigideira','massa_especifica_in_situ','granulometria'].forEach(key => {
      const d = checklist.ensaios_empreiteira[key];
      if (d?.realizado && d.conforme === false) ncs.push(key.replace(/_/g,' '));
    });
  }
  if (tipo === 'ChecklistMRAF' && checklist.acompanhamento_aplicacao) {
    ['taxa_aplicacao','residuo_emulsao','espessura_camada'].forEach(key => {
      const d = checklist.acompanhamento_aplicacao[key];
      if (d?.realizado && d.conforme === false) ncs.push(key.replace(/_/g,' ') + ' (MRAF)');
    });
  }
  return ncs;
}

/**
 * Converte um registro de outro tipo (approved===false ou condicao_conformidade) em linha CNC normalizada.
 */
export function mapOutroRegistroToCnc(c, tipo) {
  return {
    id: c.id, obra_id: c.obra_id,
    parametro: tipo.label, tipo: tipo.value,
    laboratorista_name: c.laboratorista_name || '',
    data: c.data || c.data_ensaio || c.extraction_date || c.collection_date || '',
    empreiteira: c.empreiteira || '', rodovia: c.rodovia || '',
    usina: c.usina || c.usina_fornecedora || c.usina_selecionada || '',
    _page: tipo.page,
  };
}

/**
 * Converte uma NC explícita de um registro (checklist, diário, etc.) em linha CNC normalizada.
 */
export function mapNcExplicitaToCnc(registro, nc, tipo) {
  const parametro = [nc.categoria_nc, nc.parametro_nc].filter(Boolean).join(' / ') || nc.descricao || 'NC';
  return {
    id: registro.id, obra_id: registro.obra_id, parametro,
    tipo: tipo.value, laboratorista_name: registro.laboratorista_name || '',
    data: registro.data || '', empreiteira: registro.empreiteira || '',
    rodovia: registro.rodovia || '', usina: registro.usina || registro.usina_selecionada || '',
    _page: tipo.page, _ncLocal: nc.local_nc || '',
  };
}

/**
 * Retorna true se o registro de outro tipo deve ser considerado NC.
 */
export function isOutroRegistroNaoConforme(registro, tipoValue) {
  if (tipoValue === 'EnsaioManchaPendulo' || tipoValue === 'EnsaioVigaBenkelman') {
    return registro.condicao_conformidade === 'NÃO CONFORME';
  }
  return registro.approved === false;
}