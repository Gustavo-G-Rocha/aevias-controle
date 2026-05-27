import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function GranuMisturaActions({ isEditable, isApproved, saving, handleSubmit }) {
  const navigate = useNavigate();
  return (
    <div className="flex justify-end gap-4">
      <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("MeusEnsaios"))}>Cancelar</Button>
      {isEditable && (
        <>
          <Button type="button" variant="outline" onClick={e => handleSubmit(e, "rascunho")} disabled={saving} className="border-blue-400 text-blue-600 hover:bg-blue-50">
            <Save className="mr-2 h-4 w-4" /> Salvar Progresso
          </Button>
          <Button type="button" onClick={e => handleSubmit(e, "finalizado")} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Finalizar Registro
          </Button>
        </>
      )}
      {isApproved && (
        <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-md font-medium">
          <CheckCircle className="w-4 h-4" /> Aprovado
        </span>
      )}
    </div>
  );
}