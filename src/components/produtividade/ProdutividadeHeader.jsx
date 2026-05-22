import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProdutividadeHeader({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  cacheDiasCount,
  userCanEdit,
  onSaveCache,
}) {
  const getMonthName = (date) =>
    date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-[#BFCF99]" />
          <CardTitle className="text-2xl text-foreground">
            Produtividade dos Laboratoristas
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPreviousMonth}
            className="border-[#BFCF99]/30 hover:bg-[#BFCF99]/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-semibold text-[#00233B] min-w-[200px] text-center capitalize">
            {getMonthName(currentMonth)}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            className="border-[#BFCF99]/30 hover:bg-[#BFCF99]/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          {cacheDiasCount > 0 && userCanEdit && (
            <Button
              onClick={onSaveCache}
              className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90 ml-4"
            >
              Salvar {cacheDiasCount} alterações
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
}