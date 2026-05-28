import React from 'react';
import { getClimaEmoji, getClimaTexto, getPeriodoNome } from '@/utils/relatorioChecklistConcretagemUtils';

/**
 * Tabela de condições climáticas por período para o relatório de concretagem.
 */
export default function ConcretagemClimaTable({ periodos }) {
  if (!periodos || periodos.length === 0) return null;

  return (
    <div className="mb-2">
      <div className="bg-[#f1f5f9] text-gray-800 px-2 py-1 font-bold text-[9px] mb-1 text-center">
        CONDIÇÕES CLIMÁTICAS
      </div>
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-slate-100">
            {periodos.map((p) => (
              <th key={p.periodo} className="border border-slate-300 px-1 py-0.5 text-center font-bold uppercase">
                {getPeriodoNome(p.periodo)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {periodos.map((p) => (
              <td key={p.periodo} className="border border-slate-300 px-1 py-0.5 text-center">
                <p className="font-medium mb-0.5">Temp. Ambiente (°C): {p.temperatura_ambiente || 'N/A'}</p>
                <p className="font-bold">{getClimaEmoji(p.condicoes_climaticas)} {getClimaTexto(p.condicoes_climaticas)}</p>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}