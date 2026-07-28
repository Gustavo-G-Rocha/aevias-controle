import React from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AprovacaoBar from '@/components/relatorios/AprovacaoBar';

export default function RelatorioTaxaMRAFActions({ ensaio, onPrint }) {
  return (
    <div className="print:hidden p-4 flex gap-3 justify-between items-center border-b">
      <div>{ensaio && <AprovacaoBar entityName="EnsaioTaxaMRAF" recordId={ensaio.id} />}</div>
      <Button onClick={onPrint} className="bg-[#00233B] text-white">
        <Printer className="w-4 h-4 mr-2" /> Imprimir
      </Button>
    </div>
  );
}