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
      gap: '4px',
    }}>
      <img
        src={qrSrc}
        alt="QR Code de Validação"
        width="80"
        height="80"
        style={{ width: '80px', height: '80px', display: 'block' }}
      />
      <span style={{
        fontSize: '8px',
        color: '#64748b',
        textAlign: 'center',
        maxWidth: '180px',
        lineHeight: '1.2',
      }}>
        Escaneie para verificar a autenticidade deste documento
      </span>
    </div>
  );
}