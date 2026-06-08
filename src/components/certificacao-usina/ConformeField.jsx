import React from "react";

/**
 * Renderiza dois radio buttons: "Conforme" / "Não conforme" (ou outro par de opções).
 */
export default function ConformeField({
  value,
  onChange,
  disabled,
  opcao1 = "Conforme",
  opcao2 = "Não conforme",
  className = "",
}) {
  return (
    <div className={`flex gap-3 items-center ${className}`}>
      <label className="flex items-center gap-1 cursor-pointer text-sm">
        <input
          type="radio"
          value={opcao1}
          checked={value === opcao1}
          onChange={() => onChange(opcao1)}
          disabled={disabled}
          className="accent-green-600"
        />
        <span className="text-green-700 font-medium">{opcao1}</span>
      </label>
      <label className="flex items-center gap-1 cursor-pointer text-sm">
        <input
          type="radio"
          value={opcao2}
          checked={value === opcao2}
          onChange={() => onChange(opcao2)}
          disabled={disabled}
          className="accent-red-600"
        />
        <span className="text-red-700 font-medium">{opcao2}</span>
      </label>
    </div>
  );
}