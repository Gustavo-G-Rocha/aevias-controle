import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EnsaioSondagemActions({ saving, uploadingPhotos, obraId, onSaveProgress }) {
  const navigate = useNavigate();
  return (
    <div className="flex justify-end gap-4 mt-6">
      <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('MeusEnsaios'))} disabled={saving}>
        Cancelar
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onSaveProgress}
        disabled={saving || uploadingPhotos || !obraId}
        className="border-[#BFCF99] text-[#00233B] hover:bg-[#BFCF99]/10"
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Salvar Progresso
      </Button>
      <Button type="submit" disabled={saving || uploadingPhotos} className="bg-blue-600 hover:bg-blue-700">
        {saving
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
          : <><CheckCircle className="mr-2 h-4 w-4" />Finalizar Registro</>
        }
      </Button>
    </div>
  );
}