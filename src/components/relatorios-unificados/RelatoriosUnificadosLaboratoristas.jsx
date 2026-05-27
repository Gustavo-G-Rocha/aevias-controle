import React from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function RelatoriosUnificadosLaboratoristas({
  obraSelecionada,
  dataInicio,
  dataFim,
  loadingLaboratoristas,
  laboratoristasDisponiveis,
  laboratoristasChecked,
  setLaboratoristasChecked,
  toggleLaboratorista,
}) {
  return (
    <div className="space-y-2">
      <Label>Laboratoristas *</Label>
      {!obraSelecionada || !dataInicio || !dataFim ? (
        <p className="text-sm text-slate-400 italic">
          Selecione obra e período para carregar os laboratoristas.
        </p>
      ) : loadingLaboratoristas ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando
          laboratoristas...
        </div>
      ) : laboratoristasDisponiveis.length === 0 ? (
        <p className="text-sm text-slate-400 italic">
          Nenhum laboratorista encontrado no período selecionado.
        </p>
      ) : (
        <div className="border rounded-lg p-3 space-y-2 bg-slate-50">
          <div className="flex gap-3 mb-2">
            <button
              type="button"
              onClick={() =>
                setLaboratoristasChecked([...laboratoristasDisponiveis])
              }
              className="text-xs text-blue-600 hover:underline"
            >
              Selecionar todos
            </button>
            <button
              type="button"
              onClick={() => setLaboratoristasChecked([])}
              className="text-xs text-slate-500 hover:underline"
            >
              Desmarcar todos
            </button>
          </div>
          {laboratoristasDisponiveis.map((lab) => (
            <label
              key={lab}
              className="flex items-center gap-2 cursor-pointer hover:bg-white px-2 py-1 rounded"
            >
              <input
                type="checkbox"
                checked={laboratoristasChecked.includes(lab)}
                onChange={() => toggleLaboratorista(lab)}
                className="rounded"
              />
              <span className="text-sm text-[#00233B]">{lab}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}