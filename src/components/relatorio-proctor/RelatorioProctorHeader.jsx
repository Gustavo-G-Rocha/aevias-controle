import React from 'react';

export default function RelatorioProctorHeader({ regional }) {
  return (
    <header className="grid items-center py-1" style={{ gridTemplateColumns: '60px 1fr 60px' }}>
      <div>
        <picture>
          <source srcSet={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} />
          <img 
            src={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} 
            alt="Logo" 
            className="h-8 object-contain" 
            width="auto" 
            height="32" 
          />
        </picture>
      </div>
      <h1 className="text-xs font-bold text-gray-800 text-center">CARACTERIZAÇÃO MECÂNICA</h1>
    </header>
  );
}