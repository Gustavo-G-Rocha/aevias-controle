import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import AprovacaoBar from '@/components/relatorios/AprovacaoBar';

export default function RelatorioDiarioHeader({ diario, onPrint }) {
  return (
    <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
      <div className="max-w-[210mm] mx-auto flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">
          Relatório de Diário de Obra
        </h2>
        <div className="flex items-center gap-2">
          {diario && <AprovacaoBar entityName="DiarioObra" recordId={diario?.id} />}
          <Button onClick={onPrint} className="bg-slate-800 text-white hover:bg-slate-700">
            <Download className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}