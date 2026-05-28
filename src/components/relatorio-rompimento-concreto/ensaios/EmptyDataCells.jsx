import React from "react";

/**
 * Renderiza células vazias de placeholder para quando series está vazio.
 * count: número de células (padrão 4).
 * colSpan: colSpan em vez de células individuais.
 */
export default function EmptyDataCells({ count = 4, colSpan, className = "" }) {
  const base = "border border-slate-400 px-2 py-1";
  if (colSpan) {
    return (
      <td className={`${base} ${className}`} colSpan={colSpan}></td>
    );
  }
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <td key={i} className={`${base} ${className}`}></td>
      ))}
    </>
  );
}