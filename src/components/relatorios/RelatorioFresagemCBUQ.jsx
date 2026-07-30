import React from 'react';
import SignatureFooter from './SignatureFooter';
import FresagemCBUQFotoPages from './FresagemCBUQFotoPages';

const MIN_ROWS = 11;

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

const CELL_BORDER = '1px solid #94a3b8';
const thBase = "px-1 py-1 text-[8px] leading-tight font-bold";
const tdBase = "px-1 py-0.5 text-center text-[9px] h-5";
const thStyle = { border: CELL_BORDER, backgroundColor: '#f1f5f9' };
const tdStyle = { border: CELL_BORDER };

export default function RelatorioFresagemCBUQ({ data }) {
  if (!data) {
    return <div className="p-8">Dados do registro não encontrados.</div>;
  }

  const rows = [...data.registros];
  while (rows.length < MIN_ROWS) rows.push(null);

  return (
    <div className="bg-white font-sans">
      <style>{`
        /* Folha A4 na horizontal — a parte principal cabe em uma única página. */
        @page { size: A4 landscape; margin: 6mm; }
        @media print {
          .rfc-table { border-collapse: collapse !important; }
          .rfc-table th, .rfc-table td { border: 1px solid #94a3b8 !important; }
          .rfc-obs { border: 1px solid #94a3b8 !important; }
          .rfc-main {
            height: 189mm;
            max-height: 189mm;
            overflow: hidden;
            padding: 0 !important;
            max-width: none !important;
            page-break-after: always;
            break-after: page;
          }
          .rfc-main, .rfc-main * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div data-report-root className="rfc-main w-full max-w-[297mm] mx-auto pt-2 px-3 pb-3 print:pt-2 print:px-3 print:pb-3 flex flex-col min-h-screen print:min-h-0">
        <div className="w-full flex-1 flex flex-col">

          {/* Cabeçalho */}
          <header className="relative flex items-center justify-center p-2 min-h-[56px]" style={{ border: CELL_BORDER }}>
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <picture><source srcSet={data.logo_url} /><img src={data.logo_url} alt="Logo Regional" className="h-10 object-contain" width="auto" height="40" /></picture>
            </div>
            <h1 className="text-sm font-bold text-gray-800 uppercase text-center">Registro de Fresagem e Lançamento de CBUQ</h1>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-right">
              <p><span className="font-bold">Início:</span> {data.data_inicio}</p>
              <p><span className="font-bold">Fim:</span> {data.data_fim}</p>
            </div>
          </header>

          {/* Dados da obra */}
          <SectionBand>Dados da Obra</SectionBand>
          <div className="grid grid-cols-3 gap-x-6 gap-y-1.5 px-2 py-1" style={{ fontSize: '10px' }}>
            <Field label="CLIENTE" value={data.cliente} />
            <Field label="OBRA" value={data.obra_nome} />
            <Field label="CONTRATADA" value={data.contratada} />
            <Field label="Nº CONTRATO" value={data.numero_contrato} />
            <Field label="ESP. GRANULOMÉTRICA" value={data.especificacao_granulometrica} />
            <Field label="PROJETO" value={data.projeto} />
            <Field label="MATERIAL" value={data.material} />
            <Field label="CAMADA" value={data.camada} />
            <Field label="RODOVIA" value={data.rodovia} />
            <Field label="SENTIDO DA PISTA" value={data.sentido_pista} />
            <Field label="INSPETOR" value={data.inspetor} />
            <Field label="PERÍODO" value={`${data.data_inicio} a ${data.data_fim}`} />
          </div>

          {/* Condições do tempo */}
          <SectionBand>Condições do Tempo</SectionBand>
          <table className="rfc-table w-full" style={{ tableLayout: 'fixed', borderCollapse: 'collapse', border: CELL_BORDER }}>
            <thead>
              <tr>
                <th className={thBase} style={thStyle}>MANHÃ</th>
                <th className={thBase} style={thStyle}>TARDE</th>
                <th className={thBase} style={thStyle}>NOITE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={tdBase} style={tdStyle}>{data.condicoes_tempo.manha}</td>
                <td className={tdBase} style={tdStyle}>{data.condicoes_tempo.tarde}</td>
                <td className={tdBase} style={tdStyle}>{data.condicoes_tempo.noite}</td>
              </tr>
            </tbody>
          </table>

          {/* Fresagem e recomposição */}
          <SectionBand>Localização / Fresagem e Recomposição</SectionBand>
          <table className="rfc-table w-full" style={{ tableLayout: 'fixed', borderCollapse: 'collapse', border: CELL_BORDER }}>
            <thead>
              <tr>
                <th className={thBase} style={thStyle} colSpan={3}>LOCALIZAÇÃO</th>
                <th className={thBase} style={thStyle} colSpan={3}>FRESAGEM E RECOMPOSIÇÃO</th>
                <th className={thBase} style={thStyle} colSpan={4}>PINTURA HORIZONTAL</th>
                <th className={thBase} style={thStyle} colSpan={4}>TACHA REFLETIVA</th>
                <th className={thBase} style={thStyle} rowSpan={2}>DRENO (M)</th>
              </tr>
              <tr>
                <th className={thBase} style={thStyle}>{data.tipo_localizacao} INICIAL</th>
                <th className={thBase} style={thStyle}>{data.tipo_localizacao} FINAL</th>
                <th className={thBase} style={thStyle}>FAIXA</th>
                <th className={thBase} style={thStyle}>LARGURA (m)</th>
                <th className={thBase} style={thStyle}>EXTENSÃO (m)</th>
                <th className={thBase} style={thStyle}>ESPESSURA (m)</th>
                <th className={thBase} style={thStyle}>BD/BE (mts lineares)</th>
                <th className={thBase} style={thStyle}>4x12 (qtde bastões)</th>
                <th className={thBase} style={thStyle}>2x2 (qtde bastões)</th>
                <th className={thBase} style={thStyle}>Zebrado (mts lineares)</th>
                <th className={thBase} style={thStyle}>BD/BE (unid.)</th>
                <th className={thBase} style={thStyle}>4x12 (unid.)</th>
                <th className={thBase} style={thStyle}>2x2 (unid.)</th>
                <th className={thBase} style={thStyle}>Zebrado (unid.)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((linha, index) => (
                <tr key={index}>
                  <td className={tdBase} style={tdStyle}>{linha?.localizacao_inicial}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.localizacao_final}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.faixa}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.largura_m}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.extensao_m}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.espessura_m}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.pintura_bd_be_mts}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.pintura_4x12_qtde}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.pintura_2x2_qtde}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.pintura_zebrado_mts}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.tacha_bd_be_unid}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.tacha_4x12_unid}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.tacha_2x2_unid}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.tacha_zebrado_unid}</td>
                  <td className={tdBase} style={tdStyle}>{linha?.dreno_m}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.observacoes && data.observacoes !== '—' && (
            <div className="mt-2 break-inside-avoid">
              <SectionBand>Observações</SectionBand>
              <div className="rfc-obs p-2 min-h-[40px] text-[10px] leading-tight" style={{ border: CELL_BORDER }}>
                {data.observacoes}
              </div>
            </div>
          )}

          {/* Assinaturas: Inspetor / Responsável / Cliente */}
          <div className="mt-auto pt-3 break-inside-avoid">
            <SignatureFooter {...data.signatureProps} />
          </div>

        </div>
      </div>

      <FresagemCBUQFotoPages data={data} />
    </div>
  );
}