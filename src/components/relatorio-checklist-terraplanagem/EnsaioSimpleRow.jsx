import React from 'react';
import { formatarResultados } from '@/utils/relatorioChecklistTerraplanagemUtils';

export default function EnsaioSimpleRow({ label, realizado, quantidade, resultados }) {
  return (
    <tr style={{ height: '19.6px' }}>
      <td className="border border-slate-300 px-1 py-0.5 bg-white text-xs">{label}</td>
      <td className="border border-slate-300 px-1 py-0.5 text-center">
        {realizado ? <span className="text-green-600 font-bold text-base">✓</span> : <span className="text-slate-500">-</span>}
      </td>
      <td className="border border-slate-300 px-1 py-0.5 text-center text-xs">{quantidade || '-'}</td>
      <td className="border border-slate-300 px-1 py-0.5 text-xs font-medium text-center">{formatarResultados(resultados)}</td>
      <td className="border border-slate-300 px-1 py-0.5 text-center">-</td>
      <td className="border border-slate-300 px-1 py-0.5 text-center">-</td>
    </tr>
  );
}