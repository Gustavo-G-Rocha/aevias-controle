import React from "react";
import { Label } from "@/components/ui/label";
import { typeOptions } from "@/components/ensaios/ensaioMappers";

const OPTIONS = typeOptions.filter((o) => o.value !== "all");

export default function RelatoriosUnificadosTipo({
  tipoRegistro,
  setTipoRegistro,
}) {
  // Garante que tipoRegistro é sempre array
  const selected = Array.isArray(tipoRegistro) ? tipoRegistro : tipoRegistro ? [tipoRegistro] : [];

  const toggle = (value) => {
    setTipoRegistro(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Tipo de Registro * <span className="text-xs text-slate-500 font-normal">(selecione um ou mais)</span></Label>
        <button
          type="button"
          onClick={() => setTipoRegistro([])}
          className="text-xs text-slate-500 hover:text-slate-700 underline"
        >
          Desmarcar todas
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 cursor-pointer rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="rounded"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-slate-400">Selecione pelo menos um tipo.</p>
      )}
    </div>
  );
}