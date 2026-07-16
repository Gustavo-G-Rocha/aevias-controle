import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, CheckCircle } from "lucide-react";
import TruthConfirmationDialog from "@/components/forms/TruthConfirmationDialog";

export default function ChecklistFooter({
  isEditable,
  isApproved,
  loadingUpload,
  onCancel,
  onSaveProgress,
  onFinalize,
}) {
  const [showTruthConfirm, setShowTruthConfirm] = useState(false);

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
      {/* Espaço para a barra de ações fixa não sobrepor o último conteúdo */}
      <div className="h-28 lg:h-20" aria-hidden="true" />

      {/* Barra fixa no rodapé para permanecer visível durante o preenchimento */}
      <div className="fixed bottom-16 lg:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-7xl z-30 flex justify-end gap-3 rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        {isEditable && !isApproved && (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={loadingUpload}
              onClick={onSaveProgress}
              data-testid="save-progress-btn"
            >
              <Save className="mr-2 h-4 w-4" /> Salvar Progresso
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