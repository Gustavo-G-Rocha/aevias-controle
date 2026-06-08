import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectFormConcrete({
  formData,
  tipoProjetoAtual,
  onInputChange
}) {
  if (tipoProjetoAtual !== 'CARTA_TRACO_CONCRETO') return null;

  const ct = formData.carta_traco_concreto || {};
  const handleChange = (field, value) => {
    onInputChange('carta_traco_concreto', { ...ct, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carta Traço de Concreto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fck">Resistência Característica (MPa) *</Label>
            <Input
              id="fck"
              type="number"
              value={ct.fck || ''}
              onChange={(e) => handleChange('fck', parseFloat(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor="tipo_cimento">Tipo de Cimento</Label>
            <Input
              id="tipo_cimento"
              value={ct.tipo_cimento || ''}
              onChange={(e) => handleChange('tipo_cimento', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="slump_projeto">Slump de Projeto (cm)</Label>
            <Input
              id="slump_projeto"
              type="number"
              step="0.5"
              value={ct.slump_projeto || ''}
              onChange={(e) => handleChange('slump_projeto', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="consumo_agua">Consumo de Água (L/m³)</Label>
            <Input
              id="consumo_agua"
              type="number"
              value={ct.consumo_agua || ''}
              onChange={(e) => handleChange('consumo_agua', parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="slump_minimo">Slump Mínimo (cm)</Label>
            <Input
              id="slump_minimo"
              type="number"
              step="0.5"
              value={ct.slump_minimo || ''}
              onChange={(e) => handleChange('slump_minimo', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="slump_maximo">Slump Máximo (cm)</Label>
            <Input
              id="slump_maximo"
              type="number"
              step="0.5"
              value={ct.slump_maximo || ''}
              onChange={(e) => handleChange('slump_maximo', parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipo_aditivo">Tipo de Aditivo</Label>
            <Input
              id="tipo_aditivo"
              value={ct.tipo_aditivo || ''}
              onChange={(e) => handleChange('tipo_aditivo', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="concreteira">Concreteira Fornecedora</Label>
            <Input
              id="concreteira"
              value={ct.concreteira || ''}
              onChange={(e) => handleChange('concreteira', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}