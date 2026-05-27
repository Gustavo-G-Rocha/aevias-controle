import React from "react";

export default function RelatorioRompimentoObs({ ensaio }) {
  return (
    <div className="mt-4 border border-slate-400 p-2 text-[9px] min-h-[120px]">
      <span className="font-semibold">OBS.:</span>
      <div className="mt-1 whitespace-pre-wrap">{ensaio.observacoes || ""}</div>
    </div>
  );
}