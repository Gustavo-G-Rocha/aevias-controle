import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CLASSES_USINA } from "@/utils/certificacaoUsinaUtils";

export default function SecaoResultado({ formData, onChange, disabled }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground text-sm bg-muted px-3 py-2 rounded">
        8 - RESULTADO
      </h3>
      <div className="px-1 space-y-4">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold text-muted-foreground">Classe atendida</Label>
          <div className="flex gap-6">
            {CLASSES_USINA.map((cls) => (
              <label key={cls} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="radio"
                  value={cls}
                  checked={formData.resultado_classe === cls}
                  onChange={() => onChange("resultado_classe", cls)}
                  disabled={disabled}
                  className="accent-primary"
                />
                {cls}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Observações</Label>
          <Textarea
            value={formData.observacoes_resultado || ""}
            onChange={(e) => onChange("observacoes_resultado", e.target.value)}
            disabled={disabled}
            rows={4}
            placeholder="Observações sobre o resultado..."
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Observações gerais</Label>
          <Textarea
            value={formData.observacoes_gerais || ""}
            onChange={(e) => onChange("observacoes_gerais", e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="Observações gerais..."
          />
        </div>
      </div>
    </div>
  );
}