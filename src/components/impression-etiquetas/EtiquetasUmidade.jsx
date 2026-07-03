import React from 'react';
import { Button } from '@/components/ui/button';
import { calcularPaginasUmidade, getEtiquetasPageUmidade } from '@/utils/impressionEtiquetasUtils';

export default function EtiquetasUmidade({ etiquetas, onPrint, onVoltar }) {
  const numPages = calcularPaginasUmidade(etiquetas.length);

  return (
    <div className="bg-white min-h-screen p-4 print:p-0 print:min-h-0">
      <div className="mb-4 print:hidden flex gap-2 sticky top-0 bg-white z-10 py-2">
        <Button onClick={onPrint}>
          🖨️ Imprimir
        </Button>
        <Button onClick={onVoltar} variant="outline" className="!bg-white !text-foreground hover:!bg-accent hover:!text-accent-foreground">
          ← Voltar
        </Button>
      </div>

      <div>
        {Array.from({ length: numPages }).map((_, pageIdx) =>
        <div key={pageIdx} className="page-container">
            <div className="umidade-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 63.5mm)', gridTemplateRows: 'repeat(7, 38.1mm)', columnGap: '2.8mm', rowGap: '0.08mm' }}>
              {getEtiquetasPageUmidade(etiquetas, pageIdx).map((etiqueta, idx) =>
            <table key={idx} className="umidade-label text-[13px] print:text-[10px] font-bold" style={{ tableLayout: 'fixed', width: '100%', height: '100%', lineHeight: '1', borderCollapse: 'collapse', borderSpacing: 0, border: '0.4mm solid #000' }}>
                  <tbody>
                    <tr>
                      <td colSpan={2} className="text-center font-semibold" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.1mm 1mm' }}>Identificação do doc. Nº</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="text-center font-bold" style={{ border: '0.4mm solid #000', padding: '0.1mm 1mm' }}>FORM 104 K</td>
                    </tr>
                    <tr>
                      <td className="text-center" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.1mm 1mm', width: '50%' }}>Emissão</td>
                      <td className="text-center" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.1mm 1mm', width: '50%' }}>Revisão</td>
                    </tr>
                    <tr>
                      <td className="text-center font-bold" style={{ border: '0.4mm solid #000', padding: '0.1mm 1mm' }}>16/09/2025</td>
                      <td className="text-center font-bold" style={{ border: '0.4mm solid #000', padding: '0.1mm 1mm' }}>00</td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '0.4mm solid #000', backgroundColor: '#BFCF99', padding: '0.1mm 1mm' }}>Furo:</td>
                      <td className="font-bold" style={{ border: '0.4mm solid #000', padding: '0.1mm 1mm', backgroundColor: '#BFCF99' }}>{etiqueta.furo}</td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.1mm 1mm' }}>Rodovia:</td>
                      <td style={{ border: '0.4mm solid #000', padding: '0.1mm 1mm' }}>{etiqueta.rodovia}</td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.1mm 1mm' }}>Km:</td>
                      <td style={{ border: '0.4mm solid #000', padding: '0.1mm 1mm' }}>{etiqueta.km}</td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.1mm 1mm' }}>Pista:</td>
                      <td style={{ border: '0.4mm solid #000', padding: '0.1mm 1mm' }}>{etiqueta.pista}</td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '0.4mm solid #000', backgroundColor: '#BFCF99', padding: '0.1mm 1mm' }}>Tipo:</td>
                      <td style={{ border: '0.4mm solid #000', padding: '0.1mm 1mm', backgroundColor: '#BFCF99' }}>{etiqueta.tipo_umidade}</td>
                    </tr>
                  </tbody>
                </table>
            )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .page-container { padding: 14.4mm 6.95mm 15.4mm 6.95mm; display: block !important; box-sizing: border-box; }
        .page-container + .page-container { page-break-before: always !important; break-before: page !important; }
        @page { size: A4; margin: 0 !important; }
        @media screen { .page-container { min-height: 100vh; margin-bottom: 20px; border: 1px solid #e5e7eb; } .umidade-grid { grid-template-columns: repeat(3, 1fr) !important; grid-template-rows: repeat(7, auto) !important; } }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; overflow: visible !important; }
          *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
          html, body, div, section, main { overflow: visible !important; -ms-overflow-style: none !important; scrollbar-width: none !important; }
          .page-container { width: 210mm !important; height: 297mm !important; overflow: hidden !important; }
          .page-container + .page-container { page-break-before: always !important; break-before: page !important; }
          .print\\:hidden { display: none !important; }
          header, nav, aside, .no-print, [data-sidebar], [data-sidebar="sidebar"], [data-sidebar="provider"] { display: none !important; }
          main { padding-left: 0 !important; margin-left: 0 !important; }
        }
      `}</style>
    </div>);

}