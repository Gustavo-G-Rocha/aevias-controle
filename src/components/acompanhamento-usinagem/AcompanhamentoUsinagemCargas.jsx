import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

export default function AcompanhamentoUsinagemCargas({
  cargas, isEditable,
  handleCargaChange, adicionarCarga, removerCarga,
}) {
  return (
    <Card className="bg-white/40 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#00233B]">Cargas Acompanhadas</CardTitle>
          {isEditable && (
            <Button onClick={adicionarCarga} size="sm" className="bg-[#BFCF99] text-[#00233B] hover:bg-[#BFCF99]/90">
              <Plus className="w-4 h-4 mr-1" /> Adicionar Carga
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {cargas.length === 0 ? (
          <p className="text-center text-[#00233B]/70 py-8">Nenhuma carga adicionada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-slate-700 text-white">
                <tr>
                  <th className="border border-gray-300 p-2">Placa Caminhão</th>
                  <th className="border border-gray-300 p-2">Hora de Saída</th>
                  <th className="border border-gray-300 p-2">Peso (t)</th>
                  <th className="border border-gray-300 p-2">Temperatura (°C)</th>
                  <th className="border border-gray-300 p-2">Temperatura (°C)</th>
                  <th className="border border-gray-300 p-2">Observação</th>
                  {isEditable && <th className="border border-gray-300 p-2">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {cargas.map((carga, index) => (
                  <tr key={`carga-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-2">
                      <Input value={carga.placa_caminhao}
                        onChange={(e) => handleCargaChange(index, 'placa_caminhao', e.target.value)}
                        disabled={!isEditable} className="text-sm" />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Input type="time" value={carga.hora_saida}
                        onChange={(e) => handleCargaChange(index, 'hora_saida', e.target.value)}
                        disabled={!isEditable} className="text-sm" />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Input type="number" step="0.01" value={carga.peso}
                        onChange={(e) => handleCargaChange(index, 'peso', e.target.value)}
                        disabled={!isEditable} className="text-sm" />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Input type="number" step="0.1" value={carga.temperatura_1}
                        onChange={(e) => handleCargaChange(index, 'temperatura_1', e.target.value)}
                        disabled={!isEditable} className="text-sm" />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Input type="number" step="0.1" value={carga.temperatura_2}
                        onChange={(e) => handleCargaChange(index, 'temperatura_2', e.target.value)}
                        disabled={!isEditable} className="text-sm" />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Input value={carga.observacao}
                        onChange={(e) => handleCargaChange(index, 'observacao', e.target.value)}
                        disabled={!isEditable} className="text-sm" />
                    </td>
                    {isEditable && (
                      <td className="border border-gray-300 p-2 text-center">
                        <Button variant="ghost" size="sm" onClick={() => removerCarga(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50">
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