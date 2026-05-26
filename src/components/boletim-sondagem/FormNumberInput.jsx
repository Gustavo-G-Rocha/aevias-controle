import React from "react";
import { Input } from "@/components/ui/input";

/**
 * Input numérico padronizado para os formulários de boletim.
 * Converte string vazia para null automaticamente.
 */
export default function FormNumberInput({ value, onChange, disabled, placeholder = "", step = "0.01", className = "h-9 text-sm" }) {
  return (
    <Input
      type="number"
      step={step}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value !== '' ? parseFloat(e.target.value) : null)}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
    />
  );
}