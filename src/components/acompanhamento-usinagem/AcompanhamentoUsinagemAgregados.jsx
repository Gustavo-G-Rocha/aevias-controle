import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

export default function AcompanhamentoUsinagemAgregados({
  formData, setFormData, isEditable,
  handleAgregadoChange, adicionarAgregado, removerAgregado,
}) {
  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Dados do Ensaio - Agregados</CardTitle>
          {isEditable && formData.agregados.length > 0 && (
            <Button onClick={adicionarAgregado} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Adicionar Agregado
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ligante_nome">Ligante</Label>
            <Input id="ligante_nome" value={formData.ligante_nome}
              onChange={(e) => setFormData(prev => ({ ...prev, ligante_nome: e.target.value }))}
              disabled={!isEditable} />
          </div>
          <div>
            <Label htmlFor="temperatura_ligante">Temperatura do Ligante - °C</Label>
            <Input id="temperatura_ligante" type="number" step="0.1" value={formData.temperatura_ligante}
              onChange={(e) => setFormData(prev => ({ ...prev, temperatura_ligante: e.target.value }))}
              disabled={!isEditable} />
          </div>
        </div>

        {formData.agregados.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Nenhum agregado cadastrado. Selecione um projeto ou adicione agregados manualmente.
            </p>
            {isEditable && (
              <Button onClick={adicionarAgregado}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar Primeiro Agregado
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border border-border p-2">Agregado</th>
                  <th className="border border-border p-2">Composição (%)</th>
                  <th className="border border-border p-2">Umidade (%)</th>
                  <th className="border border-border p-2">T1 (°C)</th>
                  <th className="border border-border p-2">T2 (°C)</th>
                  {isEditable && <th className="border border-border p-2">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {formData.agregados.map((agregado, index) => (
                  <tr key={`agregado-${index}`} className={index % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'}>
                    <td className="border border-border p-2">
                      <Input value={agregado.nome}
                        onChange={(e) => handleAgregadoChange(index, 'nome', e.target.value)}
                        disabled={!isEditable} className="text-sm" />
                    </td>
                    <td className="border border-border p-2">
                      <Input type="number" step="0.01" value={agregado.composicao}
                        onChange={(e) => handleAgregadoChange(index, 'composicao', e.target.value)}
                        disabled={!isEditable} className="text-sm" />
                    </td>
                    <td className="border border-border p-2">
                      <Input type="number" step="0.01" value={agregado.umidade}
                        onChange={(e) => handleAgregadoChange(index, 'umidade', e.target.value)}
                        disabled={!isEditable} className="text-sm" />
                    </td>
                    <td className="border border-border p-2">
                      <Input type="number" step="0.1" value={agregado.temperatura_t1}
                        onChange={(e) => handleAgregadoChange(index, 'temperatura_t1', e.target.value)}
                        disabled={!isEditable} className="text-sm" />
                    </td>
                    <td className="border border-border p-2">
                      <Input type="number" step="0.1" value={agregado.temperatura_t2}
                        onChange={(e) => handleAgregadoChange(index, 'temperatura_t2', e.target.value)}
                        disabled={!isEditable} className="text-sm" />
                    </td>
                    {isEditable && (
                      <td className="border border-border p-2 text-center">
                        <Button variant="ghost" size="sm" onClick={() => removerAgregado(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-600/10">
                          <X className="w-4 h-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}