import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, CheckCircle } from "lucide-react";
import TruthConfirmationDialog from "@/components/forms/TruthConfirmationDialog";
import { useOptimisticSave } from "@/hooks/useOptimisticSave";

/**
 * Ações da Certificação de Usina — botões inline ao final do formulário
 * (Cancelar / Salvar Progresso / Finalizar), no mesmo padrão dos demais
 * ensaios. Substitui a barra fixa (ChecklistFooter) que o usuário pediu para
 * remover. Preserva a confirmação de verdade no Finalizar e o feedback
 * otimista no Salvar Progresso.
 */
export default function CertificacaoUsinaActions({
  isEditable,
  isApproved,
  saving = false,
  loadingUpload = false,
  onCancel,
  onSaveProgress,
  onFinalize,
}) {
  const [showTruthConfirm, setShowTruthConfirm] = useState(false);
  const { showSaved, handleClick: handleSaveProgress } = useOptimisticSave(onSaveProgress);

  const handleFinalizeClick = (e) => {
    e.preventDefault();
    setShowTruthConfirm(true);
  };

  const handleConfirmTruth = () => {
    setShowTruthConfirm(false);
    onFinalize({ preventDefault: () => {} });
  };

  const busy = saving || loadingUpload;

  return (
    <>
      <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-border mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>

        {isEditable && !isApproved && (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
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
              disabled={busy}
              onClick={handleFinalizeClick}
              data-testid="finalize-btn"
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Finalizar
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