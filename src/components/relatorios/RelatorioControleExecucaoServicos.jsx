import React from 'react';
import SignatureFooter from './SignatureFooter';
import ControleExecucaoServicosFotoPages from './ControleExecucaoServicosFotoPages';

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
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', lineHeight: '1.4' }}>
    <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', paddingBottom: '2px' }}>{label}:</span>
    <span style={{ flex: 1, borderBottom: '1px solid #94a3b8', paddingBottom: '2px', minWidth: 0 }}>{value}</span>
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
      {/* Mesma margem interna das páginas de fotos (pt-2 px-3 pb-3, mantida no print) */}
      <div data-report-root className="w-full max-w-[210mm] mx-auto pt-2 px-3 pb-3 print:pt-2 print:px-3 print:pb-3 flex flex-col min-h-screen">
        <div className="w-full flex-1 flex flex-col">

          {/* Cabeçalho */}
          <header className="relative flex items-center justify-center p-2 min-h-[56px]" style={{ border: '1px solid #94a3b8' }}>
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <picture><source srcSet={data.logo_url} /><img src={data.logo_url} alt="Logo Regional" className="h-10 object-contain" width="auto" height="40" /></picture>
            </div>
            <h1 className="text-sm font-bold text-gray-800 uppercase text-center">Controle de Execução de Serviços</h1>
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

      {/* Relatório Fotográfico — 6 fotos por folha (3x2) */}
      <ControleExecucaoServicosFotoPages data={data} />
    </div>
  );
}