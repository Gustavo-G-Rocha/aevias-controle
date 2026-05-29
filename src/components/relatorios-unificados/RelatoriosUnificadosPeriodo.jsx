import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function RelatoriosUnificadosPeriodo({
  dataInicio,
  setDataInicio,
  dataFim,
  setDataFim,
}) {
  const handleDataInicio = (e) => {
    const val = e.target.value;
    setDataInicio(val);
    // Se data fim já foi preenchida e ficou menor que a nova data início, ajusta
    if (dataFim && val && val > dataFim) {
      setDataFim(val);
    }
  };

  const handleDataFim = (e) => {
    const val = e.target.value;
    // Não permite data fim menor que data início
    if (dataInicio && val && val < dataInicio) return;
    setDataFim(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Data Início *</Label>
        <Input
          type="date"
          value={dataInicio}
          max={dataFim || undefined}
          onChange={handleDataInicio}
        />
      </div>
      <div className="space-y-2">
        <Label>Data Fim *</Label>
        <Input
          type="date"
          value={dataFim}
          min={dataInicio || undefined}
          onChange={handleDataFim}
        />
      </div>
    </div>
  );
}