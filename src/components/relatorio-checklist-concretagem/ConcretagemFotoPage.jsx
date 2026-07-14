import React from 'react';
import ConcretagemPageHeader from './ConcretagemPageHeader';

/**
 * Página de fotos para o relatório de concretagem.
 * Renderiza até 6 fotos por página em grid 2 colunas.
 */
export default function ConcretagemFotoPage({ chunk, pageIndex, regional, data }) {
  return (
    <div className="print-page w-full max-w-[210mm] mx-auto bg-white min-h-[297mm]">
      <ConcretagemPageHeader regional={regional} data={data} small />

      <div className="grid grid-cols-2 gap-2">
        {chunk.map((fotoUrl, fotoIndex) => (
          <div key={fotoIndex} className="border border-slate-300 p-1 rounded flex flex-col">
            <div className="bg-gray-100 flex items-center justify-center rounded overflow-hidden" style={{ height: '280px' }}>
              <img
                src={fotoUrl}
                alt={`Foto ${pageIndex * 6 + fotoIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <p className="text-center text-[8px] mt-1 font-medium">
              Foto {pageIndex * 6 + fotoIndex + 1}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}