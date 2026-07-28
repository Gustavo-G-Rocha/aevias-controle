/**
 * Cabeçalho sticky com toolbar de ações.
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function ToolbarHeader({ nc, onPrint }) {
  return (
    <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
      <div className="max-w-[210mm] mx-auto flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">
          Relatório de Não Conformidade
          {nc.numero_rnc ? ` – ${nc.numero_rnc}` : ''}
        </h2>
        <Button
          onClick={onPrint}
          className="bg-slate-800 text-white hover:bg-slate-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </div>
    </div>
  );
}