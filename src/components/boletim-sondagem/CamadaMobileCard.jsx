import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

/**
 * Visualização mobile de uma camada de sondagem — substitui a linha da
 * tabela larga por um card empilhado, evitando scroll horizontal.
 */
export default function CamadaMobileCard({
  camada, classificacaoField, isEditable, profDeEditable,
  onFieldChange, onRemove, canRemove,
}) {
  const numFmt = (v) => (v !== null && v !== undefined ? v.toFixed(2) : "—");
  const parseNum = (raw) => (raw !== "" ? parseFloat(raw) : null);

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">Camada {camada.numero}</span>
        {isEditable && canRemove && (
          <button type="button" onClick={onRemove} aria-label="Remover camada" className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Prof. DE (m)</Label>
          {profDeEditable ? (
            <Input type="number" step="0.01" value={camada.prof_de ?? ""} onChange={e => onFieldChange("prof_de", parseNum(e.target.value))} disabled={!isEditable} className="h-9 text-sm bg-background" placeholder="0,00" />
          ) : (
            <div className="h-9 flex items-center px-3 rounded-md bg-muted/40 text-sm text-muted-foreground">{numFmt(camada.prof_de)}</div>
          )}
        </div>
        <div>
          <Label className="text-xs">Prof. ATÉ (m)</Label>
          <Input type="number" step="0.01" value={camada.prof_ate ?? ""} onChange={e => onFieldChange("prof_ate", parseNum(e.target.value))} disabled={!isEditable} className="h-9 text-sm bg-background" placeholder="0,00" />
        </div>
        <div>
          <Label className="text-xs">Espessura (m)</Label>
          <div className="h-9 flex items-center px-3 rounded-md bg-muted/40 text-sm text-muted-foreground">
            {camada.espessura !== null && camada.espessura !== undefined ? camada.espessura.toFixed(2) : ""}
          </div>
        </div>
        <div>
          <Label className="text-xs">N.A (m)</Label>
          <Input type="number" step="0.01" value={camada.na ?? ""} onChange={e => onFieldChange("na", parseNum(e.target.value))} disabled={!isEditable} className="h-9 text-sm bg-background" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Classificação</Label>
        <Input value={camada[classificacaoField] ?? ""} onChange={e => onFieldChange(classificacaoField, e.target.value)} disabled={!isEditable} className="h-9 text-sm bg-background" placeholder="Escrever" />
      </div>
    </div>
  );
}