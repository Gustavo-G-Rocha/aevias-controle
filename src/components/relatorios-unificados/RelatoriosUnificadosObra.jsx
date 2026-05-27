import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RelatoriosUnificadosObra({
  obraSelecionada,
  setObraSelecionada,
  obras,
  regionais,
  regionalSelecionada,
}) {
  return (
    <div className="space-y-2">
      <Label>Obra *</Label>
      <Select value={obraSelecionada} onValueChange={setObraSelecionada}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma obra" />
        </SelectTrigger>
        <SelectContent>
          {obras.map((obra) => {
            const regional = regionais.find((r) => r.id === obra.regional_id);
            return (
              <SelectItem key={obra.id} value={obra.id}>
                {obra.name} - {obra.code}
                {regional ? ` (${regional.nome})` : ""}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {regionalSelecionada && (
        <p className="text-xs text-slate-500">
          Regional: {regionalSelecionada.nome}
        </p>
      )}
    </div>
  );
}