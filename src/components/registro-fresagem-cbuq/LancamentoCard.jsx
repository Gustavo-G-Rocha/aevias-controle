import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

const numOrNull = (v) => (v === "" ? null : parseFloat(v));

const NumField = ({ label, value, onChange, disabled }) => (
  <div>
    <Label className="text-xs">{label}</Label>
    <Input type="number" value={value ?? ""} onChange={onChange} disabled={disabled} />
  </div>
);

export default function LancamentoCard({ linha, index, canEdit, tipoLocalizacao, onChange, onRemove }) {
  const refLabel = tipoLocalizacao === "estaca" ? "Estaca" : "Km";
  const num = (field) => (e) => onChange(index, field, numOrNull(e.target.value));

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm text-foreground">Lançamento {index + 1}</p>
        {canEdit && (
          <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={() => onRemove(index)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Localização</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">{refLabel} Inicial *</Label>
          <Input
            value={linha.localizacao_inicial || ""}
            onChange={(e) => onChange(index, "localizacao_inicial", e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label className="text-xs">{refLabel} Final *</Label>
          <Input
            value={linha.localizacao_final || ""}
            onChange={(e) => onChange(index, "localizacao_final", e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label className="text-xs">Faixa</Label>
          <Input
            value={linha.faixa || ""}
            onChange={(e) => onChange(index, "faixa", e.target.value)}
            disabled={!canEdit}
          />
        </div>
      </div>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fresagem e Recomposição</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <NumField label="Largura (m)" value={linha.largura_m} onChange={num("largura_m")} disabled={!canEdit} />
        <NumField label="Extensão (m)" value={linha.extensao_m} onChange={num("extensao_m")} disabled={!canEdit} />
        <NumField label="Espessura (m)" value={linha.espessura_m} onChange={num("espessura_m")} disabled={!canEdit} />
      </div>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pintura Horizontal</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <NumField label="BD/BE (mts lineares)" value={linha.pintura_bd_be_mts} onChange={num("pintura_bd_be_mts")} disabled={!canEdit} />
        <NumField label="4x12 (qtde bastões)" value={linha.pintura_4x12_qtde} onChange={num("pintura_4x12_qtde")} disabled={!canEdit} />
        <NumField label="2x2 (qtde bastões)" value={linha.pintura_2x2_qtde} onChange={num("pintura_2x2_qtde")} disabled={!canEdit} />
        <NumField label="Zebrado (mts lineares)" value={linha.pintura_zebrado_mts} onChange={num("pintura_zebrado_mts")} disabled={!canEdit} />
      </div>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tacha Refletiva</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <NumField label="BD/BE (unid.)" value={linha.tacha_bd_be_unid} onChange={num("tacha_bd_be_unid")} disabled={!canEdit} />
        <NumField label="4x12 (unid.)" value={linha.tacha_4x12_unid} onChange={num("tacha_4x12_unid")} disabled={!canEdit} />
        <NumField label="2x2 (unid.)" value={linha.tacha_2x2_unid} onChange={num("tacha_2x2_unid")} disabled={!canEdit} />
        <NumField label="Zebrado (unid.)" value={linha.tacha_zebrado_unid} onChange={num("tacha_zebrado_unid")} disabled={!canEdit} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <NumField label="Dreno (m)" value={linha.dreno_m} onChange={num("dreno_m")} disabled={!canEdit} />
      </div>
    </div>
  );
}