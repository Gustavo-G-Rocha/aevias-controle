import React from "react";
import { chunkArray, formatDate } from "@/utils/relatorioBoletimSondagemUtils";

const DEFAULT_LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

export default function BoletimSondagemFotos({ boletim, obra, regional }) {
  if (!boletim.fotos?.length) return null;

  const logo = regional?.logo_url || DEFAULT_LOGO;
  const photoChunks = chunkArray(boletim.fotos, 6);

  return (
    <>
      {photoChunks.map((chunk, pageIndex) => (
        <div
          key={pageIndex}
          className="p-8 print:p-8 flex flex-col min-h-screen"
          style={{ breakBefore: "page" }}
        >
          <div className="w-full max-w-[190mm] mx-auto flex-grow flex flex-col">
            <header className="grid grid-cols-3 items-center border-b-2 border-gray-800 pb-2">
              <div className="flex justify-start">
                <picture>
                  <source srcSet={logo} />
                  <img src={logo} alt="Logo" className="h-16 object-contain" width="auto" height="64" />
                </picture>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-800">Relatório Fotográfico</h1>
                <p className="text-sm text-gray-600">Boletim de Sondagem — {obra?.name || ""}</p>
              </div>
              <div className="flex justify-end">
                <div className="border border-gray-400 p-2 rounded-md text-sm">
                  <p>{formatDate(boletim.data)}</p>
                </div>
              </div>
            </header>

            <main className="grid grid-cols-2 gap-4 mt-4">
              {chunk.map((fotoUrl, fotoIndex) => (
                <div
                  key={fotoIndex}
                  className="border p-2 rounded-lg flex flex-col"
                >
                  <div className="bg-gray-100 flex items-center justify-center rounded overflow-hidden">
                    <picture>
                      <source srcSet={fotoUrl} />
                      <img
                        src={fotoUrl}
                        alt={`Foto ${pageIndex * 6 + fotoIndex + 1}`}
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '280px' }}
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

            <footer className="mt-auto pt-2 text-center text-xs text-gray-500">
              Página {pageIndex + 2} de {photoChunks.length + 1}
            </footer>
          </div>
        </div>
      ))}
    </>
  );
}