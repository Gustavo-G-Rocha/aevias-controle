import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calcPassante } from "@/utils/ensaioMRAFUtils";

export default function EnsaioMRAFGranulometria({
  peneirasDoProjecto, pesosRetidos, pesoInicial,
  selectedProject, isEditable, isApproved,
  onPesoChange,
}) {
  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="text-lg">Granulometria *</CardTitle>
        <CardDescription>DNIT 412/2025</CardDescription>
        {pesoInicial > 0 && (
          <div className="mt-2 p-2 bg-primary/10 border border-primary/20 rounded">
            <p className="text-sm text-primary">
              <strong>Peso Inicial da Amostra (sem ligante):</strong> {pesoInicial} g
            </p>
          </div>
        )}
        {!selectedProject && (
          <p className="text-sm text-amber-600 mt-2">
            ⚠️ Selecione um projeto para ver apenas as peneiras da faixa especificada
          </p>
        )}
      </CardHeader>
      <CardContent>
        {peneirasDoProjecto.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>Nenhuma peneira disponível. Selecione um projeto com faixa granulométrica configurada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-2 py-2 text-left">Peneira ASTM</th>
                  <th className="border border-slate-300 px-2 py-2 text-left">Abertura (mm)</th>
                  <th className="border border-slate-300 px-2 py-2 text-center">Retido (g)</th>
                  <th className="border border-slate-300 px-2 py-2 text-center">% Passante</th>
                </tr>
              </thead>
              <tbody>
                {peneirasDoProjecto.map((peneira, index) => {
                  const passante = calcPassante(peneirasDoProjecto, pesosRetidos, index, pesoInicial);
                  return (
                    <tr key={peneira.key}>
                      <td className="border border-slate-300 px-2 py-2 font-medium">{peneira.label}</td>
                      <td className="border border-slate-300 px-2 py-2">{peneira.abertura}</td>
                      <td className="border border-slate-300 px-1 py-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={pesosRetidos?.[peneira.key] || ''}
                          onChange={(e) => onPesoChange(peneira.key, e.target.value ? parseFloat(e.target.value) : null)}
                          disabled={!isEditable || isApproved}
                          className="h-8 text-sm"
                        />
                      </td>
                      <td className="border border-slate-300 px-2 py-2 text-center font-semibold text-blue-600">
                        {passante}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}