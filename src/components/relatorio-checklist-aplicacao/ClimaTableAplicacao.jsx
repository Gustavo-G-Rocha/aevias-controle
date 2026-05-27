import React from 'react';
import { formatClimaLabel } from '@/utils/relatorioChecklistAplicacaoUtils';

export default function ClimaTableAplicacao({ periodos_clima }) {
  if (!periodos_clima || periodos_clima.length === 0) return null;

  return (
    <div className="mt-0.5">
      <table className="w-full border-collapse border border-slate-300" style={{ fontSize: '10px' }}>
        <thead className="bg-slate-100">
          <tr>
            <th className="border border-slate-300 p-0.5 text-center font-medium">MANHÃ</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium">TARDE</th>
            <th className="border border-slate-300 p-0.5 text-center font-medium">NOITE</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {periodos_clima.map((periodo, index) => {
              const climaLabel = formatClimaLabel(periodo.condicoes_climaticas);
              return (
                <td key={index} className="border border-slate-300 p-0.5 text-center">
                  <p className="font-medium">Temp. Ambiente (°C): {periodo.temperatura_ambiente || '-'}</p>
                  <div className="mt-0.5">
                    {climaLabel
                      ? <p className="font-bold text-slate-800">{climaLabel}</p>
                      : <p className="text-slate-500">-</p>
                    }
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}