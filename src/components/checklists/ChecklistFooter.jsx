import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, CheckCircle } from "lucide-react";
import TruthConfirmationDialog from "@/components/forms/TruthConfirmationDialog";
import { useOptimisticSave } from "@/hooks/useOptimisticSave";

export default function ChecklistFooter({
  isEditable,
  isApproved,
  loadingUpload,
  onCancel,
  onSaveProgress,
  onFinalize,
}) {
  const [showTruthConfirm, setShowTruthConfirm] = useState(false);
  // Feedback otimista no "Salvar Progresso": mostra sucesso na hora do clique
  const { showSaved, handleClick: handleSaveProgress } = useOptimisticSave(onSaveProgress);

  const handleFinalizeClick = (e) => {
    e.preventDefault();
    setShowTruthConfirm(true);
  };

  const handleConfirmTruth = () => {
    setShowTruthConfirm(false);
    onFinalize({ preventDefault: () => {} });
  };

  return (
    <>
      {/* Barra de ações no fluxo normal do formulário (não fixa) — a barra
          flutuante anterior cobria a largura da tela e sobrepunha o conteúdo. */}
      <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        {isEditable && !isApproved && (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={loadingUpload}
              onClick={handleSaveProgress}
              data-testid="save-progress-btn"
              className={showSaved ? "border-green-600 text-green-600 hover:text-green-600" : ""}
            >
              {showSaved ? (
                <><CheckCircle className="mr-2 h-4 w-4" /> Progresso salvo!</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Salvar Progresso</>
              )}
            </Button>
            <Button
              type="button"
              disabled={loadingUpload}
              onClick={handleFinalizeClick}
              data-testid="finalize-btn"
            >
              <Save className="mr-2 h-4 w-4" /> Finalizar
            </Button>
          </>
        )}
        {isApproved && (
          <Badge className="bg-green-500 hover:bg-green-500 px-4 py-2 text-md">
            <CheckCircle className="mr-2 h-4 w-4" /> Aprovado
          </Badge>
        )}
      </div>
      <TruthConfirmationDialog
        open={showTruthConfirm}
        onOpenChange={setShowTruthConfirm}
        onConfirm={handleConfirmTruth}
      />
    </>
  );
}