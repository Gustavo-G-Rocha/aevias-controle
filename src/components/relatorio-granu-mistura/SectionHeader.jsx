/**
 * Cabeçalho de seção do relatório.
 */
import React from 'react';

export default function SectionHeader({ label }) {
  return (
    <div
      style={{ backgroundColor: '#1e293b' }}
      className="text-white text-[10px] font-bold text-center py-0.5 mt-2"
    >
      {label}
    </div>
  );
}