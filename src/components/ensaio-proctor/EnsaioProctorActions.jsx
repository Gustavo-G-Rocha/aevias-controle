import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function EnsaioProctorActions({ saving, handleSave }) {
  return (
    <div className="flex gap-3 justify-end">
      <Button variant="outline" onClick={() => handleSave("rascunho")} disabled={saving}>
        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Salvar Rascunho
      </Button>
      <Button onClick={() => handleSave("finalizado")} disabled={saving}>
        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Finalizar
      </Button>
    </div>
  );
}