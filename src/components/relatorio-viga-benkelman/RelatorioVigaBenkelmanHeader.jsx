import React from 'react';
import { formatDate } from '@/utils/relatorioVigaBenkelmanUtils';

export default function RelatorioVigaBenkelmanHeader({ ensaio, regional, faixaNome }) {
  return (
    <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-0 mb-0 mt-4 print:mt-0">
      <div className="flex justify-start">
        <picture>
          <source srcSet={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} />
          <img
            src={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"}
            alt="Logo"
            className="h-9 object-contain"
            width="auto"
            height="36"
          />
        </picture>
      </div>
      <div className="text-center">
        <h1 className="text-xs font-bold text-gray-800 leading-tight">
          LEVANTAMENTO DEFLECTOMÉTRICO POR VIGA BENKELMAN
        </h1>
        <p className="text-[9px] text-slate-600">MÉTODO DE ENSAIO DNER-ME-024/94</p>
      </div>
      <div className="flex justify-end">
        <div className="text-[10px] text-gray-600 border border-slate-300 rounded px-1 py-0">
          {formatDate(ensaio.data_realizacao) || '-'}
        </div>
      </div>
    </header>
  );
}