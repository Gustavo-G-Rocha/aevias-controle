import React from "react";
import { User, Clock, FileEdit, Trash2, CheckCircle, XCircle, PenLine, Cloud } from "lucide-react";

const OPERATION_META = {
  create: { label: "Criação", icon: FileEdit, color: "text-blue-600", bg: "bg-blue-50" },
  update: { label: "Edição", icon: FileEdit, color: "text-amber-600", bg: "bg-amber-50" },
  delete: { label: "Exclusão", icon: Trash2, color: "text-red-600", bg: "bg-red-50" },
  approve: { label: "Aprovação", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  reject: { label: "Reprovação", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  sign: { label: "Assinatura", icon: PenLine, color: "text-indigo-600", bg: "bg-indigo-50" },
  approve_nc: { label: "Aprovação NC", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  reject_nc: { label: "Reprovação NC", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  solicitar_aprovacao_nc: { label: "Solicitar Aprovação NC", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  update_nc_status: { label: "Alteração de Status NC", icon: FileEdit, color: "text-amber-600", bg: "bg-amber-50" },
};

function formatValue(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
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
    <div className="relative pl-8 pb-6 border-l-2 border-slate-200 last:border-l-transparent">
      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${meta.bg} border-2 border-white flex items-center justify-center`}>
        <Icon className={`w-2.5 h-2.5 ${meta.color}`} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
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
        <div className="mt-2 space-y-1.5">
          {changes.map((change, idx) => (
            <div key={idx} className="text-sm bg-slate-50 rounded-md p-2 border border-slate-100">
              <div className="font-mono text-xs font-medium text-slate-600 mb-1">
                {change.field}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Anterior:</span>
                  <span className="text-red-600 break-words font-mono whitespace-pre-wrap">
                    {formatValue(change.old_value)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Novo:</span>
                  <span className="text-green-600 break-words font-mono whitespace-pre-wrap">
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