import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RelatoriosUnificadosFiltrosAdicionais({
  rodoviaSelecionada,
  setRodoviaSelecionada,
  rodoviasDisponiveis,
  empreiteiraSelecionada,
  setEmpreiteiraSelecionada,
  empreiteirasDisponiveis,
  usinaSelecionada,
  setUsinaSelecionada,
  usinasDisponiveis,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Rodovia */}
      <div className="space-y-2">
        <Label>Rodovia</Label>
        <Select value={rodoviaSelecionada} onValueChange={setRodoviaSelecionada}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            {rodoviasDisponiveis.map((rodovia) => (
              <SelectItem key={rodovia} value={rodovia}>
                {rodovia}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {rodoviasDisponiveis.length === 0 && (
          <p className="text-xs text-slate-400 italic">
            Nenhuma rodovia cadastrada
          </p>
        )}
      </div>

      {/* Empreiteira */}
      <div className="space-y-2">
        <Label>Empreiteira</Label>
        <Select
          value={empreiteiraSelecionada}
          onValueChange={setEmpreiteiraSelecionada}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            {empreiteirasDisponiveis.map((empreiteira) => (
              <SelectItem key={empreiteira} value={empreiteira}>
                {empreiteira}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {empreiteirasDisponiveis.length === 0 && (
          <p className="text-xs text-slate-400 italic">
            Nenhuma empreiteira cadastrada
          </p>
        )}
      </div>

      {/* Usina */}
      <div className="space-y-2">
        <Label>Usina</Label>
        <Select value={usinaSelecionada} onValueChange={setUsinaSelecionada}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            {usinasDisponiveis.map((usina) => (
              <SelectItem key={usina} value={usina}>
                {usina}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {usinasDisponiveis.length === 0 && (
          <p className="text-xs text-slate-400 italic">
            Nenhuma usina cadastrada
          </p>
        )}
      </div>
    </div>
  );
}