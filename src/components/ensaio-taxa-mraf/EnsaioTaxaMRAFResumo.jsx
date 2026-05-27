import React from "react";
import { isNaoConforme, formatarTaxa } from "@/utils/ensaioTaxaMRAFUtils";

export default function EnsaioTaxaMRAFResumo({ formData }) {
  const taxaMin = formData.taxa_minima_projeto;
  const mediaNC = isNaoConforme(formData.media_taxa_mraf, taxaMin);

  return (
    <div className="rounded-lg border border-[#2d3b4e]/30 overflow-hidden">
      <div className="bg-[#2d3b4e] px-4 py-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Resumo - Médias Gerais</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#2d3b4e]/20 bg-[#e2e8f0]">
        <div className="p-4 text-center">
          <p className="text-xs text-[#2d3b4e]/70 font-medium mb-1">Taxa de Emulsão Média</p>
          <p className="text-2xl font-bold text-[#2d3b4e]">{formatarTaxa(formData.media_taxa_emulsao)}</p>
          <p className="text-xs text-[#2d3b4e]/60">L/m²</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-xs text-[#2d3b4e]/70 font-medium mb-1">Taxa de Agregado Média</p>
          <p className="text-2xl font-bold text-[#2d3b4e]">{formatarTaxa(formData.media_taxa_agregado)}</p>
          <p className="text-xs text-[#2d3b4e]/60">kg/m²</p>
        </div>
        <div className={`p-4 text-center ${mediaNC ? 'bg-red-100' : ''}`}>
          <p className="text-xs text-[#2d3b4e]/70 font-medium mb-1">Taxa MRAF Aplicada Média</p>
          <p className={`text-2xl font-bold ${mediaNC ? 'text-red-700' : 'text-[#2d3b4e]'}`}>{formatarTaxa(formData.media_taxa_mraf)}</p>
          <p className="text-xs text-[#2d3b4e]/60">kg/m²</p>
          {mediaNC && <p className="text-xs font-bold text-red-700 mt-1">⚠ NÃO CONFORME (mín: {taxaMin})</p>}
          {taxaMin != null && !mediaNC && formData.media_taxa_mraf != null && (
            <p className="text-xs text-green-700 mt-1">✓ Conforme (mín: {taxaMin})</p>
          )}
        </div>
      </div>
    </div>
  );
}