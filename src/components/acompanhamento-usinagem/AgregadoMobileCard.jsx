import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

const FIELDS = [
  { key: "composicao", label: "Composição (%)", step: "0.01" },
  { key: "umidade", label: "Umidade (%)", step: "0.01" },
  { key: "temperatura_t1", label: "T1 (°C)", step: "0.1" },
  { key: "temperatura_t2", label: "T2 (°C)", step: "0.1" },
];

/**
 * Card mobile (<1024px) de um agregado — substitui a linha da tabela por um
 * card empilhado, no padrão do CargaMobileCard.
 */
export default function AgregadoMobileCard({ agregado, index, canEdit, onChange, onRemove }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">Agregado {index + 1}</span>
        {canEdit && (
          <button type="button" onClick={onRemove} aria-label="Remover agregado" className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div>
        <Label className="text-xs">Agregado</Label>
        <Input
          value={agregado.nome ?? ""}
          onChange={(e) => onChange(index, "nome", e.target.value)}
          disabled={!canEdit}
          className="h-9 text-sm bg-background"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <Label className="text-xs">{f.label}</Label>
            <Input
              type="number"
              step={f.step}
              value={agregado[f.key] ?? ""}
              onChange={(e) => onChange(index, f.key, e.target.value)}
              disabled={!canEdit}
              className="h-9 text-sm bg-background"
            />
          </div>
        ))}
      </div>
    </div>
  );
}