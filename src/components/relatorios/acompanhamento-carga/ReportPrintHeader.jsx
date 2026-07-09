import React from 'react';
import { useRelatorioAcompanhamentoCargaCtx } from './RelatorioAcompanhamentoCargaContext';

/**
 * Header do relatório com logo da regional e data.
 * Consome o presentation model do contexto — não recebe props.
 */
export default function ReportPrintHeader() {
  const { data } = useRelatorioAcompanhamentoCargaCtx();
  const logoUrl = data?.logo_url;

  return (
    <>
      <div className="print:hidden">
        <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-1 mb-2">
          <div className="flex justify-start">
            <picture><source srcSet={logoUrl} /><img src={logoUrl} alt="Logo Regional" className="h-10 object-contain" width="auto" height="40" /></picture>
          </div>
          <div className="text-center">
            <h1 className="text-sm font-bold text-gray-800 whitespace-nowrap">Acompanhamento de Aplicação de CAUQ</h1>
          </div>
          <div className="flex justify-end">
            <div className="border border-gray-400 p-1 rounded-md text-xs">
              <p className="font-semibold text-gray-800">{data.data}</p>
            </div>
          </div>
        </header>
      </div>

      <div className="hidden print:block mb-4">
        <div className="grid grid-cols-3 items-start border-b-2 border-slate-900 pb-2">
          <div className="flex justify-start">
            <picture><source srcSet={logoUrl} /><img src={logoUrl} alt="Logo Regional" className="h-12 object-contain" width="auto" height="48" /></picture>
          </div>
          <div className="text-center">
            <h1 className="text-base font-bold text-gray-800">Acompanhamento de Aplicação de CAUQ</h1>
          </div>
          <div className="flex justify-end">
            <div className="border border-gray-400 px-2 py-1 rounded text-sm">
              <p className="font-semibold text-gray-800">{data.data}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}