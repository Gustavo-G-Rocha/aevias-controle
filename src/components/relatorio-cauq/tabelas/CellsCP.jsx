import React from 'react';

/**
 * Renderiza células de 6 CPs em série
 * Usado em várias linhas Marshall
 */
export default function CellsCP({ cpsValidos, campo, bold = false }) {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map(idx => (
        <td
          key={idx}
          className={`border border-slate-400 px-0 py-0 text-center text-[7px] ${bold ? 'font-semibold' : ''}`}
        >
          {cpsValidos[idx]?.[campo] || '-'}
        </td>
      ))}
    </>
  );
}