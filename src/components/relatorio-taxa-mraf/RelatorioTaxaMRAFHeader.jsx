import React from 'react';
import { formatDate } from '@/utils/relatorioTaxaMRAFUtils';

export default function RelatorioTaxaMRAFHeader({ ensaio, regional }) {
  return (
    <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-2 mb-3">
      <div className="flex justify-start">
        <picture>
          <source srcSet={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} />
          <img 
            src={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} 
            alt="Logo" 
            className="h-12 object-contain" 
            width="auto" 
            height="48" 
          />
        </picture>
      </div>
      <div className="text-center">
        <h1 className="text-sm font-bold text-gray-800 leading-tight">ENSAIO DE TAXA DE MRAF</h1>
        <p className="text-xs text-gray-500 mt-0.5">ABNT NBR 14746 / Método da Bandeja</p>
      </div>
      <div className="flex justify-end">
        <div className="border border-gray-400 px-2 py-1 rounded text-xs bg-white font-semibold">
          {formatDate(ensaio?.data_ensaio)}
        </div>
      </div>
    </header>
  );
}