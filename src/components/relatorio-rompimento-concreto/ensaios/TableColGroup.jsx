import React from "react";

/**
 * Colgroup padrão das tabelas de rompimento.
 * totalCpCols: número de colunas dinâmicas de CP.
 */
export default function TableColGroup({ totalCpCols }) {
  return (
    <colgroup>
      <col style={{ width: "30%" }} />
      <col style={{ width: "8%" }} />
      {Array.from({ length: totalCpCols }).map((_, i) => (
        <col key={i} style={{ width: `${62 / totalCpCols}%` }} />
      ))}
    </colgroup>
  );
}