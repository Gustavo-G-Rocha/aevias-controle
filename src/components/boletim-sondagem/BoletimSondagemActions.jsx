import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BoletimSondagemActions({ isEditable, saving }) {
  const navigate = useNavigate();
  return (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={() => navigate(createPageUrl('MeusEnsaios'))} className="hover:bg-black/10">
        Cancelar
      </Button>
      {isEditable && (
        <Button type="submit" disabled={saving} className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90">
          {saving
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
            : <><Save className="w-4 h-4 mr-2" />Salvar Boletim</>
          }
        </Button>
      )}
    </div>
  );
}