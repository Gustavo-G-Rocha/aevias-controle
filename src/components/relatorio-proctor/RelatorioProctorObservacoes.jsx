import React from 'react';

export default function RelatorioProctorObservacoes({ ensaio }) {
  if (!ensaio?.observacoes) return null;

  return (
    <section>
      <div className="bg-slate-200 px-2 py-0.5 font-bold" style={{ fontSize: '10px' }}>OBSERVAÇÕES</div>
      <div className="border border-slate-300 p-1 whitespace-pre-wrap" style={{ fontSize: '9px' }}>
        {ensaio.observacoes}
      </div>
    </section>
  );
}