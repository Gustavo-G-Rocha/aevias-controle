import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

const FIELDS = [
  { key: "placa_caminhao", label: "Placa Caminhão" },
  { key: "hora_saida", label: "Hora de Saída", type: "time" },
  { key: "peso", label: "Peso (t)", type: "number", step: "0.01" },
  { key: "temperatura_1", label: "Temperatura 1 (°C)", type: "number", step: "0.1" },
  { key: "temperatura_2", label: "Temperatura 2 (°C)", type: "number", step: "0.1" },
];

/**
 * Card mobile (<1024px) de uma carga do Acompanhamento de Usinagem —
 * substitui a linha da tabela por um card empilhado (padrão CamadaMobileCard).
 */
export default function UsinagemCargaMobileCard({ carga, index, isEditable, onChange, onRemove }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">Carga {index + 1}</span>
        {isEditable && (
          <button type="button" onClick={onRemove} aria-label="Remover carga" className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <Label className="text-xs">{f.label}</Label>
            <Input
              type={f.type || "text"}
              step={f.step}
              value={carga[f.key] ?? ""}
              onChange={(e) => onChange(index, f.key, e.target.value)}
              disabled={!isEditable}
              className="h-9 text-sm bg-background"
            />
          </div>
        ))}
      </div>
      <div>
        <Label className="text-xs">Observação</Label>
        <Input
          value={carga.observacao ?? ""}
          onChange={(e) => onChange(index, "observacao", e.target.value)}
          disabled={!isEditable}
          className="h-9 text-sm bg-background"
        />
      </div>
    </div>
  );
}