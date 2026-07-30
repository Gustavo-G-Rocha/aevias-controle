import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MAX_SENTIDOS, normalizarSentidos, toggleSentido } from "@/utils/registroFresagemCBUQUtils";

const OPCOES = [
  { value: "norte", label: "Norte" },
  { value: "sul", label: "Sul" },
  { value: "leste", label: "Leste" },
  { value: "oeste", label: "Oeste" },
];

/** Marcação do sentido da pista — até 2 opções simultâneas. */
export default function SentidoPistaCheckboxes({ value, onChange, disabled }) {
  const selecionados = normalizarSentidos(value);

  return (
    <div>
      <Label>Sentido da Pista (até {MAX_SENTIDOS})</Label>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
        {OPCOES.map((opcao) => {
          const marcado = selecionados.includes(opcao.value);
          const bloqueado = disabled || (!marcado && selecionados.length >= MAX_SENTIDOS);
          return (
            <label key={opcao.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={marcado}
                disabled={bloqueado}
                onCheckedChange={() => onChange(toggleSentido(selecionados, opcao.value))}
              />
              {opcao.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}