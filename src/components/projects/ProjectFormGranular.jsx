import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectFormGranular({
  formData,
  tipoProjetoAtual,
  onInputChange
}) {
  if (tipoProjetoAtual !== 'CAMADAS_GRANULARES') return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Camadas Granulares</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="melhorador_utilizado">Melhorador Utilizado</Label>
          <Input
            id="melhorador_utilizado"
            value={formData.melhorador_utilizado || ''}
            onChange={(e) => onInputChange('melhorador_utilizado', e.target.value)}
          />
          <p className="text-xs text-slate-500 mt-1">
            Ex: Cimento, cal, betume, etc.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="umidade_otima">Umidade Ótima (%)</Label>
            <Input
              id="umidade_otima"
              type="number"
              step="0.1"
              value={formData.umidade_otima || ''}
              onChange={(e) => onInputChange('umidade_otima', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="densidade_otima">Densidade Ótima (g/cm³)</Label>
            <Input
              id="densidade_otima"
              type="number"
              step="0.01"
              value={formData.densidade_otima || ''}
              onChange={(e) => onInputChange('densidade_otima', parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="resistencia_mpa">Resistência (MPa) - Opcional</Label>
          <Input
            id="resistencia_mpa"
            type="number"
            step="0.1"
            value={formData.resistencia_mpa || ''}
            onChange={(e) => onInputChange('resistencia_mpa', parseFloat(e.target.value))}
          />
        </div>
      </CardContent>
    </Card>
  );
}