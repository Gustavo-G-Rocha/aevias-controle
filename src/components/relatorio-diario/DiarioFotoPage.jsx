import React from 'react';

const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

export default function DiarioFotoPage({ chunk, pageIndex, diario, obra, regional }) {
  return (
    <div className="break-before-page p-6 print:p-6">
      <header className="grid grid-cols-3 items-center border-b-2 border-gray-800 pb-4">
        <div className="flex justify-start">
          <picture>
            <source srcSet={regional?.logo_url || DEFAULT_LOGO} />
            <img src={regional?.logo_url || DEFAULT_LOGO} alt="Logo Regional" className="h-16 object-contain" width="auto" height="64" />
          </picture>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Relatório Fotográfico</h1>
          <p className="text-sm text-gray-600">Obra: {obra?.name || 'N/A'}</p>
        </div>
        <div className="flex justify-end">
          <div className="border border-gray-400 p-2 rounded-md">
            <p className="text-sm font-semibold text-gray-800">
              {new Date(diario.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
            </p>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-2 gap-3 mt-4">
        {chunk.map((fotoUrl, fotoIndex) => (
          <div key={fotoIndex} className="border p-2 rounded-lg break-inside-avoid flex flex-col">
            <div className="bg-gray-100 flex items-center justify-center rounded overflow-hidden">
              <picture>
                <source srcSet={fotoUrl} />
                <img
                  src={fotoUrl}
                  alt={`Foto ${pageIndex * 6 + fotoIndex + 1}`}
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '260px' }}
                  width="auto"
                  height="auto"
                />
              </picture>
            </div>
            <p className="text-center text-sm mt-2 font-medium">
              Foto {pageIndex * 6 + fotoIndex + 1}
            </p>
          </div>
        ))}
      </main>

    </div>
  );
}