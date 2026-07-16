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
      <div className="mt-4 flex items-start gap-2 p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
        <Clock className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-secondary">Registro em Rascunho</p>
          <p className="text-sm text-muted-foreground">
            Toque em "Salvar Progresso" para salvar como rascunho a qualquer momento (apenas a obra é obrigatória). Toque em "Finalizar" quando estiver completo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-start gap-2 p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
      <AlertTriangle className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold text-secondary">Em Rascunho</p>
        <p className="text-sm text-muted-foreground">
          Toque em "Salvar Progresso" para salvar como rascunho a qualquer momento (apenas a obra é obrigatória). Não será visível aos gestores até a finalização.
        </p>
      </div>
    </div>
  );
}