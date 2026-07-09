import React from "react";
import { useAcompanhamentoCargaCtx } from "./AcompanhamentoCargaContext";
import { Button } from "@/components/ui/button";
import { Save, Send, Loader2 } from "lucide-react";

export default function AcompanhamentoCargaActions() {
  const { canEdit, saving, handleSubmit } = useAcompanhamentoCargaCtx();
  if (!canEdit) return null;
  return (
    <div className="flex gap-3 justify-end pt-4 border-t">
      <Button variant="outline" onClick={() => handleSubmit(false)} disabled={saving}>
        <Save className="w-4 h-4 mr-2" />
        Salvar Progresso
      </Button>
      <Button
        onClick={() => handleSubmit(true)}
        disabled={saving}

      >
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
        Finalizar
      </Button>
    </div>
  );
}