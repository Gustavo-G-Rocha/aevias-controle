import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EnsaioGranIndividualEquivalente({
  equivalente_areia, isEditable, isApproved, onMedicaoChange,
}) {
  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle className="text-lg">Equivalente de Areia</CardTitle>
        <CardDescription>DNIT 450/2024</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {equivalente_areia.medicoes.map((medicao, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded">
            <div>
              <Label>H₁ - Topo Argila (cm)</Label>
              <Input type="number" step="0.01" value={medicao.topo_argila}
                onChange={(e) => onMedicaoChange(index, 'topo_argila', e.target.value)}
                disabled={!isEditable || isApproved} />
            </div>
            <div>
              <Label>H₂ - Topo Areia (cm)</Label>
              <Input type="number" step="0.01" value={medicao.topo_areia}
                onChange={(e) => onMedicaoChange(index, 'topo_areia', e.target.value)}
                disabled={!isEditable || isApproved} />
            </div>
            <div>
              <Label>EA (%)</Label>
              <Input type="number" step="0.01" value={medicao.equivalente} disabled />
            </div>
          </div>
        ))}
        <div>
          <Label>Média EA (%)</Label>
          <Input type="number" step="0.01" value={equivalente_areia.media} disabled />
        </div>
      </CardContent>
    </Card>
  );
}