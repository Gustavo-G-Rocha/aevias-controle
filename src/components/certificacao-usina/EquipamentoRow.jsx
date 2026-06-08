import React from "react";
import ConformeField from "./ConformeField";

export default function EquipamentoRow({ label, path, value, onChange, disabled }) {
  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50/50">
      <td className="py-2 px-3 text-sm text-slate-700">{label}</td>
      <td className="py-2 px-3">
        <ConformeField
          value={value}
          onChange={(v) => onChange(path, v)}
          disabled={disabled}
          opcao1="Possui"
          opcao2="Não possui"
        />
      </td>
    </tr>
  );
}