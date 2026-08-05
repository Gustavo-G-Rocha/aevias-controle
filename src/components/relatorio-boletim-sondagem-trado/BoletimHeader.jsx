/**
 * Cabeçalho do relatório de boletim de sondagem a trado.
 */
import React from 'react';
import { getLogoUrl } from '@/utils/relatorioBoletimSondagemTradoUtils';

export default function BoletimHeader({ regional }) {
  const logoUrl = getLogoUrl(regional);

  return (
    <header className="grid grid-cols-3 items-center p-2 border border-[#94a3b8] mb-2">
      <div>
        <picture>
          <source srcSet={logoUrl} />
          <img
            src={logoUrl}
            alt="Logo"
            className="h-10 object-contain"
            width="auto"
            height="40"
          />
        </picture>
      </div>
      <div className="text-center col-span-2">
        <h1 className="text-sm font-bold text-gray-800 uppercase">
          Boletim de Sondagem a Trado
        </h1>
      </div>
    </header>
  );
}