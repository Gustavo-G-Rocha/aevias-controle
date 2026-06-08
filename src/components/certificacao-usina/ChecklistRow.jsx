import React from "react";
import ConformeField from "./ConformeField";

/**
 * Linha de checklist: descrição à esquerda + campo de conformidade à direita.
 */
export default function ChecklistRow({ label, path, value, onChange, disabled, opcao1, opcao2 }) {
  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50/50">
      <td className="py-2 px-3 text-sm text-slate-700 leading-snug">{label}</td>
      <td className="py-2 px-3 min-w-[200px]">
        <ConformeField
          value={value}
          onChange={(v) => onChange(path, v)}
          disabled={disabled}
          opcao1={opcao1}
          opcao2={opcao2}
        />
      </td>
    </tr>
  );
}