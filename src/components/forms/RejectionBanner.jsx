import { AlertTriangle } from "lucide-react";

/**
 * Banner padronizado para exibir o motivo de reprovação de um registro.
 * Usado em todos os formulários com fluxo de aprovação.
 */
export default function RejectionBanner({ rejectionReason, variant = "solid" }) {
  if (!rejectionReason) return null;

  const baseClass = variant === "transparent"
    ? "bg-red-50/50 border-red-200/50"
    : "bg-red-50 border-red-200";

  return (
    <div className={`mt-4 flex items-start gap-2 p-3 border rounded-lg ${baseClass}`}>
      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold text-red-800">Motivo da Reprovação:</p>
        <p className="text-sm text-red-700">{rejectionReason}</p>
      </div>
    </div>
  );
}