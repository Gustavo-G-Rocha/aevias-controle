import React from 'react';
import { ReportSectionTitle } from '@/components/relatorios/shared';
import { getClimaEmojiRecic, getClimaTextRecic } from '@/utils/relatorioChecklistReciclagemUtils';

export default function ReciclagemClimaTable({ periodos = [] }) {
  if (!periodos || periodos.length === 0) return null;

  return (
    <div className="mb-2">
      <ReportSectionTitle size="sm">Condições Climáticas</ReportSectionTitle>
      <table className="w-full border-collapse border border-slate-300">
        <thead className="bg-white">
          <tr>
            {periodos.map((periodo, idx) => (
              <th key={idx} className="border border-slate-300 px-1 py-1.5 text-center font-bold uppercase text-[10px]">
                {periodo.periodo === 'manha' ? 'MANHÃ' : periodo.periodo === 'tarde' ? 'TARDE' : 'NOITE'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {periodos.map((periodo) => (
              <td key={periodo.periodo} className="border border-slate-300 px-1 py-1.5 text-center">
                <p className="font-medium mb-0.5 text-[9px]">
                  Temp: {periodo.temperatura_ambiente || 'N/A'}°C
                </p>
                <p className="font-bold text-[10px]">
                  {getClimaEmojiRecic(periodo.condicoes_climaticas)} {getClimaTextRecic(periodo.condicoes_climaticas)}
                </p>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}