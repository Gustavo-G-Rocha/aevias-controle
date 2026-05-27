import React from 'react';

export default function RelatorioDensidadeInSituHeader({ regional }) {
  return (
    <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-1 mb-2">
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
          ENSAIO DE DENSIDADE "IN SITU"<br/>MÉTODO FRASCO DE AREIA
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">DNIT 458/25</p>
      </div>
      <div className="flex justify-end" />
    </header>
  );
}