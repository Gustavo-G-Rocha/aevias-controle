/**
 * Cabeçalho do relatório de NC.
 */
import React from 'react';
import { formatDate, getLogoUrl } from '@/utils/relatorioNCUtils';

export default function NCReportHeader({ nc, obra, regional }) {
  const logoUrl = getLogoUrl(regional);

  return (
    <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-4 mb-6">
      <div className="flex justify-start">
        <picture>
          <source srcSet={logoUrl} />
          <img
            src={logoUrl}
            alt="Logo"
            className="h-16 object-contain"
            width="auto"
            height="64"
          />
        </picture>
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800 uppercase">
          Relatório de Não Conformidade
        </h1>
        <p className="text-sm text-gray-600">{obra?.name || nc.obra_nome || '—'}</p>
      </div>
      <div className="flex justify-end">
        <div className="border border-gray-400 p-2 rounded-md text-sm text-right">
          {nc.numero_rnc && (
            <p className="font-bold text-gray-800">RNC: {nc.numero_rnc}</p>
          )}
          <p className="text-gray-600">{formatDate(nc.data_nc)}</p>
        </div>
      </div>
    </header>
  );
}