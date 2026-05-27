import React from 'react';

export default function RelatorioTaxaMRAFObservacoes({ ensaio }) {
  if (!ensaio?.observacoes) return null;

  return (
    <div className="mb-2 text-xs">
      <span className="font-bold">Observações: </span>{ensaio.observacoes}
    </div>
  );
}