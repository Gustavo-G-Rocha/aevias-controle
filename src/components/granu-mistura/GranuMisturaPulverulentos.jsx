import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function GranuMisturaPulverulentos({ materiais, isApproved, handlePulvChange }) {
  return (
    <Card className="bg-muted/30">
      <CardHeader><CardTitle className="text-base">4. Determinação de Materiais Pulverulentos</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <Label className="text-xs font-bold">Peso Inicial — Pᵢ (g)</Label>
            <Input type="number" step="0.01" value={materiais.peso_inicial} onChange={e => handlePulvChange("peso_inicial", e.target.value)} disabled={isApproved} className="text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold">Peso Após Lavagem — Pf (g)</Label>
            <Input type="number" step="0.01" value={materiais.peso_apos_lavagem} onChange={e => handlePulvChange("peso_apos_lavagem", e.target.value)} disabled={isApproved} className="text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold">Teor de Pulverulentos — ((Pi−Pf)/Pi)×100 (%)</Label>
            <Input value={materiais.teor_pct || ""} disabled className="bg-muted text-sm font-bold" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}