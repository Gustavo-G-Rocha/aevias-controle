import React from 'react';
import { chunkArray, formatDataChecklist } from '@/utils/relatorioChecklistAplicacaoUtils';

const LOGO_FALLBACK = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

export default function PhotoPagesAplicacao({ photos, regional, checklist, obra }) {
  const photoChunks = chunkArray(photos, 6);
  if (!photoChunks.length) return null;

  return (
    <>
      {photoChunks.map((chunk, pageIndex) => (
        <div key={`page-foto-${pageIndex}`} className="p-8 print:p-8 flex flex-col page-container min-h-screen break-before-page">
          <div className="w-full max-w-[190mm] mx-auto flex-grow flex flex-col">
            <header className="grid grid-cols-3 items-center border-b-2 border-gray-800 pb-2">
              <div className="flex justify-start">
                <picture>
                  <source srcSet={regional?.logo_url || LOGO_FALLBACK} />
                  <img src={regional?.logo_url || LOGO_FALLBACK} alt="Logo Regional" className="h-16 object-contain" width="auto" height="64" />
                </picture>
              </div>
              <div className="text-center">
                <h1 className="text-2xl print:text-xl font-bold text-gray-800">Relatório Fotográfico Aplicação</h1>
                <p className="text-base print:text-sm text-gray-600">Obra: {obra?.name || 'N/A'}</p>
              </div>
              <div className="flex justify-end text-sm print:text-xs">
                <div className="border border-gray-400 p-2 rounded-md">
                  <p>{formatDataChecklist(checklist.data)}</p>
                </div>
              </div>
            </header>
            <main className="grid grid-cols-2 gap-4 mt-4">
              {chunk.map((fotoUrl, fotoIndex) => (
                <div key={fotoIndex} className="border p-2 rounded-lg break-inside-avoid flex flex-col">
                  <div className="bg-gray-100 flex items-center justify-center rounded overflow-hidden" style={{ height: '280px' }}>
                    <picture>
                      <source srcSet={fotoUrl} />
                      <img src={fotoUrl} alt={`Foto ${pageIndex * 6 + fotoIndex + 1}`} className="w-full h-full object-contain" width="auto" height="auto" />
                    </picture>
                  </div>
                  <p className="text-center text-base print:text-sm mt-2 font-medium">
                    Foto {pageIndex * 6 + fotoIndex + 1}
                  </p>
                </div>
              ))}
            </main>
            <footer className="mt-auto pt-2 break-inside-avoid"></footer>
          </div>
        </div>
      ))}
    </>
  );
}