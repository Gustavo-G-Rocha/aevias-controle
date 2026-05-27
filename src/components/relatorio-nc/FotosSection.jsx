/**
 * Seção de fotos do relatório de NC.
 */
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getLogoUrl } from '@/utils/relatorioNCUtils';

export default function FotosSection({
  nc,
  regional,
  compressedFotos,
  compressingFotos,
  onComprimir,
}) {
  useEffect(() => {
    if (nc.fotos?.length > 0) {
      onComprimir();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!nc.fotos?.length) return null;

  const logoUrl = getLogoUrl(regional);
  const fotos = compressedFotos.length > 0 ? compressedFotos : nc.fotos;

  return (
    <div className="break-before-page p-8 bg-white font-sans">
      <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-start">
          <picture>
            <source srcSet={logoUrl} />
            <img
              src={logoUrl}
              alt="Logo"
              className="h-16 object-contain"
              width="auto"
              height="64"
            />
          </picture>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800 uppercase">
            Relatório Fotográfico
          </h1>
          <p className="text-sm text-gray-600">
            {nc.numero_rnc ? `RNC: ${nc.numero_rnc}` : 'Não Conformidade'}
          </p>
        </div>
        <div></div>
      </header>

      {compressingFotos ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400 mr-2" />
          <span className="text-slate-500 text-sm">Comprimindo imagens...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {fotos.map((url, i) => (
            <div
              key={i}
              className="border border-slate-200 rounded p-2 flex flex-col items-center break-inside-avoid"
            >
              <picture>
                <source srcSet={url} />
                <img
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="max-h-64 object-contain w-full"
                  width="auto"
                  height="auto"
                />
              </picture>
              <p className="text-xs text-center text-gray-500 mt-1">
                Foto {i + 1}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}