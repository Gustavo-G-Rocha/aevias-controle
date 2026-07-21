import React from "react";

const DEFAULT_LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

export default function BoletimSondagemHeader({ regional }) {
  const logo = regional?.logo_url || DEFAULT_LOGO;
  return (
    <header className="grid grid-cols-3 items-center p-2 border border-[#94a3b8] mb-2">
      <div>
        <picture>
          <source srcSet={logo} />
          <img src={logo} alt="Logo" className="h-10 object-contain" width="auto" height="40" />
        </picture>
      </div>
      <div className="text-center">
        <h1 className="text-sm font-bold text-gray-800 uppercase">Boletim de Sondagem</h1>
      </div>
      <div />
    </header>
  );
}