import React from 'react';
import ReportHeader from './ReportHeader';
import { normalizarFoto, extrairLegenda } from '@/utils/photoLegendaUtils';

const LOGO_DEFAULT = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

/**
 * Página de galeria fotográfica para relatório
 */
export default function PhotoGalleryPage({
  photoChunk,
  pageIndex,
  regional,
  checklist,
  obra,
  pageNumber,
  totalPages,
}) {
  return (
    <div className="p-8 print:p-8 flex flex-col page-container min-h-screen break-before-page">
      <div className="w-full max-w-[190mm] mx-auto flex-grow flex flex-col">
        <ReportHeader 
          regional={regional} 
          title="Relatório Fotográfico  Checklist" 
          checklist={checklist} 
        />
        
        <div className="text-base print:text-sm text-gray-600 mt-1 text-center">
          Obra: {obra?.name || 'N/A'}
        </div>
        
        <main className="grid grid-cols-2 gap-4 mt-4">
          {photoChunk.map((foto, fotoIndex) => {
            const fotoNormalizada = normalizarFoto(foto);
            const legenda = extrairLegenda(foto, pageIndex * 6 + fotoIndex);
            return (
              <div key={`foto-${fotoIndex}`} className="border p-2 rounded-lg break-inside-avoid flex flex-col">
                <div className="bg-gray-100 flex items-center justify-center rounded overflow-hidden" style={{ height: '280px' }}>
                  <picture>
                    <source srcSet={fotoNormalizada.url} />
                    <img 
                      src={fotoNormalizada.url} 
                      alt={legenda} 
                      className="w-full h-full object-contain"
                      width="auto" 
                      height="auto" 
                    />
                  </picture>
                </div>
                <p className="text-center text-base print:text-sm mt-2 font-medium">
                  {legenda}
                </p>
              </div>
            );
          })}
        </main>
        
        <footer className="mt-auto pt-2 text-center text-sm print:text-xs text-gray-500">
          Página {pageNumber} de {totalPages}
        </footer>
      </div>
    </div>
  );
}