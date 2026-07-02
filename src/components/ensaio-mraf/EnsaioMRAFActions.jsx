import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function EnsaioMRAFActions({
  saving, isEditable, isApproved, obraId,
  onSaveProgress, clearSavedData, navigate,
}) {
  return (
    <div className="flex justify-end gap-4 mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={() => { clearSavedData(); navigate(createPageUrl('MeusEnsaios')); }}
        disabled={saving}
      >
        Cancelar
      </Button>

      {isEditable && !isApproved && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveProgress}
            disabled={saving || !obraId}

          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Progresso
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Finalizar Registro
          </Button>
        </>
      )}

      {isApproved && (
        <Badge className="bg-green-500 hover:bg-green-500 px-4 py-2 text-md">
          <CheckCircle className="mr-2 h-4 w-4" /> Aprovado
        </Badge>
      )}
    </div>
  );
}