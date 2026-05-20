import { AlertTriangle, Clock } from "lucide-react";

/**
 * Banner padronizado para registros em rascunho.
 * Usado em: ChecklistUsina, ChecklistAplicacao, ChecklistConcretagem,
 *           DiarioObra, EnsaioCAUQ e demais formulários.
 */
export default function StatusDraftBanner({ status, variant = "blue" }) {
  if (status !== "rascunho") return null;

  if (variant === "green") {
    return (
      <div className="mt-4 flex items-start gap-2 p-3 bg-[#BFCF99]/20 border border-[#BFCF99]/40 rounded-lg">
        <Clock className="w-5 h-5 text-[#566E3D] mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-[#566E3D]">Registro em Rascunho</p>
          <p className="text-sm text-[#00233B]/70">
            Este ensaio está salvo como rascunho. Clique em "Finalizar Registro" quando estiver completo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold text-blue-800">Em Rascunho</p>
        <p className="text-sm text-blue-700">
          Este registro ainda está em edição e não será visível aos gestores até que você o finalize.
        </p>
      </div>
    </div>
  );
}