import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { calcularPaginasColeta, getEtiquetasPageColeta } from '@/utils/impressionEtiquetasUtils';

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a7599ee3fb9205cfb852ec/47ee9630a_AE-LogoVerPrincipal_1.png';

const CELL_STYLES = {
  label: { border: '0.5mm solid #000', height: '20px', paddingLeft: '4mm', paddingRight: '2mm', paddingTop: '1mm', paddingBottom: '1mm', fontWeight: 'bold', backgroundColor: '#fff' },
  value: { border: '0.5mm solid #000', height: '20px', paddingLeft: '4mm', paddingRight: '2mm', paddingTop: '1mm', paddingBottom: '1mm', backgroundColor: '#fff' },
  highlight: { border: '0.5mm solid #000', height: '20px', backgroundColor: '#C4D69B', paddingLeft: '4mm', paddingRight: '2mm', paddingTop: '1mm', paddingBottom: '1mm' }
};

export default function EtiquetasColeta({ etiquetas, onPrint, onVoltar }) {
  const numPages = calcularPaginasColeta(etiquetas.length);

  // Renderizado direto no <body> (fora do shell do app): sem sidebar, sem
  // ancestrais com overflow/transform que quebravam a paginação na impressão.
  return createPortal(
    <div className="etiquetas-print-root fixed inset-0 z-50 overflow-auto bg-white p-4">
      <div className="mb-4 print:hidden flex gap-2 sticky top-0 bg-white z-10 py-2">
        <Button onClick={onPrint}>
          🖨️ Imprimir
        </Button>
        <Button onClick={onVoltar} variant="outline" className="!text-foreground !bg-white hover:!bg-accent hover:!text-accent-foreground">
          ← Voltar
        </Button>
      </div>

      <div>
        {Array.from({ length: numPages }).map((_, pageIdx) =>
        <div key={pageIdx} className="page-container">
            <div className="etiquetas-grid grid grid-cols-2 gap-x-2 gap-y-4 print:gap-x-1.5 print:gap-y-2">
              {getEtiquetasPageColeta(etiquetas, pageIdx).map((etiqueta, idx) =>
            <EtiquetaColetaItem key={pageIdx * 6 + idx} etiqueta={etiqueta} />
            )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .page-container { padding: 8px; display: block !important; }
        .page-container + .page-container { page-break-before: always !important; break-before: page !important; }
        @page { size: A4 portrait; margin: 6mm; }
        @media screen { .page-container { min-height: 100vh; margin-bottom: 20px; border: 1px solid #e5e7eb; } }
        @media print {
          /* O container das etiquetas é filho direto do <body> (portal), então
             basta esconder os irmãos: sidebar, header e bottom-nav do app
             desaparecem por completo, sem deixar espaço em branco. */
          body > *:not(.etiquetas-print-root) { display: none !important; }
          .etiquetas-print-root {
            position: static !important;
            inset: auto !important;
            z-index: auto !important;
            overflow: visible !important;
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important; padding: 0 !important;
            background: #fff !important;
          }
          .etiquetas-print-root .print\\:hidden { display: none !important; }

          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
          html, body { overflow: visible !important; margin: 0 !important; padding: 0 !important; -ms-overflow-style: none !important; scrollbar-width: none !important; }
          .min-h-screen { min-height: 0 !important; }

          /* 6 etiquetas por folha: 2 colunas x 3 linhas, ocupando toda a
             largura útil da A4 (198mm) e caindo dentro dos 285mm de altura. */
          .page-container { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: none !important; overflow: hidden !important; }
          .etiquetas-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            grid-template-rows: repeat(3, 89mm) !important;
            gap: 1.5mm 2mm !important;
            width: 100% !important;
            height: 270mm !important;
          }
          .etiquetas-grid > * {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            height: 100% !important;
            padding: 2mm !important;
          }
          /* Compacta as células: o conteúdo natural mede ~100mm, o que estourava
             a linha de 92mm e cortava a última fileira. */
          .etiquetas-grid td { height: 15px !important; padding-top: 0.3mm !important; padding-bottom: 0.3mm !important; }
          .etiquetas-grid .etiqueta-footer-row { height: 19px !important; }
          .page-container + .page-container { page-break-before: always !important; break-before: page !important; }
        }
      `}</style>
    </div>,
    document.body);

}

function EtiquetaColetaItem({ etiqueta }) {
  return (
    <div className="p-3 print:p-3 bg-white" style={{ border: '0.5mm solid #000' }}>
      {/* Header */}
      <div className="grid grid-cols-[90px_1fr_95px] gap-0 mb-1 print:mb-1 pb-1 print:pb-1" style={{ borderBottom: '0.5mm solid #000', alignItems: 'stretch' }}>
        <div className="flex items-center justify-center" style={{ borderRight: '0.5mm solid #000' }}>
          <picture>
            <source srcSet={LOGO_URL} />
            <img src={LOGO_URL} alt="AfirmaEvias" className="h-12 print:h-9 w-auto object-contain" width="auto" height="48" />
          </picture>
        </div>
        <div className="flex items-center justify-center px-1" style={{ borderRight: '0.5mm solid #000' }}>
          <h2 className="text-xs print:text-[10px] font-bold text-[var(--color-primary)] text-center leading-tight">
            ETIQUETA PARA COLETA DE AMOSTRA SOLO
          </h2>
        </div>
        <div className="flex items-stretch">
          <table className="w-full text-[7px] print:text-[6px]" style={{ borderCollapse: 'collapse', borderSpacing: 0 }}>
            <tbody>
              <tr>
                <td colSpan={2} className="text-center font-semibold" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.2mm 1mm' }}>Identificação do Doc nº</td>
              </tr>
              <tr>
                <td colSpan={2} className="text-center font-bold" style={{ border: '0.4mm solid #000', padding: '0.2mm 1mm' }}>FORM 060</td>
              </tr>
              <tr>
                <td className="text-center" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.2mm 1mm', width: '50%' }}>Emissão</td>
                <td className="text-center" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.2mm 1mm', width: '50%' }}>Revisão</td>
              </tr>
              <tr>
                <td className="text-center font-bold" style={{ border: '0.4mm solid #000', padding: '0.2mm 1mm' }}>20/01/2025</td>
                <td className="text-center font-bold" style={{ border: '0.4mm solid #000', padding: '0.2mm 1mm' }}>01</td>
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
      <div className="mb-1 print:mb-1" style={{ border: '0.5mm solid #000' }}>
        <div className="bg-[var(--color-secondary)] font-bold text-[var(--color-primary)] text-[10px] print:text-[9px] text-center" style={{ borderBottom: '0.5mm solid #000', paddingLeft: '3mm', paddingRight: '3mm', paddingTop: '1mm', paddingBottom: '1mm' }}>
          ENSAIOS SOLICITADOS
        </div>
        <div className="bg-white text-[10px] print:text-[9px] min-h-[14px] print:min-h-[12px] flex items-center gap-1.5" style={{ paddingLeft: '3mm', paddingRight: '3mm', paddingTop: '1mm', paddingBottom: '1mm' }}>
          {etiqueta.ensaios && etiqueta.ensaios.length > 0 ?
          <>
              <span className="font-bold text-xs">✓</span>
              <span className="flex-1">{etiqueta.ensaios.join(', ')}</span>
            </> :
          null}
        </div>
      </div>

      {/* Rodapé */}
      <div className="bg-white text-xs print:text-[10px]" style={{ border: '0.5mm solid #000' }}>
        <div className="etiqueta-footer-row font-bold" style={{ height: '24px', display: 'flex', alignItems: 'center', paddingLeft: '4mm', paddingRight: '4mm' }}>RESPONSÁVEL COLETA:</div>
        <div className="etiqueta-footer-row font-bold" style={{ height: '24px', display: 'flex', alignItems: 'center', paddingLeft: '4mm', paddingRight: '4mm' }}>DATA:</div>
      </div>
    </div>);

}