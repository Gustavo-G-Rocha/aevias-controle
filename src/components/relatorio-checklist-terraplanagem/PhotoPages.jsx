import React from 'react';
import { formatDateTerra, chunkArray } from '@/utils/relatorioChecklistTerraplanagemUtils';
import { normalizarFoto, extrairLegenda } from '@/utils/photoLegendaUtils';

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

export default function PhotoPages({ photos, regional, checklist, obra }) {
  const photoChunks = chunkArray(photos, 6);

  if (!photoChunks.length) return null;

  return (
    <>
      {photoChunks.map((chunk, pageIndex) => (
        <div key={`page-${pageIndex}`} className="print:pt-2 print:pb-3 break-before-page">
          <div className="w-full max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none pt-2 px-3 pb-3 print:pt-2 print:px-3 print:pb-3 flex flex-col" data-report-page>
            {/* Photo header */}
            <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-1 mb-2">
              <div className="flex justify-start">
                <picture>
                  <source srcSet={regional?.logo_url || LOGO_URL} />
                  <img src={regional?.logo_url || LOGO_URL} alt="Logo Regional" className="h-12 object-contain" width="auto" height="48" />
                </picture>
              </div>
              <div className="text-center">
                <h1 className="text-base font-bold text-gray-800">Relatório Fotográfico</h1>
                <p className="text-xs text-gray-600">Terraplanagem</p>
                <p className="text-xs text-gray-600">Obra: {obra?.name || 'N/A'}</p>
              </div>
              <div className="flex justify-end">
                <div className="border border-gray-400 p-1 rounded-md text-sm print:text-xs bg-white">
                  <p className="font-semibold text-gray-800">{formatDateTerra(checklist.data)}</p>
                </div>
              </div>
            </header>

            {/* Photos grid */}
            <main className="grid grid-cols-2 gap-3">
              {chunk.map((foto, fotoIndex) => {
                const fotoNormalizada = normalizarFoto(foto);
                const legenda = extrairLegenda(foto, pageIndex * 6 + fotoIndex);
                return (
                  <div key={`foto-${fotoIndex}`} className="border p-2 rounded-lg break-inside-avoid flex flex-col">
                    <div className="bg-gray-100 flex items-center justify-center rounded overflow-hidden" style={{ height: '280px' }}>
                      <picture>
                        <source srcSet={fotoNormalizada.url} />
                        <img src={fotoNormalizada.url} alt={legenda} className="w-full h-full object-contain" width="auto" height="auto" />
                      </picture>
                    </div>
                    <p className="text-center text-sm mt-2 font-medium">
                      {legenda}
                    </p>
                  </div>
                );
              })}
            </main>
          </div>
        </div>
      ))}
    </>
  );
}