import React from 'react';
import SignatureFooter from './SignatureFooter';

const MIN_ROWS = 15;

const SectionBand = ({ children }) => (
  <h2
    className="text-[10px] font-bold text-center p-0.5 my-1 uppercase tracking-wider"
    style={{ backgroundColor: '#BFCF99', color: '#00233B', border: '1px solid #94a3b8' }}
  >
    {children}
  </h2>
);

const Field = ({ label, value }) => (
  <div className="flex items-baseline gap-1">
    <span className="font-bold whitespace-nowrap">{label}:</span>
    <span className="flex-1" style={{ borderBottom: '1px solid #94a3b8' }}>{value}</span>
  </div>
);

// Borda aplicada via inline style em cada célula — sobrevive ao rasterizador
// de impressão (classes Tailwind podem ser descartadas no print).
const CELL_BORDER = '1px solid #94a3b8';
const thBase = "px-1 py-1 text-[8px] leading-tight font-bold";
const tdBase = "px-1 py-1 text-center text-[9px] h-6";
const thStyle = { border: CELL_BORDER, backgroundColor: '#f1f5f9' };
const tdStyle = { border: CELL_BORDER };

export default function RelatorioControleExecucaoServicos({ data }) {
  if (!data) {
    return <div className="p-8">Dados do controle não encontrados.</div>;
  }

  const rows = [...data.servicos];
  while (rows.length < MIN_ROWS) rows.push(null);

  return (
    <div className="bg-white font-sans">
      <style>{`
        @media print {
          .ces-table { border-collapse: collapse !important; }
          .ces-table th, .ces-table td {
            border: 1px solid #94a3b8 !important;
          }
          .ces-obs { border: 1px solid #94a3b8 !important; }
        }
      `}</style>
      <div data-report-root className="p-6 print:p-0 flex flex-col min-h-screen">
        <div className="w-full flex-1 flex flex-col">

          {/* Cabeçalho */}
          <header className="grid grid-cols-3 items-center p-2" style={{ border: '1px solid #94a3b8' }}>
            <div className="flex justify-start">
              <picture><source srcSet={data.logo_url} /><img src={data.logo_url} alt="Logo Regional" className="h-10 object-contain" width="auto" height="40" /></picture>
            </div>
            <div className="text-center col-span-2 pr-24">
              <h1 className="text-sm font-bold text-gray-800 uppercase">Controle de Execução de Serviços</h1>
            </div>
          </header>

          {/* Dados da obra */}
          <SectionBand>Dados da Obra</SectionBand>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 px-2 py-1" style={{ fontSize: '10px' }}>
            <Field label="CLIENTE" value={data.cliente} />
            <Field label="OBRA" value={data.obra_nome} />
            <Field label="RODOVIA" value={data.rodovia} />
            <Field label="TRECHO" value={data.trecho} />
            <Field label="INSPETOR" value={data.inspetor} />
            <Field label="DATA" value={data.data} />
          </div>

          {/* Serviços realizados */}
          <SectionBand>Serviços Realizados</SectionBand>
          <table className="ces-table w-full" style={{ tableLayout: 'fixed', borderCollapse: 'collapse', border: CELL_BORDER }}>
            <thead>
              <tr>
                <th className={thBase} style={{ ...thStyle, width: '30%' }}>SERVIÇOS</th>
                <th className={thBase} style={{ ...thStyle, width: '8%' }}>ESTACA INICIAL</th>
                <th className={thBase} style={{ ...thStyle, width: '8%' }}>ESTACA FINAL</th>
                <th className={thBase} style={{ ...thStyle, width: '9%' }}>COMPRIMENTO (m)</th>
                <th className={thBase} style={{ ...thStyle, width: '8%' }}>ESPESSURA (cm)</th>
                <th className={thBase} style={{ ...thStyle, width: '8%' }}>LARGURA (m)</th>
                <th className={thBase} style={{ ...thStyle, width: '9%' }}>QUANTIDADE</th>
                <th className={thBase} style={{ ...thStyle, width: '20%' }}>EXECUTORA</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((servico, index) => (
                <tr key={index}>
                  <td className={`${tdBase} text-left`} style={tdStyle}>{servico?.servico}</td>
                  <td className={tdBase} style={tdStyle}>{servico?.estaca_inicial}</td>
                  <td className={tdBase} style={tdStyle}>{servico?.estaca_final}</td>
                  <td className={tdBase} style={tdStyle}>{servico?.comprimento_m}</td>
                  <td className={tdBase} style={tdStyle}>{servico?.espessura_cm}</td>
                  <td className={tdBase} style={tdStyle}>{servico?.largura_m}</td>
                  <td className={tdBase} style={tdStyle}>{servico?.quantidade}</td>
                  <td className={tdBase} style={tdStyle}>{servico?.executora}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.observacoes_gerais && data.observacoes_gerais !== '—' && (
            <div className="mt-2 break-inside-avoid">
              <SectionBand>Observações</SectionBand>
              <div className="ces-obs p-2 min-h-[40px] text-[10px] leading-tight" style={{ border: CELL_BORDER }}>
                {data.observacoes_gerais}
              </div>
            </div>
          )}

          {/* Assinaturas: Inspetor / Responsável / Cliente */}
          <div className="mt-auto pt-3 break-inside-avoid">
            <SignatureFooter {...data.signatureProps} />
          </div>

        </div>
      </div>
    </div>
  );
}