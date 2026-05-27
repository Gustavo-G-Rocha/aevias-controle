import React from 'react';
import { formatarResultados } from '@/utils/relatorioChecklistTerraplanagemUtils';

export default function EnsaioRow({ label, ensaio, showConformidade = true, isCalculated = false }) {
  if (!ensaio && !isCalculated) return null;

  const realizado = ensaio?.realizado;
  const quantidade = ensaio?.quantidade || '-';
  const resultados = formatarResultados(ensaio?.resultados);
  const conforme = ensaio?.conforme;

  return (
    <tr style={{ height: '19.6px' }}>
      <td className="border border-slate-300 px-1 py-0.5 bg-white text-xs">{label}</td>
      <td className="border border-slate-300 px-1 py-0.5 text-center">
        {realizado ? <span className="text-green-600 font-bold text-base">✓</span> : <span className="text-slate-500">-</span>}
      </td>
      <td className="border border-slate-300 px-1 py-0.5 text-center text-xs">{quantidade}</td>
      <td className="border border-slate-300 px-1 py-0.5 text-xs font-medium text-center">{resultados}</td>
      {showConformidade && (
        <>
          <td className="border border-slate-300 px-1 py-0.5 text-center">
            {conforme === true && <span className="text-green-600 font-bold text-base">✓</span>}
          </td>
          <td className="border border-slate-300 px-1 py-0.5 text-center">
            {conforme === false && <span className="text-red-600 font-bold text-base">✗</span>}
          </td>
        </>
      )}
    </tr>
  );
}