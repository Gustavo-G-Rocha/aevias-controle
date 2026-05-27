import React from 'react';
import { formatDate } from '@/utils/relatorioUtils';

export default function RelatorioMRAFHeader({ ensaio, regional }) {
  return (
    <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-3 mb-4 print:pb-2 print:mb-3">
      <div className="flex justify-start">
        <picture>
          <source srcSet={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} />
          <img 
            src={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} 
            alt="Logo Regional" 
            className="h-16 print:h-12 object-contain" 
            width="auto" 
            height="64" 
          />
        </picture>
      </div>
      <div className="text-center">
        <h1 className="text-sm font-bold text-gray-800 leading-tight print:text-xs print:leading-tight">
          ENSAIO DE EXTRAÇÃO E GRANULOMETRIA
        </h1>
      </div>
      <div className="flex justify-end items-start">
        <div className="text-right">
          <p className="text-xs font-bold text-gray-700 print:text-[10px]">DATA:</p>
          <p className="text-sm font-semibold text-gray-900 print:text-xs">{formatDate(ensaio?.data_ensaio)}</p>
        </div>
      </div>
    </header>
  );
}