import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, AlertTriangle } from "lucide-react";

export default function EnsaioGranIndividualHeader({ editingEnsaio, formData }) {
  return (
    <CardHeader>
      <CardTitle>
        {editingEnsaio?.id ? "Editar Granulometria Individual" : "Nova Granulometria Individual"}
      </CardTitle>
      <CardDescription>
        {editingEnsaio?.id
          ? `Editando ensaio de ${new Date(editingEnsaio.data_ensaio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
          : "Granulometria Individual dos Agregados"}
      </CardDescription>

      {formData.status === 'rascunho' && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
          <Clock className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-secondary">Registro em Rascunho</p>
            <p className="text-sm text-muted-foreground">
              Este ensaio está salvo como rascunho. Clique em "Finalizar Registro" quando estiver completo.
            </p>
          </div>
        </div>
      )}

      {formData.rejection_reason && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-destructive">Motivo da Reprovação:</p>
            <p className="text-sm text-muted-foreground">{formData.rejection_reason}</p>
          </div>
        </div>
      )}
    </CardHeader>
  );
}