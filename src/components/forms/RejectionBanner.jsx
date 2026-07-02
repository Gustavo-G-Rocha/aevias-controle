import { AlertTriangle } from "lucide-react";

/**
 * Banner padronizado para exibir o motivo de reprovação de um registro.
 * Usado em todos os formulários com fluxo de aprovação.
 */
export default function RejectionBanner({ rejectionReason, variant = "solid" }) {
  if (!rejectionReason) return null;

  const baseClass = variant === "transparent"
    ? "bg-red-600/90 border-red-700/90"
    : "bg-red-600 border-red-700";

  return (
    <div className={`mt-4 flex items-start gap-2 p-3 border rounded-lg ${baseClass}`}>
      <AlertTriangle className="w-5 h-5 text-white mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold text-white">Motivo da Reprovação:</p>
        <p className="text-sm text-white/90">{rejectionReason}</p>
      </div>
    </div>
  );
}