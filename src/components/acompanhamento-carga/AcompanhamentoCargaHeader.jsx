import React from "react";
import { useAcompanhamentoCargaCtx } from "./AcompanhamentoCargaContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AcompanhamentoCargaHeader() {
  const { editMode } = useAcompanhamentoCargaCtx();
  const navigate = useNavigate();
  return (
    <div className="mb-6 hidden lg:flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("MeusEnsaios"))}

        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {editMode ? "Editar" : "Novo"} Acompanhamento de Aplicação
          </h1>
          <p className="text-muted-foreground">CAUQ - Conservação e Implantação</p>
        </div>
      </div>
    </div>
  );
}