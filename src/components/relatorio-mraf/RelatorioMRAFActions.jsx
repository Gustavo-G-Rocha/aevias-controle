import React from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RelatorioMRAFActions({ ensaio: _ensaio, onPrint }) {
  return (
    <div className="flex gap-2 justify-end p-4 bg-white border-b border-slate-200 print:hidden">
      <Button 
        onClick={onPrint}
        className="gap-2 bg-slate-700 hover:bg-slate-800"
      >
        <Printer className="w-4 h-4" />
        Imprimir
      </Button>
    </div>
  );
}