import React from 'react';

export default function CheckmarkColumn({ value, isYesColumn }) {
  if (value === null || typeof value === 'undefined') {
    return <span role="img" aria-label="Sem informação" className="text-slate-500">-</span>;
  }
  if (isYesColumn && value === true) {
    return <span role="img" aria-label="Sim, conforme" className="font-bold text-green-600 text-lg">✓</span>;
  }
  if (!isYesColumn && value === false) {
    return <span role="img" aria-label="Não, não conforme" className="font-bold text-red-600 text-lg">✗</span>;
  }
  return null;
}