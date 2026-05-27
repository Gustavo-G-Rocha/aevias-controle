import React from 'react';
import { formatDate, getRecordTypeName } from '@/utils/relatorioUnificadoUtils';

export default function RelatorioUnificadoCapa({ obra, regional, filters, recordCount }) {
  const tipoNome = getRecordTypeName(filters.tipo);

  return (
    <div className="print:hidden max-w-5xl mx-auto px-6 pt-8 pb-4">
      <div className="border-b-2 border-slate-800 pb-4 mb-6">
        <div className="flex items-start justify-between">
          {regional?.logo_url && (
            <picture>
              <source srcSet={regional.logo_url} />
              <img src={regional.logo_url} alt="Logo" className="h-14 object-contain" width="auto" height="56" />
            </picture>
          )}
          <div className="text-right">
            <h1 className="text-2xl font-bold text-slate-800">RELATÓRIO UNIFICADO</h1>
            <p className="text-base font-semibold text-slate-600">{tipoNome}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
          <div>
            <p className="text-slate-500 font-medium">Obra</p>
            <p className="text-slate-800 font-semibold">{obra?.name}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Regional</p>
            <p className="text-slate-800 font-semibold">{regional?.nome || '-'}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Período</p>
            <p className="text-slate-800 font-semibold">{formatDate(filters.data_inicio)} a {formatDate(filters.data_fim)}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Total de Registros</p>
            <p className="text-slate-800 font-semibold">{recordCount}</p>
          </div>
        </div>
        {filters.laboratoristas?.length > 0 && (
          <div className="mt-3 text-sm">
            <p className="text-slate-500 font-medium">Laboratoristas</p>
            <p className="text-slate-700">{filters.laboratoristas.join(', ')}</p>
          </div>
        )}
        {filters.rodovia && (
          <div className="mt-3 text-sm">
            <p className="text-slate-500 font-medium">Rodovia</p>
            <p className="text-slate-700">{filters.rodovia}</p>
          </div>
        )}
        {filters.empreiteira && (
          <div className="mt-3 text-sm">
            <p className="text-slate-500 font-medium">Empreiteira</p>
            <p className="text-slate-700">{filters.empreiteira}</p>
          </div>
        )}
        {filters.usina && (
          <div className="mt-3 text-sm">
            <p className="text-slate-500 font-medium">Usina</p>
            <p className="text-slate-700">{filters.usina}</p>
          </div>
        )}
      </div>
    </div>
  );
}