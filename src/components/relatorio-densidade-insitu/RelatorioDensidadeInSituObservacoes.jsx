import React from 'react';

export default function RelatorioDensidadeInSituObservacoes({ ensaio }) {
  if (!ensaio?.observacoes) return null;

  return (
    <div className="mb-3">
      <div className="bg-slate-200 px-2 py-0.5 font-bold text-[10px]">OBSERVAÇÕES</div>
      <div className="border border-slate-300 p-1 text-[10px] min-h-[20px]">
        {ensaio.observacoes}
      </div>
    </div>
  );
}