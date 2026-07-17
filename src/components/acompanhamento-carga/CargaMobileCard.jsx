import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

const FIELDS = [
  { key: "numero_ticket_nf", label: "N° Ticket/NF" },
  { key: "placa", label: "Placa" },
  { key: "hora_saida", label: "Hora Saída", type: "time" },
  { key: "peso_toneladas", label: "Peso (t)", type: "number" },
  { key: "hora_chegada", label: "Hora Chegada", type: "time" },
  { key: "temp_chegada", label: "Temp. Chegada (°C)", type: "number" },
  { key: "hora_aplicacao", label: "Hora Aplicação", type: "time" },
  { key: "temp_espalhamento", label: "Temp. Espalh. (°C)", type: "number" },
  { key: "temp_compactacao", label: "Temp. Compact. (°C)", type: "number" },
  { key: "pista", label: "Pista" },
  { key: "espessura_cm", label: "Espessura (cm)", type: "number" },
  { key: "estaca_inicial", label: "Estaca Inicial" },
  { key: "estaca_final", label: "Estaca Final" },
];

/**
 * Card mobile (<1024px) de uma carga — substitui a linha da tabela de 15
 * colunas por um card empilhado, no padrão do CamadaMobileCard.
 */
export default function CargaMobileCard({ carga, index, canEdit, onChange, onRemove }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">Carga {carga.numero_carga}</span>
        {canEdit && (
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
              step={f.type === "number" ? "0.1" : undefined}
              value={carga[f.key] ?? ""}
              onChange={(e) =>
                onChange(index, f.key, f.type === "number" ? (parseFloat(e.target.value) || null) : e.target.value)
              }
              disabled={!canEdit}
              className="h-9 text-sm bg-background"
            />
          </div>
        ))}
      </div>
      <div>
        <Label className="text-xs">Observações</Label>
        <Input
          value={carga.observacoes ?? ""}
          onChange={(e) => onChange(index, "observacoes", e.target.value)}
          disabled={!canEdit}
          className="h-9 text-sm bg-background"
        />
      </div>
    </div>
  );
}