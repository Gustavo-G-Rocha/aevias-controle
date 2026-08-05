import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { useOptimisticSave } from "@/hooks/useOptimisticSave";

/**
 * Componente reutilizável para botão de salvar progresso (rascunho).
 * Utilizado em formulários que precisam salvar estado intermediário.
 * Exibe feedback otimista de sucesso imediatamente ao clicar
 * (revertido caso a operação falhe).
 */
export default function SaveProgressButton({ 
  onClick, 
  saving = false, 
  disabled = false,
  label = "Salvar Progresso",
  savingLabel = "Salvando...",
  savedLabel = "Progresso salvo!",
  className = "",
  testId,
  saved = false,
}) {
  const { showSaved, handleClick } = useOptimisticSave(onClick);
  const isSaved = saved || showSaved;

  return (
    <Button
      type="button"
      disabled={saving || disabled}
      onClick={handleClick}
      data-testid={testId}
      data-save-status={saved ? "saved" : saving ? "saving" : "idle"}
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