import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function GranuMisturaUmidade({ umidade, isApproved, handleUmidadeChange }) {
  return (
    <Card className="bg-slate-50">
      <CardHeader><CardTitle className="text-base">1. Determinação de Umidade da Mistura</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label className="text-xs font-bold">Peso Úmido — P₁ (g)</Label>
          <Input type="number" step="0.01" value={umidade.peso_umido} onChange={e => handleUmidadeChange("peso_umido", e.target.value)} disabled={isApproved} className="text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-bold">Peso Seco — P₂ (g)</Label>
          <Input type="number" step="0.01" value={umidade.peso_seco} onChange={e => handleUmidadeChange("peso_seco", e.target.value)} disabled={isApproved} className="text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-bold">Peso Água — Pω = P₁ − P₂ (g)</Label>
          <Input value={umidade.peso_agua || ""} disabled className="bg-gray-100 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-bold">Umidade — U = (Pω/P₂)×100 (%)</Label>
          <Input value={umidade.umidade_pct || ""} disabled className="bg-gray-100 text-sm font-bold" />
        </div>
      </CardContent>
    </Card>
  );
}