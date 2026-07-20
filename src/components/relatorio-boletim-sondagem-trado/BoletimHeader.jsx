/**
 * Cabeçalho do relatório de boletim de sondagem a trado.
 */
import React from 'react';
import { getLogoUrl } from '@/utils/relatorioBoletimSondagemTradoUtils';

export default function BoletimHeader({ regional }) {
  const logoUrl = getLogoUrl(regional);

  return (
    <header className="grid grid-cols-3 items-center pb-1 mb-2">
      <div>
        <picture>
          <source srcSet={logoUrl} />
          <img
            src={logoUrl}
            alt="Logo"
            className="h-12 object-contain"
            width="auto"
            height="48"
          />
        </picture>
      </div>
      <div className="text-center">
        <h1 className="text-sm font-bold text-gray-800 leading-tight">
          BOLETIM DE SONDAGEM A TRADO
        </h1>
      </div>
      <div></div>
    </header>
  );
}