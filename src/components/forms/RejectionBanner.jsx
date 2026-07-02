import { AlertTriangle } from "lucide-react";

/**
 * Banner padronizado para exibir o motivo de reprovação de um registro.
 * Usado em todos os formulários com fluxo de aprovação.
 */
export default function RejectionBanner({ rejectionReason, variant = "solid" }) {
  if (!rejectionReason) return null;

  const baseClass = variant === "transparent"
    ? "bg-destructive/10 border-destructive/20"
    : "bg-destructive/10 border-destructive/20";

  return (
    <div className={`mt-4 flex items-start gap-2 p-3 border rounded-lg ${baseClass}`}>
      <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold text-destructive">Motivo da Reprovação:</p>
        <p className="text-sm text-muted-foreground">{rejectionReason}</p>
      </div>
    </div>
  );
}