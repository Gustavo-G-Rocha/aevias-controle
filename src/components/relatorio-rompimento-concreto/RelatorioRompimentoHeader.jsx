import React from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AprovacaoBar from "@/components/relatorios/AprovacaoBar";
import { fmtDate } from "@/utils/relatorioRompimentoConcretoUtils";

export default function RelatorioRompimentoHeader({ ensaio, regional, onPrint }) {
  return (
    <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-3 shadow-sm z-10">
      <div className="max-w-[210mm] mx-auto flex justify-between items-center">
        <h2 className="text-base font-semibold text-slate-800">
          Ficha de Moldagem — Rompimento de Concreto
        </h2>
        <div className="flex items-center gap-2">
          {ensaio && (
            <AprovacaoBar
              entityName="EnsaioRompimentoConcreto"
              recordId={ensaio.id}
            />
          )}
          <Button
            onClick={onPrint}
            className="bg-slate-800 text-white hover:bg-slate-700"
          >
            <Download className="w-4 h-4 mr-2" /> Gerar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}