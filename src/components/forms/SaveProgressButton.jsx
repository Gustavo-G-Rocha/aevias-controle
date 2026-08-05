import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, CheckCircle } from "lucide-react";

/**
 * Componente reutilizável para botão de salvar progresso (rascunho).
 * Utilizado em formulários que precisam salvar estado intermediário.
 *
 * Feedback baseado apenas nos props `saving` e `saved` controlados pelo
 * parent — sem janelas otimistas temporizadas, evitando conflitos de
 * timing entre feedback visual e conclusão real da operação.
 */
export default function SaveProgressButton({
  onClick,
  saving = false,
  saved = false,
  disabled = false,
  label = "Salvar Progresso",
  savingLabel = "Salvando...",
  savedLabel = "Progresso salvo!",
  className = "",
  testId,
}) {
  const isSaved = saved && !saving;

  return (
    <Button
      type="button"
      disabled={saving || disabled}
      onClick={onClick}
      data-testid={testId}
      data-save-status={isSaved ? "saved" : saving ? "saving" : "idle"}
      aria-live="polite"
      className={`${className} ${isSaved ? "bg-green-600 hover:bg-green-600 text-white" : ""}`}
    >
      {isSaved ? (
        <><CheckCircle className="w-4 h-4 mr-2" />{savedLabel}</>
      ) : saving ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{savingLabel}</>
      ) : (
        <><Save className="w-4 h-4 mr-2" />{label}</>
      )}
    </Button>
  );
}