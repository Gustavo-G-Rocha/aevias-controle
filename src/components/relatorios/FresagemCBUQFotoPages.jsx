import React from 'react';
import chunk from 'lodash/chunk';
import { normalizarFoto, extrairLegenda } from '@/utils/photoLegendaUtils';

/**
 * Páginas de Relatório Fotográfico do Registro de Fresagem e Lançamento de CBUQ.
 * 6 fotos por folha (grade 3x2) — folha na horizontal, igual à parte principal.
 * As imagens mantêm a proporção original (object-contain), sem esticar nem cortar.
 */
const FOTOS_POR_PAGINA = 6;

export default function FresagemCBUQFotoPages({ data }) {
  const photoChunks = chunk(data?.fotos || [], FOTOS_POR_PAGINA);

  if (!photoChunks.length) return null;

  return (
    <>
      {photoChunks.map((pageChunk, pageIndex) => (
        <div key={`page-${pageIndex}`} className="break-before-page">
          <div className="rfc-foto-page w-full max-w-[297mm] mx-auto bg-white pt-2 px-3 pb-3 print:pt-2 print:px-3 print:pb-3 flex flex-col">
            <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-1 mb-2">
              <div className="flex justify-start">
                <picture>
                  <source srcSet={data.logo_url} />
                  <img src={data.logo_url} alt="Logo Regional" className="h-12 object-contain" width="auto" height="48" />
                </picture>
              </div>
              <div className="text-center">
                <h1 className="text-base font-bold text-gray-800">Relatório Fotográfico</h1>
                <p className="text-xs text-gray-600">Registro de Fresagem e Lançamento de CBUQ</p>
                <p className="text-xs text-gray-600">Obra: {data.obra_nome || 'N/A'}</p>
              </div>
              <div className="flex justify-end">
                <div className="border border-gray-400 p-1 rounded-md text-sm print:text-xs bg-white">
                  <p className="font-semibold text-gray-800">{data.data_inicio}</p>
                </div>
              </div>
            </header>

            <main className="grid grid-cols-3 gap-2">
              {pageChunk.map((foto, fotoIndex) => {
                const fotoNormalizada = normalizarFoto(foto);
                const legenda = extrairLegenda(foto, pageIndex * FOTOS_POR_PAGINA + fotoIndex);
                return (
                  <div key={`foto-${fotoIndex}`} className="border p-1.5 rounded-lg break-inside-avoid flex flex-col">
                    <div className="bg-gray-100 flex items-center justify-center rounded overflow-hidden" style={{ height: '225px' }}>
                      <picture>
                        <source srcSet={fotoNormalizada.url} />
                        <img src={fotoNormalizada.url} alt={legenda} className="max-w-full max-h-full object-contain" width="auto" height="auto" />
                      </picture>
                    </div>
                    <p className="text-center text-[10px] mt-1 font-medium leading-tight">{legenda}</p>
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