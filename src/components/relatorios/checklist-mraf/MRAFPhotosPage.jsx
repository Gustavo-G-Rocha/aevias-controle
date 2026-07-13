import React from 'react';

const LOGO_DEFAULT = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";
const PHOTOS_PER_PAGE = 6;

export default function MRAFPhotosPage({ photos, pageIndex, regional, obra }) {
  const photoNumber = (idx) => pageIndex * PHOTOS_PER_PAGE + idx + 1;

  return (
    <div className="break-before-page relative min-h-[297mm] p-4 print:p-4 flex flex-col">
      <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-2 mb-4">
        <div className="flex justify-start">
          <picture>
            <source srcSet={regional?.logo_url || LOGO_DEFAULT} />
            <img 
              src={regional?.logo_url || LOGO_DEFAULT} 
              alt="Logo Regional" 
              className="h-10 object-contain"
              width="40" height="40"
              loading="lazy"
            />
          </picture>
        </div>
        <div className="text-center">
          <h1 className="text-sm font-bold text-gray-800">Relatório Fotográfico - Checklist MRAF</h1>
          <p className="text-xs text-gray-600">Obra: {obra?.name || 'N/A'}</p>
        </div>
        <div className="flex justify-end" />
      </header>

      <div className="flex-1 flex items-stretch">
        <div className="grid grid-cols-2 gap-4 w-full">
          {photos.map((foto, index) => (
            <div key={index} className="break-inside-avoid flex flex-col">
              <div className="border-2 border-slate-300 rounded overflow-hidden bg-slate-50 flex items-center justify-center" style={{ height: '280px' }}>
                <picture>
                  <source srcSet={foto} />
                  <img 
                    src={foto} 
                    alt={`Foto ${photoNumber(index)}`} 
                    className="w-full h-full object-contain"
                    width="auto" 
                    height="auto" 
                    loading="lazy" 
                  />
                </picture>
              </div>
              <p className="text-center text-sm text-slate-600 mt-2 font-medium">
                Foto {photoNumber(index)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-4 pt-2 break-inside-avoid" />
    </div>
  );
}