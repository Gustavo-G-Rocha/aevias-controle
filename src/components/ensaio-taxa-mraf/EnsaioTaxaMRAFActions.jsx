import React from "react";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle, Loader2 } from "lucide-react";

export default function EnsaioTaxaMRAFActions({
  isEditable,
  saving,
  onSaveDraft,
  onFinalize,
  onCancel
}) {
  return (
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      {isEditable && (
        <>
          <Button onClick={onSaveDraft} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Rascunho
          </Button>
          <Button onClick={onFinalize} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalizar Ensaio
          </Button>
        </>
      )}
    </div>
  );
}