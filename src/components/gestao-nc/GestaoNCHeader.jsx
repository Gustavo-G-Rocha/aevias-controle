import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export default function GestaoNCHeader({ canCreateNC }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-7 h-7 text-destructive" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de NCs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Relatórios de Não Conformidade
          </p>
        </div>
      </div>
      {canCreateNC && (
        <Button
          onClick={() => navigate(createPageUrl("NovaNC"))}
          className="bg-muted text-white hover:bg-muted/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova NC
        </Button>
      )}
    </div>
  );
}