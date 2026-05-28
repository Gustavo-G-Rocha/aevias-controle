import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, AlertCircle } from "lucide-react";

export default function ProjectFormBGS({ formData, onAgregadoAdd, onAgregadoRemove, onAgregadoChange }) {
  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-lg">
            Projeto {formData.tipo_projeto} - Configuração Simplificada
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">
          Para projetos do tipo <strong>{formData.tipo_projeto}</strong>, os parâmetros técnicos específicos podem ser configurados conforme necessário.
          O sistema já está preparado com a especificação granulométrica e o limite de equivalente de areia.
        </p>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base">Agregados (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-slate-600">Adicione agregados se necessário para este projeto.</p>
              <Button type="button" onClick={onAgregadoAdd} size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Agregado
              </Button>
            </div>

            {formData.agregados.length > 0 ? (
              <div className="space-y-4">
                {formData.agregados.map((agregado, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-slate-50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-sm">Agregado {index + 1}</h5>
                      <Button
                        type="button"
                        onClick={() => onAgregadoRemove(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Nome/Tipo</Label>
                        <Input
                          value={agregado.nome}
                          onChange={(e) => onAgregadoChange(index, 'nome', e.target.value)}
                          placeholder="Ex: Areia natural"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Pedreira</Label>
                        <Input
                          value={agregado.pedreira}
                          onChange={(e) => onAgregadoChange(index, 'pedreira', e.target.value)}
                          placeholder="Ex: Pedreira Central"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-8 italic text-sm">
                Nenhum agregado adicionado ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}