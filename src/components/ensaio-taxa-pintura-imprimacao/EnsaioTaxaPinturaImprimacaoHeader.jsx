import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function EnsaioTaxaPinturaImprimacaoHeader({ editingEnsaio }) {
  return (
    <CardHeader>
      <CardTitle className="text-2xl">
        {editingEnsaio
          ? 'Editar Ensaio de Taxa de Pintura/Imprimação'
          : 'Novo Ensaio de Taxa de Pintura/Imprimação'}
      </CardTitle>
      <CardDescription>
        DNIT 145/2012 - ES
      </CardDescription>
      {editingEnsaio?.rejection_reason && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-red-600 border border-red-700 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-white mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-white">Motivo da Reprovação:</p>
            <p className="text-sm text-white/90">{editingEnsaio.rejection_reason}</p>
          </div>
        </div>
      )}
    </CardHeader>
  );
}