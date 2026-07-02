import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Campo de observações padronizado com contador de caracteres.
 * Usado em todos os formulários de checklist e ensaios.
 */
export default function ObservacaoField({
  id,
  label = "Observações Gerais",
  value = "",
  onChange,
  disabled = false,
  rows = 3,
  maxLength = 500,
  placeholder = "Observações...",
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
      />
      <p className="text-xs text-right text-muted-foreground mt-1">
        {(value || "").length} / {maxLength}
      </p>
    </div>
  );
}