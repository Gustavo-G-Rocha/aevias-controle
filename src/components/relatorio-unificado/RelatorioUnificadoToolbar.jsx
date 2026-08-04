import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';
import { formatDate, getRecordTypeName } from '@/utils/relatorioUnificadoUtils';

export default function RelatorioUnificadoToolbar({ obra, filters, recordCount, onGoBack, onPrint, onSign, signature, canSign, checkingAccess = false, signing = false }) {
  const tipoNome = getRecordTypeName(filters.tipo);

  return (
    <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
      <div className="max-w-5xl mx-auto flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Relatório Unificado</h2>
          <p className="text-sm text-slate-500">
            {obra?.name} · {tipoNome} · {formatDate(filters.data_inicio)} a {formatDate(filters.data_fim)} · {recordCount} registro(s)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={onGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          {canSign && !signature && (
            <Button onClick={onSign} disabled={checkingAccess || signing} className="bg-blue-600 text-white hover:bg-blue-700">
              {(checkingAccess || signing) ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              {checkingAccess ? 'Verificando...' : signing ? 'Assinando...' : 'Assinar Eletronicamente'}
            </Button>
          )}
          {signature && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Assinado
            </div>
          )}
          <Button onClick={onPrint} className="bg-slate-800 text-white hover:bg-slate-700">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir / PDF
          </Button>
        </div>
      </div>
    </div>
  );
}