import React from 'react';

/**
 * QR Code de validação de autenticidade do relatório.
 * Aparece apenas após a assinatura do responsável.
 * O QR code direciona para a tela do relatório no sistema,
 * permitindo que o cliente compare o documento impresso/PDF
 * com os dados originais armazenados.
 */
export default function ValidationQrCode({ url }) {
  if (!url) return null;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=${encodeURIComponent(url)}`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3px',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      padding: '4px 6px',
      backgroundColor: '#f8fafc',
    }}>
      <img
        src={qrSrc}
        alt="QR Code de Validação"
        width="60"
        height="60"
        style={{ width: '60px', height: '60px', display: 'block' }}
      />
      <span style={{
        fontSize: '7px',
        color: '#64748b',
        textAlign: 'center',
        maxWidth: '140px',
        lineHeight: '1.1',
      }}>
        Escaneie para validar
      </span>
    </div>
  );
}