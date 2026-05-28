import React from 'react';

const LOGO_DEFAULT = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

/**
 * Cabeçalho de impressão padrão para página de relatório
 * Inclui: logo, título e data
 */
export default function ReportHeader({ regional, title, checklist }) {
  const logoUrl = regional?.logo_url || LOGO_DEFAULT;
  const reportDate = new Date(checklist.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  return (
    <header className="grid grid-cols-3 items-center border-b-2 border-gray-800 pb-2">
      <div className="flex justify-start">
        <picture>
          <source srcSet={logoUrl} />
          <img src={logoUrl} alt="Logo Regional" className="h-16 object-contain" width="auto" height="64" />
        </picture>
      </div>
      <div className="text-center">
        <h1 className="text-2xl print:text-xl font-bold text-gray-800">{title}</h1>
      </div>
      <div className="flex justify-end text-sm print:text-xs">
        <div className="border border-gray-400 p-2 rounded-md">
          <p>{reportDate}</p>
        </div>
      </div>
    </header>
  );
}