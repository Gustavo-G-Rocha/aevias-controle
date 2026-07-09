import React from "react";
import { User, Clock, FileEdit, Trash2, CheckCircle, XCircle, PenLine, Cloud, Minus, Plus } from "lucide-react";

const OPERATION_META = {
  create: { label: "Criação", icon: FileEdit, color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500" },
  update: { label: "Edição", icon: FileEdit, color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  delete: { label: "Exclusão", icon: Trash2, color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
  approve: { label: "Aprovação", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" },
  reject: { label: "Reprovação", icon: XCircle, color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
  sign: { label: "Assinatura", icon: PenLine, color: "text-indigo-600", bg: "bg-indigo-50", dot: "bg-indigo-500" },
  approve_nc: { label: "Aprovação NC", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" },
  reject_nc: { label: "Reprovação NC", icon: XCircle, color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
  solicitar_aprovacao_nc: { label: "Solicitar Aprovação NC", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  update_nc_status: { label: "Alteração de Status NC", icon: FileEdit, color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
};

// Traduz chaves técnicas para rótulos legíveis
const FIELD_LABELS = {
  approved: "Aprovação",
  approved_by: "Aprovado por",
  approved_date: "Data de aprovação",
  approver_details: "Detalhes do aprovador",
  rejection_reason: "Motivo da reprovação",
  was_rejected: "Foi rejeitado",
  status: "Status",
  client_signature: "Assinatura do cliente",
  laboratorista_name: "Laboratorista",
  engenheiro_responsavel: "Engenheiro responsável",
  observacoes: "Observações",
  observacoes_gerais: "Observações gerais",
  acoes_corretivas_realizado: "Ações corretivas realizadas",
  acoes_corretivas_descricao: "Descrição de ações corretivas",
  nao_conformidades: "Não conformidades",
  fotos: "Fotos",
  rodovia: "Rodovia",
  trecho: "Trecho",
  empreiteira: "Empreiteira",
  material: "Material",
  camada: "Camada",
  data: "Data",
  data_ensaio: "Data do ensaio",
  jornada: "Jornada",
  condicoes_climaticas: "Condições climáticas",
  temperatura: "Temperatura",
  temperatura_ambiente: "Temperatura ambiente",
  sample_id: "ID da amostra",
  location: "Local",
  extraction_date: "Data de extração",
  peso: "Peso",
  pesos: "Pesos",
  fck: "FCK",
  volume: "Volume",
  concreteira: "Concreteira",
  estrutura: "Estrutura",
  inspetor_campo: "Inspetor de campo",
  inspetor_fiscal: "Inspetor fiscal",
  ensaio_realizado_por: "Ensaio realizado por",
  project_id: "Projeto",
  obra_id: "Obra",
};

function getFieldLabel(field) {
  return FIELD_LABELS[field] || field?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || field;
}

function formatValue(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    if (value.length === 0) return "Lista vazia";
    if (value.every(v => typeof v !== "object" || v === null)) {
      return value.join(", ");
    }
    return `${value.length} ${value.length === 1 ? "item" : "itens"}`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return "—";
    return keys.map(k => `${getFieldLabel(k)}: ${formatValue(value[k])}`).join("; ");
  }
  return String(value);
}

// Rótulos legíveis para sub-campos de granulometria e outros objetos aninhados
const SUB_FIELD_LABELS = {
  retido: "Retido",
  passante: "Passante",
  nome: "Nome",
  peso_umido: "Peso úmido",
  peso_seco: "Peso seco",
  agua: "Água",
  umidade: "Umidade",
  granulometria: "Granulometria",
  medicoes: "Medições",
  media: "Média",
  topo_argila: "Topo argila",
  topo_areia: "Topo areia",
  equivalente: "Equivalente",
  numero: "Nº",
  numero_carga: "Nº carga",
  placa: "Placa",
  hora_saida: "Hora saída",
  peso_toneladas: "Peso (t)",
  hora_chegada: "Hora chegada",
  temp_chegada: "Temp. chegada",
  hora_aplicacao: "Hora aplicação",
  temp_espalhamento: "Temp. espalhamento",
  temp_compactacao: "Temp. compactação",
  pista: "Pista",
  espessura_cm: "Espessura (cm)",
  estaca_inicial: "Estaca inicial",
  estaca_final: "Estaca final",
  observacoes: "Obs.",
  horario_inicio: "Início",
  horario_fim: "Fim",
  signed_by: "Assinado por",
  signed_date: "Data assinatura",
  engineer_name: "Nome engenheiro",
  crea_number: "CREA",
  name: "Nome",
  position: "Cargo",
  densidade_seca_max: "Densidade seca máx.",
  umidade_otima: "Umidade ótima",
  realizado: "Realizado",
  conforme: "Conforme",
  resultado: "Resultado",
  quantidade: "Quantidade",
  resultados: "Resultados",
  limite: "Limite",
};

// Mapeia nomes de peneiras para rótulos legíveis
const SIEVE_LABELS = {
  peneira_75_0mm: "Peneira 75.0mm",
  peneira_63_0mm: "Peneira 63.0mm",
  peneira_50_0mm: "Peneira 50.0mm",
  peneira_38_1mm: "Peneira 38.1mm",
  peneira_37_5mm: "Peneira 37.5mm",
  peneira_25_0mm: "Peneira 25.0mm",
  peneira_19_0mm: "Peneira 19.0mm",
  peneira_16_0mm: "Peneira 16.0mm",
  peneira_12_5mm: "Peneira 12.5mm",
  peneira_9_5mm: "Peneira 9.5mm",
  peneira_6_3mm: "Peneira 6.3mm",
  peneira_4_75mm: "Peneira 4.75mm",
  peneira_2_36mm: "Peneira 2.36mm",
  peneira_2_0mm: "Peneira 2.0mm",
  peneira_1_18mm: "Peneira 1.18mm",
  peneira_0_6mm: "Peneira 0.6mm",
  peneira_0_42mm: "Peneira 0.42mm",
  peneira_0_3mm: "Peneira 0.3mm",
  peneira_0_18mm: "Peneira 0.18mm",
  peneira_0_15mm: "Peneira 0.15mm",
  peneira_0_075mm: "Peneira 0.075mm",
};

function getSubFieldLabel(key) {
  return SUB_FIELD_LABELS[key] || SIEVE_LABELS[key] || getFieldLabel(key);
}

/**
 * Achata um objeto/array aninhado em pares { path, label, value } no nível folha.
 * Cada folha vira uma linha de diff.
 */
function flattenToLeaves(value, basePath = "", baseLabel = "") {
  if (value === null || value === undefined) {
    return [{ path: basePath || "_root", label: baseLabel || "Valor", value: "—" }];
  }
  if (typeof value !== "object") {
    return [{ path: basePath || "_root", label: baseLabel || "Valor", value: formatValue(value) }];
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return [{ path: basePath, label: baseLabel, value: "Lista vazia" }];
    // Arrays de primitivos → um único diff com a lista inteira
    if (value.every(v => typeof v !== "object" || v === null)) {
      return [{ path: basePath, label: baseLabel, value: value.join(", ") }];
    }
    // Arrays de objetos → expandir cada item
    const leaves = [];
    value.forEach((item, idx) => {
      const itemLabel = `${baseLabel} #${idx + 1}`;
      const subLeaves = flattenToLeaves(item, `${basePath}[${idx}]`, itemLabel);
      leaves.push(...subLeaves);
    });
    return leaves;
  }
  // Objeto plano → expandir cada chave
  const keys = Object.keys(value);
  if (keys.length === 0) return [{ path: basePath, label: baseLabel, value: "—" }];
  const leaves = [];
  keys.forEach(k => {
    const childPath = basePath ? `${basePath}.${k}` : k;
    const childLabel = baseLabel ? `${baseLabel} › ${getSubFieldLabel(k)}` : getSubFieldLabel(k);
    leaves.push(...flattenToLeaves(value[k], childPath, childLabel));
  });
  return leaves;
}

/**
 * Compara old_value e new_value de um change e retorna pares de diff linha-a-linha.
 * Cada par: { label, oldValue, newValue, changed }
 */
function buildDiffRows(change) {
  const oldLeaves = flattenToLeaves(change.old_value, "", getFieldLabel(change.field));
  const newLeaves = flattenToLeaves(change.new_value, "", getFieldLabel(change.field));

  // Se ambos são folhas únicas, compara direto
  if (oldLeaves.length === 1 && newLeaves.length === 1) {
    return [{
      label: oldLeaves[0].label,
      oldValue: oldLeaves[0].value,
      newValue: newLeaves[0].value,
      changed: oldLeaves[0].value !== newLeaves[0].value,
    }];
  }

  // Caso geral: alinha por path
  const oldMap = new Map(oldLeaves.map(l => [l.path, l]));
  const newMap = new Map(newLeaves.map(l => [l.path, l]));
  const allPaths = [...new Set([...oldLeaves.map(l => l.path), ...newLeaves.map(l => l.path)])];

  return allPaths.map(path => {
    const oldLeaf = oldMap.get(path);
    const newLeaf = newMap.get(path);
    const oldVal = oldLeaf ? oldLeaf.value : "—";
    const newVal = newLeaf ? newLeaf.value : "—";
    return {
      label: (newLeaf || oldLeaf).label,
      oldValue: oldVal,
      newValue: newVal,
      changed: oldVal !== newVal,
    };
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChangeEntry({ entry }) {
  const meta = OPERATION_META[entry.operation] || OPERATION_META.update;
  const Icon = meta.icon;
  const changes = entry.changes || [];

  return (
    <div className="relative pl-8 pb-6 border-l-2 border-slate-200 last:border-l-transparent last:pb-0">
      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${meta.dot} border-2 border-white flex items-center justify-center shadow-sm`} />

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${meta.bg} ${meta.color} flex items-center gap-1`}>
          <Icon className="w-3 h-3" />
          {meta.label}
        </span>
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(entry.created_date)}
        </span>
        {entry.is_offline_sync && (
          <span className="text-xs text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full">
            <Cloud className="w-3 h-3" />
            Sincronizado offline
          </span>
        )}
      </div>

      <div className="text-sm text-slate-700 flex items-center gap-1.5 mb-2">
        <User className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-medium">{entry.changed_by_name || "—"}</span>
        {entry.changed_by && (
          <span className="text-slate-400">({entry.changed_by})</span>
        )}
      </div>

      {changes.length > 0 && (
        <div className="mt-2 space-y-2">
          {changes.map((change, idx) => {
            const diffRows = buildDiffRows(change);
            const changedCount = diffRows.filter(r => r.changed).length;
            return (
              <div key={idx} className="text-sm bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                <div className="text-xs font-semibold text-slate-700 px-3 py-2 flex items-center gap-1.5 border-b border-slate-200 bg-white/60">
                  <FileEdit className="w-3 h-3 text-slate-400" />
                  {getFieldLabel(change.field)}
                  {changedCount > 0 && (
                    <span className="ml-auto text-[10px] font-normal text-slate-400">
                      {changedCount} {changedCount === 1 ? "alteração" : "alterações"}
                    </span>
                  )}
                </div>
                <div className="divide-y divide-slate-100">
                  {diffRows.map((row, rIdx) => (
                    <div key={rIdx} className="px-3 py-1.5">
                      <div className="text-[11px] text-slate-500 font-medium mb-0.5">{row.label}</div>
                      {!row.changed ? (
                        <div className="text-xs text-slate-600 bg-slate-100/60 rounded px-2 py-0.5 break-words">
                          {row.newValue}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {row.oldValue !== "—" && (
                            <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50/60 rounded px-2 py-0.5">
                              <Minus className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-70" />
                              <span className="break-words line-through opacity-80">
                                {row.oldValue}
                              </span>
                            </div>
                          )}
                          {row.newValue !== "—" && (
                            <div className="flex items-start gap-1.5 text-xs text-green-700 bg-green-50/60 rounded px-2 py-0.5">
                              <Plus className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-70" />
                              <span className="break-words">{row.newValue}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}