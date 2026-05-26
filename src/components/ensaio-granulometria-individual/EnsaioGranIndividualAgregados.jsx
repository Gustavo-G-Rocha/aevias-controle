import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { PENEIRAS_MAP } from "@/constants/sieves";

export default function EnsaioGranIndividualAgregados({
  agregados, peneirasVisiveis, selectedProject,
  isEditable, isApproved,
  onAgregadoChange, onGranulometriaChange,
  onAdd, onRemove,
}) {
  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Agregados (até 4)</CardTitle>
          {isEditable && !isApproved && agregados.length < 4 && (
            <Button type="button" onClick={onAdd} size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Agregado
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {agregados.map((agregado, index) => (
          <Card key={index} className="border-2 border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Agregado {index + 1}</CardTitle>
                {isEditable && !isApproved && agregados.length > 1 && (
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pesos */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={agregado.nome}
                    onChange={(e) => onAgregadoChange(index, 'nome', e.target.value)}
                    disabled={!isEditable || isApproved || (selectedProject?.agregados && index < selectedProject.agregados.length)}
                    placeholder="Ex: Brita 1"
                  />
                </div>
                <div>
                  <Label>Peso Úmido (g)</Label>
                  <Input type="number" step="0.01" value={agregado.peso_umido}
                    onChange={(e) => onAgregadoChange(index, 'peso_umido', e.target.value)}
                    disabled={!isEditable || isApproved} />
                </div>
                <div>
                  <Label>Peso Seco (g)</Label>
                  <Input type="number" step="0.01" value={agregado.peso_seco}
                    onChange={(e) => onAgregadoChange(index, 'peso_seco', e.target.value)}
                    disabled={!isEditable || isApproved} />
                </div>
                <div>
                  <Label>Água (g)</Label>
                  <Input type="number" step="0.01" value={agregado.agua} disabled />
                </div>
                <div>
                  <Label>Umidade (%)</Label>
                  <Input type="number" step="0.01" value={agregado.umidade} disabled />
                </div>
              </div>

              {/* Granulometria */}
              <div>
                <Label className="font-semibold">Granulometria</Label>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse border text-sm">
                    <thead className="bg-slate-200">
                      <tr>
                        <th className="border p-2">ASTM</th>
                        <th className="border p-2">mm</th>
                        <th className="border p-2">Retido (g)</th>
                        <th className="border p-2">% Passante</th>
                      </tr>
                    </thead>
                    <tbody>
                      {peneirasVisiveis.map(peneiraKey => {
                        const info = PENEIRAS_MAP[peneiraKey];
                        return (
                          <tr key={peneiraKey}>
                            <td className="border p-2">{info.astm}</td>
                            <td className="border p-2">{info.mm}</td>
                            <td className="border p-2">
                              <Input type="number" step="0.01" className="h-8"
                                value={agregado.granulometria?.[peneiraKey]?.retido || ""}
                                onChange={(e) => onGranulometriaChange(index, peneiraKey, 'retido', e.target.value)}
                                disabled={!isEditable || isApproved} />
                            </td>
                            <td className="border p-2">
                              <Input type="number" step="0.01" className="h-8 bg-gray-50"
                                value={agregado.granulometria?.[peneiraKey]?.passante || ""} disabled />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}