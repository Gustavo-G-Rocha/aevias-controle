import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function EnsaioTaxaMRAFHeader({ editingEnsaio }) {
  return (
    <CardHeader>
      <CardTitle className="text-2xl">
        {editingEnsaio ? 'Editar' : 'Novo'} Ensaio de Taxa de MRAF
      </CardTitle>
      <CardDescription className="text-muted-foreground">
        ABNT NBR 14746 / Método da Bandeja
      </CardDescription>
      {editingEnsaio?.rejection_reason && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-destructive">Motivo da Reprovação:</p>
            <p className="text-sm text-muted-foreground">{editingEnsaio.rejection_reason}</p>
          </div>
        </div>
      )}
    </CardHeader>
  );
}