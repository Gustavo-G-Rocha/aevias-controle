import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function EnsaioTaxaMRAFDimensoes({
  dimensoes,
  isEditable,
  onDimensoesChange
}) {
  return (
    <Card className="bg-black/5">
      <CardHeader>
        <CardTitle className="text-base">Área da Bandeja (global para todos os ensaios)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Lado 1 - L₁ (cm)</Label>
            <Input
              type="number"
              step="0.1"
              value={dimensoes.lado_1 || ''}
              onChange={e => onDimensoesChange('lado_1', e.target.value ? parseFloat(e.target.value) : null)}
              disabled={!isEditable}
              className="bg-white"
            />
          </div>
          <div>
            <Label>Lado 2 - L₂ (cm)</Label>
            <Input
              type="number"
              step="0.1"
              value={dimensoes.lado_2 || ''}
              onChange={e => onDimensoesChange('lado_2', e.target.value ? parseFloat(e.target.value) : null)}
              disabled={!isEditable}
              className="bg-white"
            />
          </div>
          <div>
            <Label>Área A = L₁×L₂/10000 (m²)</Label>
            <Input
              value={dimensoes.area?.toFixed(4) || ''}
              readOnly
              className="bg-slate-200"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}