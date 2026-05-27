/**
 * Cabeçalho do relatório de análise granulométrica da mistura.
 */
import React from 'react';
import { formatDate, getLogoUrl } from '@/utils/relatorioGranuMisturaUtils';

export default function GranuMistraHeader({ record, regional }) {
  const logoUrl = getLogoUrl(regional);

  return (
    <header
      className="grid items-center py-2 border-b-2 border-slate-800"
      style={{ gridTemplateColumns: '90px 1fr 90px' }}
    >
      <div>
        <picture>
          <source srcSet={logoUrl} />
          <img
            src={logoUrl}
            alt="Logo"
            className="h-14 object-contain"
            width="auto"
            height="56"
          />
        </picture>
      </div>
      <h1 className="text-base font-bold text-gray-800 text-center">
        ANÁLISE GRANULOMÉTRICA DA MISTURA
      </h1>
      <div className="text-sm font-semibold text-gray-800 text-right border border-slate-400 rounded px-2 py-1 h-fit flex items-center justify-center">
        {formatDate(record.data_ensaio)}
      </div>
    </header>
  );
}