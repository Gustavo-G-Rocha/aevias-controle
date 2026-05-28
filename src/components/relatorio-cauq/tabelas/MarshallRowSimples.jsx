import React from 'react';
import CellsCP from './CellsCP';

/**
 * Linha Marshall simples: label + unidade + 6 CPs + 4 colunas vazias
 * Usado para linhas sem média ou com média fixa ('-')
 */
export default function MarshallRowSimples({ label, unidade, cpsValidos, bg, bold = false }) {
  return (
    <tr className={bg}>
      <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">{label}</td>
      <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">{unidade}</td>
      <CellsCP cpsValidos={cpsValidos} campo={label.toLowerCase().replace(/[^a-z0-9_]/g, '_')} bold={bold} />
      <td className="border border-slate-400 px-0 py-0 text-center font-semibold text-[7px]">-</td>
      <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
      <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
      <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
    </tr>
  );
}