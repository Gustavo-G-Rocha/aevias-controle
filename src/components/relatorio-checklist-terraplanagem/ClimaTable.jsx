import React from 'react';
import SectionTitleTerra from './SectionTitleTerra';
import { getClimaEmojiTerra, getClimaTextoTerra } from '@/utils/relatorioChecklistTerraplanagemUtils';

export default function ClimaTable({ periodos_clima }) {
  if (!periodos_clima || periodos_clima.length === 0) return null;

  return (
    <>
      <SectionTitleTerra>Condições Climáticas</SectionTitleTerra>
      <div className="mb-0.5">
        <table className="w-full border-collapse border border-slate-300">
          <thead className="bg-white">
            <tr>
              {periodos_clima.map((periodo, index) => (
                <th key={`periodo-${index}`} className="border border-slate-300 px-1 py-1 text-center font-bold uppercase text-xs">
                  {periodo.periodo === 'manha' ? 'MANHÃ' : 'TARDE'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {periodos_clima.map((periodo, index) => (
                <td key={index} className="border border-slate-300 px-1 py-1 text-center">
                  <p className="font-medium mb-0.5 text-xs">
                    Temp. Ambiente (°C): {periodo.temperatura_ambiente || 'N/A'}
                  </p>
                  <p className="font-bold text-sm">
                    {getClimaEmojiTerra(periodo.condicoes_climaticas)} {getClimaTextoTerra(periodo.condicoes_climaticas)}
                  </p>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}