import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function GranuMisturaEquivalenteAreia({ equivalenteAreia, isApproved, handleEAChange }) {
  return (
    <Card className="bg-slate-50">
      <CardHeader><CardTitle className="text-base">3. Determinação de Equivalente de Areia</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {equivalenteAreia.medicoes.map((m, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-white space-y-3">
              <p className="font-bold text-sm text-slate-700">Medição {idx + 1}</p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Topo de Argila</Label>
                  <Input type="number" step="0.01" value={m.topo_argila} onChange={e => handleEAChange(idx, "topo_argila", e.target.value)} disabled={isApproved} className="text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Topo de Areia</Label>
                  <Input type="number" step="0.01" value={m.topo_areia} onChange={e => handleEAChange(idx, "topo_areia", e.target.value)} disabled={isApproved} className="text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Equiv. Areia — EA = (T.Areia/T.Argila)×100 (%)</Label>
                  <Input value={m.equivalente || ""} disabled className="bg-gray-100 text-sm font-bold" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 pt-2 border-t">
          <Label className="text-sm font-bold">Média das Medições (%):</Label>
          <Input value={equivalenteAreia.media || ""} disabled className="bg-gray-100 text-sm font-bold max-w-[140px]" />
        </div>
      </CardContent>
    </Card>
  );
}