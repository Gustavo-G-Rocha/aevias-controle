import React from 'react';
import { formatDateTerra } from '@/utils/relatorioChecklistTerraplanagemUtils';

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

export default function HeaderTerra({ regional, checklist }) {
  return (
    <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-1">
      <div className="flex justify-start">
        <picture>
          <source srcSet={regional?.logo_url || LOGO_URL} />
          <img src={regional?.logo_url || LOGO_URL} alt="Logo Regional" className="h-12 object-contain" width="auto" height="48" />
        </picture>
      </div>
      <div className="text-center">
        <h1 className="text-base font-bold text-gray-800">Controle Tecnológico de Terraplanagem</h1>
      </div>
      <div className="flex justify-end">
        <div className="border border-gray-400 p-1 rounded-md text-sm print:text-xs bg-white">
          <p className="font-semibold text-gray-800">{formatDateTerra(checklist.data)}</p>
        </div>
      </div>
    </header>
  );
}