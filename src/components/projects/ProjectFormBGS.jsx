import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export default function ProjectFormBGS({ formData, peneirasCarregadas, peneirasDisponiveis, onAgregadoAdd, onAgregadoRemove, onAgregadoChange, onInputChange, onNestedChange, onFaixaTrabalhoChange }) {
  return (
    <div className="space-y-6">
      {/* Densidade Seca Máxima */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parâmetros de Compactação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="densidade_seca_max_bgs">Densidade Seca Máxima (g/cm³)</Label>
              <Input
                id="densidade_seca_max_bgs"
                type="number"
                step="0.001"
                value={formData.densidade_seca_max || ""}
                onChange={(e) => onInputChange?.('densidade_seca_max', e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Ex: 2.150"
              />
              <p className="text-xs text-slate-500 mt-1">Valor de referência para ensaios de densidade in situ</p>
            </div>
            <div>
              <Label htmlFor="umidade_otima_bgs">Umidade Ótima (%)</Label>
              <Input
                id="umidade_otima_bgs"
                type="number"
                step="0.01"
                value={formData.umidade_otima || ""}
                onChange={(e) => onInputChange?.('umidade_otima', e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Ex: 12.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faixa de Trabalho */}
      {peneirasCarregadas && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Faixa de Trabalho (% Passante)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-4">
              Informe os limites mínimo e máximo de passante para cada peneira relevante.
            </p>
            {/* Cabeçalho das colunas */}
            <div className="flex items-center gap-2 mb-1 border-b pb-2">
              <span className="text-xs font-semibold text-slate-500 w-28 shrink-0">Peneira</span>
              <span className="text-xs font-semibold text-slate-500 flex-1 text-center">Mín (%)</span>
              <span className="text-xs font-semibold text-slate-500 flex-1 text-center">Ótimo (%)</span>
              <span className="text-xs font-semibold text-slate-500 flex-1 text-center">Máx (%)</span>
            </div>
            <div className="space-y-2">
              {peneirasDisponiveis.map(p => (
                <div key={p.key} className="flex items-center gap-2">
                  <span className="text-xs font-medium w-28 shrink-0">{p.astm}</span>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Mín"
                    value={formData.faixa_trabalho_min?.[p.key] ?? ""}
                    onChange={(e) => onFaixaTrabalhoChange?.(p.key, 'min', e.target.value)}
                    className="text-xs h-8 flex-1"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ótimo"
                    value={formData.faixa_trabalho?.[p.key] ?? ""}
                    onChange={(e) => onFaixaTrabalhoChange?.(p.key, 'otimo', e.target.value)}
                    className="text-xs h-8 flex-1"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Máx"
                    value={formData.faixa_trabalho_max?.[p.key] ?? ""}
                    onChange={(e) => onFaixaTrabalhoChange?.(p.key, 'max', e.target.value)}
                    className="text-xs h-8 flex-1"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agregados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Agregados (Opcional)</CardTitle>
            <Button type="button" onClick={onAgregadoAdd} size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Agregado
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
            <p className="text-center text-slate-400 py-6 italic text-sm">
              Nenhum agregado adicionado ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}