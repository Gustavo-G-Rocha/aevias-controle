import React from 'react';

const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

export default function LimitesHeader({ regional }) {
  return (
    <header className="grid items-center py-1 mb-1" style={{ gridTemplateColumns: '60px 1fr 60px' }}>
      <div>
        <picture>
          <source srcSet={regional?.logo_url || DEFAULT_LOGO} />
          <img src={regional?.logo_url || DEFAULT_LOGO} alt="Logo" className="h-8 object-contain" width="auto" height="32" />
        </picture>
      </div>
      <h1 className="text-xs font-bold text-gray-800 text-center">CARACTERIZAÇÃO MECÂNICA</h1>
    </header>
  );
}