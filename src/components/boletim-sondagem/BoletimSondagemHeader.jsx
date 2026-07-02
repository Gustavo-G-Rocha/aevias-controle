import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function BoletimSondagemHeader({ editingBoletim }) {
  return (
    <CardHeader>
      <CardTitle className="text-2xl">
        {editingBoletim ? 'Editar Boletim de Sondagem' : 'Novo Boletim de Sondagem (PI)'}
      </CardTitle>
      <CardDescription className="text-muted-foreground">
        Umidade Natural | Densidade In Situ — DNER-ME 213/94 e DNER-ME 092/94
      </CardDescription>
      {editingBoletim?.rejection_reason && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-destructive">Motivo da Reprovação:</p>
            <p className="text-sm text-muted-foreground">{editingBoletim.rejection_reason}</p>
          </div>
        </div>
      )}
    </CardHeader>
  );
}