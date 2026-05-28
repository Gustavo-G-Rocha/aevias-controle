import React from 'react';
import { formatDateConcr } from '@/utils/relatorioChecklistConcretagemUtils';

const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

/**
 * Cabeçalho padrão para cada página impressa do relatório de concretagem.
 */
export default function ConcretagemPageHeader({ regional, data, titulo = "CONTROLE TECNOLÓGICO\nDE CONCRETO", small = false }) {
  const logoUrl = regional?.logo_url || DEFAULT_LOGO;
  const logoClass = small ? "h-10 object-contain" : "h-12 object-contain";
  const logoW = small ? "w-12" : "w-16";

  return (
    <div className={`flex justify-between items-start ${small ? 'mb-2 pb-2' : 'mb-4 pb-4'} border-b-2 border-slate-900`}>
      <div className={logoW}>
        <picture>
          <source srcSet={logoUrl} />
          <img src={logoUrl} alt="Logo" className={logoClass} width="auto" height={small ? "40" : "48"} />
        </picture>
      </div>

      <div className="text-center flex-1">
        {small ? (
          <>
            <h1 className="text-sm font-bold text-gray-800">Relatório Fotográfico</h1>
            <p className="text-[8px] text-gray-600">Checklist de Concretagem</p>
          </>
        ) : (
          <h1 className="text-sm font-bold text-gray-800 leading-tight whitespace-pre-line">{titulo}</h1>
        )}
      </div>

      <div className={`text-right ${logoW}`}>
        <div className={small ? '' : 'border border-gray-400 p-1 rounded inline-block'}>
          <p className={`${small ? 'text-[8px]' : 'text-[9px]'} font-semibold text-gray-800`}>
            {formatDateConcr(data)}
          </p>
        </div>
      </div>
    </div>
  );
}