import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";

export default function EnsaioSondagemHeader({ editingEnsaio, status }) {
  return (
    <CardHeader>
      <CardTitle>{editingEnsaio ? 'Editar Ensaio de Sondagem' : 'Novo Ensaio de Sondagem'}</CardTitle>
      <CardDescription>Determinação da Densidade Relativa Aparente - DNIT 428-ME</CardDescription>

      {status === 'rascunho' && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-[#BFCF99]/20 border border-[#BFCF99]/40 rounded-lg">
          <Clock className="w-5 h-5 text-[#566E3D] mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-[#566E3D]">Registro em Rascunho</p>
            <p className="text-sm text-[#00233B]/70">Este ensaio está salvo como rascunho. Clique em "Finalizar Registro" quando estiver completo.</p>
          </div>
        </div>
      )}

      {editingEnsaio?.rejection_reason && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-red-50/50 border border-red-200/50 rounded-lg">
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