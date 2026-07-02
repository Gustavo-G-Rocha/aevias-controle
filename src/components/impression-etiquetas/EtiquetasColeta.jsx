import React from 'react';
import { Button } from '@/components/ui/button';
import { calcularPaginasColeta, getEtiquetasPageColeta } from '@/utils/impressionEtiquetasUtils';

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a7599ee3fb9205cfb852ec/47ee9630a_AE-LogoVerPrincipal_1.png';

const CELL_STYLES = {
  label: { border: '0.5mm solid #000', height: '28px', paddingLeft: '4mm', paddingRight: '2mm', paddingTop: '1.5mm', paddingBottom: '1.5mm', fontWeight: 'bold', backgroundColor: '#fff' },
  value: { border: '0.5mm solid #000', height: '28px', paddingLeft: '4mm', paddingRight: '2mm', paddingTop: '1.5mm', paddingBottom: '1.5mm', backgroundColor: '#fff' },
  highlight: { border: '0.5mm solid #000', height: '28px', backgroundColor: '#C4D69B', paddingLeft: '4mm', paddingRight: '2mm', paddingTop: '1.5mm', paddingBottom: '1.5mm' },
};

export default function EtiquetasColeta({ etiquetas, onPrint, onVoltar }) {
  const numPages = calcularPaginasColeta(etiquetas.length);

  return (
    <div className="bg-white min-h-screen p-4 print:p-0">
      <div className="mb-4 print:hidden flex gap-2 sticky top-0 bg-white z-10 py-2">
        <Button onClick={onPrint}>
          🖨️ Imprimir
        </Button>
        <Button onClick={onVoltar} variant="outline">
          ← Voltar
        </Button>
      </div>

      <div>
        {Array.from({ length: numPages }).map((_, pageIdx) => (
          <div key={pageIdx} className="page-container">
            <div className="grid grid-cols-2 gap-x-2 gap-y-4 print:gap-x-1.5 print:gap-y-3">
              {getEtiquetasPageColeta(etiquetas, pageIdx).map((etiqueta, idx) => (
                <EtiquetaColetaItem key={pageIdx * 6 + idx} etiqueta={etiqueta} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .page-container { padding: 8px; page-break-after: always !important; break-after: page !important; display: block !important; }
        .page-container:last-child { page-break-after: auto !important; break-after: auto !important; }
        @page { size: A4; margin: 6mm 3mm; }
        @media screen { .page-container { min-height: 100vh; margin-bottom: 20px; border: 1px solid #e5e7eb; } }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; overflow: visible !important; }
          *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
          html, body, div, section, main { overflow: visible !important; -ms-overflow-style: none !important; scrollbar-width: none !important; }
          .page-container { padding: 4px; page-break-after: always !important; overflow: visible !important; }
          .page-container:last-child { page-break-after: auto !important; }
          .print\\:hidden { display: none !important; }
          header, nav, .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function EtiquetaColetaItem({ etiqueta }) {
  return (
    <div className="p-4 print:p-5 bg-white" style={{ border: '0.5mm solid #000' }}>
      {/* Header */}
      <div className="grid grid-cols-[100px_1fr_120px] gap-0 mb-2 print:mb-2 pb-2 print:pb-1.5" style={{ borderBottom: '0.5mm solid #000', alignItems: 'stretch' }}>
        <div className="flex items-center justify-center pr-2" style={{ borderRight: '0.5mm solid #000' }}>
          <picture>
            <source srcSet={LOGO_URL} />
            <img src={LOGO_URL} alt="AfirmaEvias" className="h-9 print:h-8 w-auto object-contain" width="auto" height="36" />
          </picture>
        </div>
        <div className="flex items-center justify-center px-2" style={{ borderRight: '0.5mm solid #000' }}>
          <h2 className="text-sm print:text-xs font-bold text-[#00233B] text-center leading-tight">
            ETIQUETA PARA COLETA DE AMOSTRA SOLO
          </h2>
        </div>
        <div className="flex items-stretch">
          <table className="w-full text-[8px] print:text-[7px]" style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>
            <tbody>
              <tr>
                <td colSpan={2} className="text-center font-semibold" style={{ border: '0.4mm solid #000', backgroundColor: '#f0f0f0', padding: '0.5mm 1.5mm' }}>Identificação do Doc nº</td>
              </tr>
              <tr>
                <td colSpan={2} className="text-center font-bold" style={{ border: '0.4mm solid #000', padding: '0.5mm 1.5mm' }}>FORM 060</td>
              </tr>
              <tr>
                <td className="text-center" style={{ border: '0.4mm solid #000', backgroundColor: '#f0f0f0', padding: '0.5mm 1.5mm', width: '50%' }}>Emissão</td>
                <td className="text-center" style={{ border: '0.4mm solid #000', backgroundColor: '#f0f0f0', padding: '0.5mm 1.5mm', width: '50%' }}>Revisão</td>
              </tr>
              <tr>
                <td className="text-center font-bold" style={{ border: '0.4mm solid #000', padding: '0.5mm 1.5mm' }}>20/01/2025</td>
                <td className="text-center font-bold" style={{ border: '0.4mm solid #000', padding: '0.5mm 1.5mm' }}>01</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Dados Principais */}
      <table className="w-full mb-2 print:mb-2 text-xs print:text-[10px]" style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>
        <colgroup>
          <col style={{ width: '30%' }} />
          <col style={{ width: '70%' }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={CELL_STYLES.label}>RODOVIA:</td>
            <td style={CELL_STYLES.value}>{etiqueta.rodovia}</td>
          </tr>
          <tr>
            <td style={CELL_STYLES.label}>KM:</td>
            <td style={CELL_STYLES.value}>{etiqueta.km}</td>
          </tr>
          <tr>
            <td className="text-base print:text-sm" style={CELL_STYLES.highlight}>FURO:</td>
            <td className="font-bold text-base print:text-sm" style={CELL_STYLES.highlight}>{etiqueta.furo}</td>
          </tr>
          <tr>
            <td style={CELL_STYLES.label}>PISTA:</td>
            <td style={CELL_STYLES.value}>{etiqueta.pista}</td>
          </tr>
          <tr>
            <td style={CELL_STYLES.label}>AMOSTRA:</td>
            <td style={CELL_STYLES.value}>{etiqueta.amostra}</td>
          </tr>
          <tr>
            <td style={CELL_STYLES.label}>PROFUNDIDADE:</td>
            <td style={CELL_STYLES.value}>{etiqueta.profundidade}</td>
          </tr>
          <tr>
            <td style={CELL_STYLES.label}>MATERIAL:</td>
            <td style={CELL_STYLES.value}>{etiqueta.material}</td>
          </tr>
        </tbody>
      </table>

      {/* Ensaios Solicitados */}
      <div className="mb-2 print:mb-1.5" style={{ border: '0.5mm solid #000' }}>
        <div className="bg-[#BFCF99] font-bold text-[#00233B] text-xs print:text-[10px] text-center" style={{ borderBottom: '0.5mm solid #000', paddingLeft: '4mm', paddingRight: '4mm', paddingTop: '1.5mm', paddingBottom: '1.5mm' }}>
          ENSAIOS SOLICITADOS
        </div>
        <div className="bg-white text-xs print:text-[10px] min-h-[18px] print:min-h-[16px] flex items-center gap-1.5" style={{ paddingLeft: '4mm', paddingRight: '4mm', paddingTop: '2mm', paddingBottom: '2mm' }}>
          {etiqueta.ensaios && etiqueta.ensaios.length > 0 ? (
            <>
              <span className="font-bold text-sm">✓</span>
              <span className="flex-1">{etiqueta.ensaios.join(', ')}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Rodapé */}
      <div className="bg-white text-xs print:text-[10px]" style={{ border: '0.5mm solid #000' }}>
        <div className="font-bold" style={{ height: '32px', display: 'flex', alignItems: 'center', paddingLeft: '4mm', paddingRight: '4mm' }}>RESPONSÁVEL COLETA:</div>
        <div className="font-bold" style={{ height: '32px', display: 'flex', alignItems: 'center', paddingLeft: '4mm', paddingRight: '4mm' }}>DATA:</div>
      </div>
    </div>
  );
}