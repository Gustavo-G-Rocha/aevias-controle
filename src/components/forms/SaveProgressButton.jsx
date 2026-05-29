import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

/**
 * Componente reutilizável para botão de salvar progresso (rascunho).
 * Utilizado em formulários que precisam salvar estado intermediário.
 */
export default function SaveProgressButton({ 
  onClick, 
  saving = false, 
  disabled = false,
  label = "Salvar Progresso",
  savingLabel = "Salvando...",
  className = "bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90"
}) {
  return (
    <Button
      type="button"
      disabled={saving || disabled}
      onClick={onClick}
      className={className}
    >
      {saving ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{savingLabel}</>
      ) : (
        <><Save className="w-4 h-4 mr-2" />{label}</>
      )}
    </Button>
  );
}