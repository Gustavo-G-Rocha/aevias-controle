import React from 'react';

export default function CheckboxDisplay({ value, column }) {
  if (!value) return <span role="img" aria-label="Sem informação" className="text-slate-500">-</span>;
  if (column === 'sim' && value.sim === true) return <span role="img" aria-label="Sim, conforme" className="text-green-600 font-bold text-base">✓</span>;
  if (column === 'nao' && value.nao === true) return <span role="img" aria-label="Não, não conforme" className="text-red-600 font-bold text-base">✗</span>;
  if (column === 'na' && value.na === true) return <span role="img" aria-label="Não aplicável" className="text-slate-500">N/A</span>;
  return null;
}