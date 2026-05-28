import React from 'react';
import { fmtDate } from '@/utils/relatorioLimitesUtils';

export default function LimitesInfoFields({ ensaio, obra }) {
  if (!ensaio) return null;

  const fields = [
    ["OBRA", obra?.name || '-'],
    ["LOCAL", ensaio.local_coleta || '-'],
    ["MATERIAL", ensaio.material || '-'],
    ["RODOVIA", ensaio.rodovia || '-'],
    ["ENERGIA", ensaio.energia_compactacao || '-'],
    ["LABORATORISTA", ensaio.laboratorista_name || '-'],
    ["TRECHO", ensaio.trecho || '-'],
    ["CAMADA", ensaio.camada || '-'],
    ["DATA", fmtDate(ensaio.data_ensaio)],
  ];

  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 text-[9px] border border-slate-300 p-1 rounded mb-1">
      {fields.map(([label, val]) => (
        <div key={label}>
          <span className="font-bold text-gray-700">{label}: </span>
          <span className="text-gray-900">{val}</span>
        </div>
      ))}
    </div>
  );
}