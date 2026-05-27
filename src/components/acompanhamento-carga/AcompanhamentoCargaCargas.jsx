import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

export default function AcompanhamentoCargaCargas({
  cargas, canEdit,
  handleAddCarga, handleRemoveCarga, handleCargaChange,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[#00233B]">CARGAS</h2>
        {canEdit && (
          <Button
            onClick={handleAddCarga}
            disabled={cargas.length >= 20}
            className="bg-[#00233B] text-white hover:bg-[#00233B]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Carga ({cargas.length}/20)
          </Button>
        )}
      </div>

      {cargas.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>Nenhuma carga adicionada. Clique em "Adicionar Carga" para começar.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead className="bg-slate-100">
              <tr>
                <th className="border border-slate-300 p-2">N°</th>
                <th className="border border-slate-300 p-2">Placa</th>
                <th className="border border-slate-300 p-2">Hora Saída</th>
                <th className="border border-slate-300 p-2">Peso (t)</th>
                <th className="border border-slate-300 p-2">Hora Chegada</th>
                <th className="border border-slate-300 p-2">Temp. Chegada (°C)</th>
                <th className="border border-slate-300 p-2">Hora Aplicação</th>
                <th className="border border-slate-300 p-2">Temp. Espalhamento (°C)</th>
                <th className="border border-slate-300 p-2">Temp. Compactação (°C)</th>
                <th className="border border-slate-300 p-2">Pista</th>
                <th className="border border-slate-300 p-2">Espessura (cm)</th>
                <th className="border border-slate-300 p-2">Estaca Inicial</th>
                <th className="border border-slate-300 p-2">Estaca Final</th>
                <th className="border border-slate-300 p-2">Observações</th>
                {canEdit && <th className="border border-slate-300 p-2">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {cargas.map((carga, index) => (
                <tr key={index} className="even:bg-slate-50">
                  <td className="border border-slate-300 p-1 text-center">{carga.numero_carga}</td>
                  <td className="border border-slate-300 p-1">
                    <Input value={carga.placa} onChange={(e) => handleCargaChange(index, 'placa', e.target.value)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <Input type="time" value={carga.hora_saida} onChange={(e) => handleCargaChange(index, 'hora_saida', e.target.value)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <Input type="number" step="0.1" value={carga.peso_toneladas || ""} onChange={(e) => handleCargaChange(index, 'peso_toneladas', parseFloat(e.target.value) || null)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <Input type="time" value={carga.hora_chegada} onChange={(e) => handleCargaChange(index, 'hora_chegada', e.target.value)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <Input type="number" step="0.1" value={carga.temp_chegada || ""} onChange={(e) => handleCargaChange(index, 'temp_chegada', parseFloat(e.target.value) || null)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <Input type="time" value={carga.hora_aplicacao} onChange={(e) => handleCargaChange(index, 'hora_aplicacao', e.target.value)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <Input type="number" step="0.1" value={carga.temp_espalhamento || ""} onChange={(e) => handleCargaChange(index, 'temp_espalhamento', parseFloat(e.target.value) || null)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <Input type="number" step="0.1" value={carga.temp_compactacao || ""} onChange={(e) => handleCargaChange(index, 'temp_compactacao', parseFloat(e.target.value) || null)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <Input value={carga.pista} onChange={(e) => handleCargaChange(index, 'pista', e.target.value)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <Input type="number" step="0.1" value={carga.espessura_cm || ""} onChange={(e) => handleCargaChange(index, 'espessura_cm', parseFloat(e.target.value) || null)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <Input value={carga.estaca_inicial} onChange={(e) => handleCargaChange(index, 'estaca_inicial', e.target.value)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <Input value={carga.estaca_final} onChange={(e) => handleCargaChange(index, 'estaca_final', e.target.value)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  <td className="border border-slate-300 p-1">
                    <Input value={carga.observacoes} onChange={(e) => handleCargaChange(index, 'observacoes', e.target.value)} disabled={!canEdit} className="h-8 text-xs" />
                  </td>
                  {canEdit && (
                    <td className="border border-slate-300 p-1 text-center">
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveCarga(index)} className="h-7 w-7 p-0">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}