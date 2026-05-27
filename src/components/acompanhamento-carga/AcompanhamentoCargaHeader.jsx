import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AcompanhamentoCargaHeader({ editMode }) {
  const navigate = useNavigate();
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("MeusEnsaios"))}
          className="border-white/20"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-[#00233B]">
            {editMode ? "Editar" : "Novo"} Acompanhamento de Aplicação
          </h1>
          <p className="text-[#00233B]/70">CAUQ - Conservação e Implantação</p>
        </div>
      </div>
    </div>
  );
}