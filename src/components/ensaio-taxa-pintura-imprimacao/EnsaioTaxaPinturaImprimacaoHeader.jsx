import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function EnsaioTaxaPinturaImprimacaoHeader({ editingEnsaio }) {
  return (
    <CardHeader>
      <CardTitle className="text-[#00233B] text-2xl">
        {editingEnsaio
          ? 'Editar Ensaio de Taxa de Pintura/Imprimação'
          : 'Novo Ensaio de Taxa de Pintura/Imprimação'}
      </CardTitle>
      <CardDescription className="text-[#00233B]/80">
        DNIT 145/2012 - ES
      </CardDescription>
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