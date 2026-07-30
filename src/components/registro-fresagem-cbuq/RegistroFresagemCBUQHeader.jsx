import React from "react";
import { useRegistroFresagemCBUQCtx } from "./RegistroFresagemCBUQContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RegistroFresagemCBUQHeader() {
  const { editMode } = useRegistroFresagemCBUQCtx();
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
            {editMode ? "Editar" : "Novo"} Registro de Fresagem e Lançamento de CBUQ
          </h1>
          <p className="text-muted-foreground">Fresagem e Recomposição</p>
        </div>
      </div>
    </div>
  );
}