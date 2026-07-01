import React from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function RelatoriosUnificadosLaboratoristas({
  obraSelecionada,
  dataInicio,
  dataFim,
  loadingLaboratoristas,
  laboratoristasDisponiveis,
  laboratoristasResolvidos,
  laboratoristasChecked,
  setLaboratoristasChecked,
  toggleLaboratorista,
}) {
  // Um item por pessoa física; cada item pode agrupar vários identificadores.
  const isGroupChecked = (identifiers) =>
    identifiers.length > 0 && identifiers.every((id) => laboratoristasChecked.includes(id));

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
      ) : laboratoristasResolvidos.length === 0 ? (
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
          {laboratoristasResolvidos.map((lab) => (
            <label
              key={lab.displayName}
              className="flex items-center gap-2 cursor-pointer hover:bg-white px-2 py-1 rounded"
            >
              <input
                type="checkbox"
                checked={isGroupChecked(lab.identifiers)}
                onChange={() => toggleLaboratorista(lab.identifiers)}
                className="rounded"
              />
              <span className="text-sm text-[#00233B]">{lab.displayName}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}