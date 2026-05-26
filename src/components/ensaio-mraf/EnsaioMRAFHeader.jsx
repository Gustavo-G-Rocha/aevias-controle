import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, AlertTriangle } from "lucide-react";

export default function EnsaioMRAFHeader({ editingEnsaio, status }) {
  return (
    <CardHeader>
      <CardTitle>{editingEnsaio?.id ? "Editar Ensaio MRAF" : "Novo Ensaio MRAF"}</CardTitle>
      <CardDescription>
        {editingEnsaio?.id
          ? `Editando ensaio de ${new Date(editingEnsaio.data_ensaio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
          : "Extração e Granulometria de MRAF"}
      </CardDescription>

      {status === 'rascunho' && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-[#BFCF99]/20 border border-[#BFCF99]/40 rounded-lg">
          <Clock className="w-5 h-5 text-[#566E3D] mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-[#566E3D]">Registro em Rascunho</p>
            <p className="text-sm text-[#00233B]/70">
              Este ensaio está salvo como rascunho. Clique em "Finalizar Registro" quando estiver completo.
            </p>
          </div>
        </div>
      )}

      {editingEnsaio?.rejection_reason && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Motivo da Reprovação:</p>
            <p className="text-sm text-red-700">{editingEnsaio.rejection_reason}</p>
          </div>
        </div>
      )}
    </CardHeader>
  );
}