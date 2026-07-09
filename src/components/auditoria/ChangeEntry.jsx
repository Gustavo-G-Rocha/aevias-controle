import React from "react";
import { User, Clock, FileEdit, Trash2, CheckCircle, XCircle, PenLine, Cloud } from "lucide-react";

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
          {changes.map((change, idx) => (
            <div key={idx} className="text-sm bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <FileEdit className="w-3 h-3 text-slate-400" />
                {getFieldLabel(change.field)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-red-50/50 rounded-md p-2 border border-red-100/50">
                  <span className="text-slate-400 block mb-0.5 text-[11px] uppercase tracking-wide font-medium">Anterior</span>
                  <span className="text-red-600 break-words">
                    {formatValue(change.old_value)}
                  </span>
                </div>
                <div className="bg-green-50/50 rounded-md p-2 border border-green-100/50">
                  <span className="text-slate-400 block mb-0.5 text-[11px] uppercase tracking-wide font-medium">Novo</span>
                  <span className="text-green-600 break-words">
                    {formatValue(change.new_value)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}