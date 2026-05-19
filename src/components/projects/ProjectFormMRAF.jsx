import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectFormMRAF({
  formData,
  tipoProjetoAtual,
  onInputChange
}) {
  if (tipoProjetoAtual !== 'MRAF') return null;

  const updateNested = (section, field, value) => {
    onInputChange(section, { ...formData[section], [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parâmetros MRAF</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="emulsao_utilizada">Emulsão Utilizada</Label>
          <Input
            id="emulsao_utilizada"
            value={formData.emulsao_utilizada || ''}
            onChange={(e) => onInputChange('emulsao_utilizada', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="percentual_emulsao">Percentual de Emulsão (%)</Label>
          <Input
            id="percentual_emulsao"
            type="number"
            step="0.1"
            value={formData.percentual_emulsao || ''}
            onChange={(e) => onInputChange('percentual_emulsao', parseFloat(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="densidade_mistura_mraf">Densidade da Mistura (g/cm³)</Label>
          <Input
            id="densidade_mistura_mraf"
            type="number"
            step="0.01"
            value={formData.densidade_mistura_mraf || ''}
            onChange={(e) => onInputChange('densidade_mistura_mraf', parseFloat(e.target.value))}
          />
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Teor de Ligante Residual</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="teor_residual_min">Mínimo (%)</Label>
              <Input
                id="teor_residual_min"
                type="number"
                step="0.1"
                value={formData.teor_ligante_residual?.min || ''}
                onChange={(e) => updateNested('teor_ligante_residual', 'min', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="teor_residual_max">Máximo (%)</Label>
              <Input
                id="teor_residual_max"
                type="number"
                step="0.1"
                value={formData.teor_ligante_residual?.max || ''}
                onChange={(e) => updateNested('teor_ligante_residual', 'max', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="teor_residual_otimo">Ótimo (%)</Label>
              <Input
                id="teor_residual_otimo"
                type="number"
                step="0.1"
                value={formData.teor_ligante_residual?.otimo || ''}
                onChange={(e) => updateNested('teor_ligante_residual', 'otimo', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Taxa de Aplicação</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="taxa_aplicacao_min">Mínima (l/m²)</Label>
              <Input
                id="taxa_aplicacao_min"
                type="number"
                step="0.1"
                value={formData.taxa_aplicacao_mraf?.min || ''}
                onChange={(e) => updateNested('taxa_aplicacao_mraf', 'min', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="taxa_aplicacao_max">Máxima (l/m²)</Label>
              <Input
                id="taxa_aplicacao_max"
                type="number"
                step="0.1"
                value={formData.taxa_aplicacao_mraf?.max || ''}
                onChange={(e) => updateNested('taxa_aplicacao_mraf', 'max', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="taxa_aplicacao_otima">Ótima (l/m²)</Label>
              <Input
                id="taxa_aplicacao_otima"
                type="number"
                step="0.1"
                value={formData.taxa_aplicacao_mraf?.otimo || ''}
                onChange={(e) => updateNested('taxa_aplicacao_mraf', 'otimo', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}