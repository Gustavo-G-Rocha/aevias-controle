import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, CheckCircle } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function EnsaioGranIndividualActions({
  isEditable, isApproved, onSubmit, navigate,
}) {
  return (
    <div className="flex justify-end gap-4">
      <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('MeusEnsaios'))}>
        Cancelar
      </Button>

      {isEditable && !isApproved && (
        <>
          <Button type="button" variant="outline"
            onClick={(e) => onSubmit(e, 'rascunho')}
            className="border-[#BFCF99] text-[#00233B] hover:bg-[#BFCF99]/10">
            <Save className="mr-2 h-4 w-4" /> Salvar Progresso
          </Button>
          <Button type="button" onClick={(e) => onSubmit(e, 'finalizado')}
            className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="mr-2 h-4 w-4" /> Finalizar Registro
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