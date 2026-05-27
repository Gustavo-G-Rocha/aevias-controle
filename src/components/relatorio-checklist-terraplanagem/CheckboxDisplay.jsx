import React from 'react';

export default function CheckboxDisplay({ value, column }) {
  if (!value) return <span className="text-slate-500">-</span>;
  if (column === 'sim' && value.sim === true) return <span className="text-green-600 font-bold text-base">✓</span>;
  if (column === 'nao' && value.nao === true) return <span className="text-red-600 font-bold text-base">✗</span>;
  if (column === 'na' && value.na === true) return <span className="text-slate-500">N/A</span>;
  return null;
}