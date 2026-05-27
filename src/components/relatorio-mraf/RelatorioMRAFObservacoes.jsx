import React from 'react';

export default function RelatorioMRAFObservacoes({ ensaio }) {
  if (!ensaio?.observacoes) return null;

  return (
    <div className="mt-3 print:mt-2 mb-4 print:mb-3">
      <div className="bg-slate-200 font-bold px-3 py-2 text-[10px] print:text-[9px] print:px-2 print:py-1">OBSERVAÇÕES</div>
      <div className="border border-slate-300 p-3 text-[10px] min-h-[40px] print:text-[9px] print:p-2 print:min-h-[30px]">
        {ensaio.observacoes}
      </div>
    </div>
  );
}