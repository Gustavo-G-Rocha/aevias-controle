import React from "react";
import { isNaoConforme, formatarTaxa } from "@/utils/ensaioTaxaMRAFUtils";

export default function EnsaioTaxaMRAFResumo({ formData }) {
  const taxaMin = formData.taxa_minima_projeto;
  const mediaNC = isNaoConforme(formData.media_taxa_mraf, taxaMin);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="bg-muted px-4 py-2">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Resumo - Médias Gerais</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border bg-card">
        <div className="p-4 text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">Taxa de Emulsão Média</p>
          <p className="text-2xl font-bold text-foreground">{formatarTaxa(formData.media_taxa_emulsao)}</p>
          <p className="text-xs text-muted-foreground/70">L/m²</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">Taxa de Agregado Média</p>
          <p className="text-2xl font-bold text-foreground">{formatarTaxa(formData.media_taxa_agregado)}</p>
          <p className="text-xs text-muted-foreground/70">kg/m²</p>
        </div>
        <div className={`p-4 text-center ${mediaNC ? 'bg-destructive/10' : ''}`}>
          <p className="text-xs text-muted-foreground font-medium mb-1">Taxa MRAF Aplicada Média</p>
          <p className={`text-2xl font-bold ${mediaNC ? 'text-destructive' : 'text-foreground'}`}>{formatarTaxa(formData.media_taxa_mraf)}</p>
          <p className="text-xs text-muted-foreground/70">kg/m²</p>
          {mediaNC && <p className="text-xs font-bold text-destructive mt-1">⚠ NÃO CONFORME (mín: {taxaMin})</p>}
          {taxaMin != null && !mediaNC && formData.media_taxa_mraf != null && (
            <p className="text-xs text-secondary mt-1">✓ Conforme (mín: {taxaMin})</p>
          )}
        </div>
      </div>
    </div>
  );
}