import React from "react";
import { Loader2, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RelatoriosUnificadosBotoes({
  onLimpar,
  onGerar,
  isFormValid,
  generating,
}) {
  return (
    <div className="flex gap-3 pt-2">
      <Button
        variant="outline"
        onClick={onLimpar}
        className="flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Limpar Filtros
      </Button>
      <Button
        onClick={onGerar}
        disabled={!isFormValid || generating}
        className="bg-[#00233B] text-white hover:bg-[#00233B]/90 flex items-center gap-2"
      >
        {generating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        Gerar Relatório
      </Button>
    </div>
  );
}