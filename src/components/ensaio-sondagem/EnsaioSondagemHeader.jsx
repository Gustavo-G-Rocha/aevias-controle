import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";

export default function EnsaioSondagemHeader({ editingEnsaio, status }) {
  return (
    <CardHeader>
      <CardTitle>{editingEnsaio ? 'Editar Ensaio de Sondagem' : 'Novo Ensaio de Sondagem'}</CardTitle>
      <CardDescription>Determinação da Densidade Relativa Aparente - DNIT 428-ME</CardDescription>

      {status === 'rascunho' && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
          <Clock className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-secondary">Registro em Rascunho</p>
            <p className="text-sm text-muted-foreground">Este ensaio está salvo como rascunho. Clique em "Finalizar Registro" quando estiver completo.</p>
          </div>
        </div>
      )}

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