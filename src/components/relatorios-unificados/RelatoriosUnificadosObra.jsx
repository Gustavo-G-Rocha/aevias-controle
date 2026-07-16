import React from "react";
import { Label } from "@/components/ui/label";

export default function RelatoriosUnificadosObra({
  obraSelecionada,
  setObraSelecionada,
  obras,
  regionais,
  regionalSelecionada,
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="relatorio-unificado-obra">Obra *</Label>
      <select
        id="relatorio-unificado-obra"
        name="obra_id"
        aria-label="Obra"
        data-testid="relatorio-unificado-obra"
        value={obraSelecionada || ""}
        onInput={(e) => setObraSelecionada(e.currentTarget.value)}
        onChange={(e) => setObraSelecionada(e.currentTarget.value)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="" disabled>
          Selecione uma obra
        </option>
        {obras.map((obra) => {
          const regional = regionais.find((r) => r.id === obra.regional_id);
          return (
            <option key={obra.id} value={obra.id}>
              {obra.name} - {obra.code}
              {regional ? ` (${regional.nome})` : ""}
            </option>
          );
        })}
      </select>
      {regionalSelecionada && (
        <p className="text-xs text-slate-500">
          Regional: {regionalSelecionada.nome}
        </p>
      )}
    </div>
  );
}