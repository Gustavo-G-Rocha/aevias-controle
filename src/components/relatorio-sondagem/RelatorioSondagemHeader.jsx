import React from "react";

export default function RelatorioSondagemHeader({ regional, ensaio }) {
  return (
    <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-0.5 mb-1">
      <div className="flex justify-start">
        <picture>
          <source srcSet={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} />
          <img
            src={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"}
            alt="Logo Regional"
            className="h-12 object-contain"
            width="auto"
            height="48"
          />
        </picture>
      </div>
      <div className="text-center">
        <h1 className="text-sm font-bold text-gray-800 leading-tight">
          DETERMINAÇÃO DO GRAU DE COMPACTAÇÃO<br />
          DE CORPOS DE PROVA EXTRAÍDOS DE PISTA
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">MÉTODO DE ENSAIO: {ensaio.metodo_ensaio || 'DNIT 428/2022'}</p>
      </div>
      <div className="flex justify-end"></div>
    </header>
  );
}