import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import AprovacaoBar from '@/components/relatorios/AprovacaoBar';
import ExcelExportButton from '@/components/ensaios/ExcelExportButton';

export default function RelatorioDiarioHeader({ diario, onPrint, downloading }) {
  return (
    <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
      <div className="max-w-[210mm] mx-auto flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">
          Relatório de Diário de Obra
        </h2>
        <div className="flex items-center gap-2">
          {diario && <AprovacaoBar entityName="DiarioObra" recordId={diario?.id} />}
          {diario && (
            <ExcelExportButton record={{ ...diario, entityType: 'DiarioObra' }} variant="full" />
          )}
          <Button onClick={onPrint} disabled={downloading} className="bg-slate-800 text-white hover:bg-slate-700">
            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {downloading ? 'Gerando...' : 'Imprimir'}
          </Button>
        </div>
      </div>
    </div>
  );
}