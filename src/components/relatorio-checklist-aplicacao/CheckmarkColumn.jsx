import React from 'react';

export default function CheckmarkColumn({ value, isYesColumn }) {
  if (value === null || typeof value === 'undefined') {
    return <span className="text-slate-500">-</span>;
  }
  if (isYesColumn && value === true) {
    return <span className="font-bold text-green-600 text-lg">✓</span>;
  }
  if (!isYesColumn && value === false) {
    return <span className="font-bold text-red-600 text-lg">✗</span>;
  }
  return null;
}