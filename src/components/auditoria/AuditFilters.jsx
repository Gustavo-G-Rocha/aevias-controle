import React from "react";
import { Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EVENT_TYPE_OPTIONS = [
  { value: "", label: "Todos os eventos" },
  { value: "create", label: "Criação" },
  { value: "update", label: "Edição" },
  { value: "delete", label: "Exclusão" },
  { value: "approve", label: "Aprovação" },
  { value: "reject", label: "Reprovação" },
  { value: "sign", label: "Assinatura" },
  { value: "login_success", label: "Login" },
  { value: "login_failure", label: "Login Falhou" },
  { value: "logout", label: "Logout" },
  { value: "logout_inactivity", label: "Logout (Inatividade)" },
  { value: "password_reset_request", label: "Solicitação Reset" },
  { value: "password_reset", label: "Redefinição de Senha" },
  { value: "report_exported", label: "Exportação de Relatório" },
  { value: "permission_updated", label: "Permissão Alterada" },
  { value: "user_created", label: "Usuário Criado" },
  { value: "user_deactivated", label: "Usuário Desativado" },
];

export default function AuditFilters({ filters, onChange, onClear }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  const hasActiveFilters = filters.operation || filters.changed_by || filters.date_start || filters.date_end;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter className="w-4 h-4 text-slate-400" />
          Filtros
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs">
            <X className="w-3 h-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Tipo de Evento</Label>
          <Select
            value={filters.operation || "__all__"}
            onValueChange={(value) => update("operation", value === "__all__" ? "" : value)}
          >
            <SelectTrigger className="h-9 min-h-9 bg-white text-slate-700">
              <SelectValue placeholder="Todos os eventos" />
            </SelectTrigger>
            <SelectContent title="Tipo de Evento">
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value || "__all__"} value={opt.value || "__all__"}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Usuário (email)</Label>
          <Input
            type="text"
            placeholder="ex: user@afirmaevias.com.br"
            value={filters.changed_by || ""}
            onChange={(e) => update("changed_by", e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Data Inicial</Label>
          <Input
            type="date"
            value={filters.date_start || ""}
            onChange={(e) => update("date_start", e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Data Final</Label>
          <Input
            type="date"
            value={filters.date_end || ""}
            onChange={(e) => update("date_end", e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
}