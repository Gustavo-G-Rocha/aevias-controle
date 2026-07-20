import React from 'react';
import ValidationQrCode from './ValidationQrCode';

const formatDateBrasilia = (dateString) => {
  if (!dateString) return 'N/A';
  let normalizedDate = dateString;
  if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
    normalizedDate = dateString + 'Z';
  }
  return new Date(normalizedDate).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'medium' });
};

const colStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  textAlign: 'center',
  width: '100%',
};

const signatureAreaStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  textAlign: 'center',
  width: '100%',
  minHeight: '36px',
};

const lineStyle = {
  borderTop: '2px solid #6b7280',
  width: '75%',
  margin: '4px auto 0',
  paddingTop: '4px',
  textAlign: 'center',
};

const labelStyle = {
  fontWeight: '600',
  fontSize: '10px',
  textTransform: 'uppercase',
  textAlign: 'center',
  width: '100%',
  display: 'block',
};

const infoStyle = {
  fontSize: '10px',
  color: '#64748b',
  textAlign: 'center',
  width: '100%',
  display: 'block',
};

const signatureStyle = {
  fontFamily: "'Freestyle Script', 'Great Vibes', 'Brush Script MT', cursive",
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#475569',
  textAlign: 'center',
};

export default function SignatureFooter({
  labName,
  labEmail,
  labPosition,
  labCreatedDate,
  approverName,
  approverEmail,
  approverPosition: _approverPosition,
  approverCREA,
  approverDate,
  clientName,
  clientEmail,
  clientPosition: _clientPosition,
  clientCREA,
  clientDate,
  entityName,
  recordId,
}) {
  const isSigned = !!approverEmail;
  const verificationUrl = typeof window !== 'undefined'
    ? (entityName && recordId
      ? `${window.location.origin}/verificar-assinatura?entityName=${entityName}&recordId=${recordId}`
      : window.location.href)
    : '';

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', width: '100%', alignItems: 'end' }}>
        
        {/* Laboratorista */}
        <div style={colStyle}>
          <div style={signatureAreaStyle}>
            {labName && <span style={signatureStyle}>{labName}</span>}
            {labEmail && <span style={infoStyle}>{labEmail}</span>}
            {labCreatedDate && <span style={infoStyle}>em {formatDateBrasilia(labCreatedDate)}</span>}
          </div>
          <div style={lineStyle}>
            <span style={labelStyle}>{labPosition || 'Laboratorista'}</span>
          </div>
        </div>

        {/* Aprovador */}
        <div style={colStyle}>
          <div style={signatureAreaStyle}>
            {approverEmail ? (
              <>
                {approverName && <span style={signatureStyle}>{approverName}</span>}
                <span style={infoStyle}>{approverEmail}</span>
                {approverCREA && <span style={infoStyle}>CREA: {approverCREA}</span>}
                {approverDate && <span style={infoStyle}>em {formatDateBrasilia(approverDate)}</span>}
              </>
            ) : null}
          </div>
          <div style={lineStyle}>
            <span style={labelStyle}>Responsável</span>
          </div>
        </div>

        {/* Cliente */}
        <div style={colStyle}>
          <div style={signatureAreaStyle}>
            {clientEmail ? (
              <>
                {clientName && <span style={signatureStyle}>{clientName}</span>}
                <span style={infoStyle}>{clientEmail}</span>
                {clientCREA && <span style={infoStyle}>CREA: {clientCREA}</span>}
                {clientDate && <span style={infoStyle}>em {formatDateBrasilia(clientDate)}</span>}
              </>
            ) : null}
          </div>
          <div style={lineStyle}>
            <span style={labelStyle}>Cliente</span>
          </div>
        </div>

      </div>

      {isSigned && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #e2e8f0', width: '100%' }}>
          <ValidationQrCode url={verificationUrl} />
        </div>
      )}
    </div>
  );
}