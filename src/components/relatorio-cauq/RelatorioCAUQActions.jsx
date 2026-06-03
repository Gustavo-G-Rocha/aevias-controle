import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import AprovacaoBar from '@/components/relatorios/AprovacaoBar';
import { exportarCAUQExcel } from '@/utils/exportCAUQExcel';

export default function RelatorioCAUQActions({ ensaio, obra, regional, project, faixa, onPrint }) {
  const handleExportExcel = () => {
    exportarCAUQExcel({ ensaio, obra, regional, project, faixa });
  };

  return (
    <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
      <div className="max-w-[297mm] mx-auto flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">
          Relatório de Ensaio Marshall
        </h2>
        <div className="flex items-center gap-2">
          {ensaio && <AprovacaoBar entityName="EnsaioCAUQ" recordId={ensaio.id} />}
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-50"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={onPrint} className="bg-slate-800 text-white hover:bg-slate-700">
            <Download className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}