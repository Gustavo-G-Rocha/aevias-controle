import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectFormCAUQ({
  formData,
  tipoProjetoAtual,
  onInputChange
}) {
  if (tipoProjetoAtual !== 'CAUQ') return null;

  const updateNested = (section, field, value) => {
    onInputChange(section, { ...formData[section], [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parâmetros CAUQ</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ligante" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ligante">Ligante</TabsTrigger>
            <TabsTrigger value="temperaturas">Temperaturas</TabsTrigger>
            <TabsTrigger value="teor">Teor Ligante</TabsTrigger>
            <TabsTrigger value="marshall">Marshall</TabsTrigger>
          </TabsList>

          <TabsContent value="ligante" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ligante_tipo">Tipo de Ligante</Label>
                <Input
                  id="ligante_tipo"
                  value={formData.ligante?.tipo || ''}
                  onChange={(e) => updateNested('ligante', 'tipo', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ligante_fornecedor">Fornecedor</Label>
                <Input
                  id="ligante_fornecedor"
                  value={formData.ligante?.fornecedor || ''}
                  onChange={(e) => updateNested('ligante', 'fornecedor', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ligante_densidade">Densidade (g/cm³)</Label>
                <Input
                  id="ligante_densidade"
                  type="number"
                  step="0.01"
                  value={formData.ligante?.densidade || ''}
                  onChange={(e) => updateNested('ligante', 'densidade', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="temperaturas" className="space-y-4 mt-4">
            <div>
              <h4 className="font-semibold mb-3 text-sm">Mistura (°C)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temp_mistura_min">Mín.</Label>
                  <Input
                    id="temp_mistura_min"
                    type="number"
                    value={formData.temperaturas?.mistura?.min || ''}
                    onChange={(e) => updateNested('temperaturas', 'mistura', { ...formData.temperaturas?.mistura, min: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="temp_mistura_max">Máx.</Label>
                  <Input
                    id="temp_mistura_max"
                    type="number"
                    value={formData.temperaturas?.mistura?.max || ''}
                    onChange={(e) => updateNested('temperaturas', 'mistura', { ...formData.temperaturas?.mistura, max: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm">Compactação (°C)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temp_compactacao_min">Mín.</Label>
                  <Input
                    id="temp_compactacao_min"
                    type="number"
                    value={formData.temperaturas?.compactacao?.min || ''}
                    onChange={(e) => updateNested('temperaturas', 'compactacao', { ...formData.temperaturas?.compactacao, min: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="temp_compactacao_max">Máx.</Label>
                  <Input
                    id="temp_compactacao_max"
                    type="number"
                    value={formData.temperaturas?.compactacao?.max || ''}
                    onChange={(e) => updateNested('temperaturas', 'compactacao', { ...formData.temperaturas?.compactacao, max: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm">Espalhamento (°C)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temp_espalhamento_min">Mín.</Label>
                  <Input
                    id="temp_espalhamento_min"
                    type="number"
                    value={formData.temperaturas?.espalhamento?.min || ''}
                    onChange={(e) => updateNested('temperaturas', 'espalhamento', { ...formData.temperaturas?.espalhamento, min: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="temp_espalhamento_max">Máx.</Label>
                  <Input
                    id="temp_espalhamento_max"
                    type="number"
                    value={formData.temperaturas?.espalhamento?.max || ''}
                    onChange={(e) => updateNested('temperaturas', 'espalhamento', { ...formData.temperaturas?.espalhamento, max: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="teor" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="teor_ligante_min">Mínimo (%)</Label>
                <Input
                  id="teor_ligante_min"
                  type="number"
                  step="0.1"
                  value={formData.teor_ligante?.min || ''}
                  onChange={(e) => updateNested('teor_ligante', 'min', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="teor_ligante_max">Máximo (%)</Label>
                <Input
                  id="teor_ligante_max"
                  type="number"
                  step="0.1"
                  value={formData.teor_ligante?.max || ''}
                  onChange={(e) => updateNested('teor_ligante', 'max', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="teor_ligante_otimo">Ótimo (%)</Label>
                <Input
                  id="teor_ligante_otimo"
                  type="number"
                  step="0.1"
                  value={formData.teor_ligante?.otimo || ''}
                  onChange={(e) => updateNested('teor_ligante', 'otimo', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marshall" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estabilidade_min">Estabilidade Mínima (kgf)</Label>
                <Input
                  id="estabilidade_min"
                  type="number"
                  value={formData.estabilidade?.min || ''}
                  onChange={(e) => updateNested('estabilidade', 'min', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="vam_min">VAM Mínimo (%)</Label>
                <Input
                  id="vam_min"
                  type="number"
                  step="0.1"
                  value={formData.vam?.min || ''}
                  onChange={(e) => updateNested('vam', 'min', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}