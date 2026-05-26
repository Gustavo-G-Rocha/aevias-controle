import React from 'react';
import { formatDate } from '@/utils/relatorioCAUQUtils';

const DEFAULT_LOGO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png';

export default function RelatorioCAUQHeader({ ensaio, regional }) {
  const logoUrl = regional?.logo_url || DEFAULT_LOGO;

  return (
    <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-0 mb-0">
      <div className="flex justify-start">
        <picture>
          <source srcSet={logoUrl} />
          <img
            src={logoUrl}
            alt="Logo Regional"
            className="h-10 print:h-7 object-contain"
            width="auto" height="40"
            loading="lazy"
          />
        </picture>
      </div>

      <div className="text-center">
        <h1 className="text-xs font-bold text-gray-800 leading-tight print:text-[9px] print:leading-tight">
          {ensaio.realizar_marshall || ensaio.realizar_densidade_rice ? (
            <>ENSAIO DE EXTRAÇÃO E GRANULOMETRIA<br />PARÂMETROS MARSHALL E DENSIDADE RICE</>
          ) : (
            <>ENSAIO DE EXTRAÇÃO E GRANULOMETRIA</>
          )}
        </h1>
        {(ensaio.realizar_marshall || ensaio.realizar_densidade_rice) && (
          <p className="text-[10px] text-gray-500 mt-0.5 print:text-[7px] print:mt-0">
            MÉTODO DE ENSAIO: DNIT 428/22 - NBR 15087/12
          </p>
        )}
      </div>

      <div className="flex justify-end items-start">
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-700 print:text-[9px]">DATA:</p>
          <p className="text-xs font-semibold text-gray-900 print:text-[10px]">
            {formatDate(ensaio.data_ensaio)}
          </p>
        </div>
      </div>
    </header>
  );
}