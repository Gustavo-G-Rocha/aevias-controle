import React from "react";
import { Label } from "@/components/ui/label";
import { CLASSES_USINA } from "@/utils/certificacaoUsinaUtils";

const RadioGroup = ({ label, options, value, onChange, disabled }) => (
  <div className="flex flex-col gap-1.5">
    <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-sm">
          <input
            type="radio"
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            disabled={disabled}
            className="accent-primary"
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

export default function SecaoClasseTipo({ formData, onChange, disabled }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground text-sm bg-muted px-3 py-2 rounded">
        2 - CLASSE DE USINA DE ASFALTO PRETENDIDA
      </h3>
      <div className="px-1">
        <RadioGroup
          label="Classe"
          options={CLASSES_USINA}
          value={formData.classe_usina || ""}
          onChange={(v) => onChange("classe_usina", v)}
          disabled={disabled}
        />
      </div>

      <h3 className="font-bold text-foreground text-sm bg-muted px-3 py-2 rounded">
        3 - TIPO DE USINA
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
        <RadioGroup
          label="Dosagem"
          options={["Descontínua", "Contínua"]}
          value={formData.tipo_dosagem || ""}
          onChange={(v) => onChange("tipo_dosagem", v)}
          disabled={disabled}
        />
        <RadioGroup
          label="Secagem"
          options={["Fluxo paralelo", "Contra fluxo"]}
          value={formData.tipo_secagem || ""}
          onChange={(v) => onChange("tipo_secagem", v)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}