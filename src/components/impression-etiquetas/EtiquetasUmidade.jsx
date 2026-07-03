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
        <Button onClick={onVoltar} variant="outline">
          ← Voltar
        </Button>
      </div>

      <div>
        {Array.from({ length: numPages }).map((_, pageIdx) => (
          <div key={pageIdx} className="page-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 30%)', columnGap: '5%', rowGap: '4mm' }}>
              {getEtiquetasPageUmidade(etiquetas, pageIdx).map((etiqueta, idx) => (
                <table key={idx} className="text-[8px] print:text-[7px]" style={{ tableLayout: 'fixed', width: '100%', height: '38.1mm', borderCollapse: 'collapse', borderSpacing: 0, border: '0.4mm solid #000' }}>
                  <tbody>
                    <tr>
                      <td colSpan={2} className="text-center font-semibold" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.3mm 1mm' }}>Identificação do doc. Nº</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="text-center font-bold" style={{ border: '0.4mm solid #000', padding: '0.3mm 1mm' }}>FORM 104 K</td>
                    </tr>
                    <tr>
                      <td className="text-center" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.3mm 1mm', width: '50%' }}>Emissão</td>
                      <td className="text-center" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.3mm 1mm', width: '50%' }}>Revisão</td>
                    </tr>
                    <tr>
                      <td className="text-center font-bold" style={{ border: '0.4mm solid #000', padding: '0.3mm 1mm' }}>16/09/2025</td>
                      <td className="text-center font-bold" style={{ border: '0.4mm solid #000', padding: '0.3mm 1mm' }}>00</td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '0.4mm solid #000', backgroundColor: '#BFCF99', padding: '0.3mm 1mm' }}>Furo:</td>
                      <td style={{ border: '0.4mm solid #000', padding: '0.3mm 1mm', backgroundColor: '#BFCF99' }}>{etiqueta.furo}</td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.3mm 1mm' }}>Rodovia:</td>
                      <td style={{ border: '0.4mm solid #000', padding: '0.3mm 1mm' }}>{etiqueta.rodovia}</td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.3mm 1mm' }}>Km:</td>
                      <td style={{ border: '0.4mm solid #000', padding: '0.3mm 1mm' }}>{etiqueta.km}</td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '0.4mm solid #000', backgroundColor: '#ccc', padding: '0.3mm 1mm' }}>Pista:</td>
                      <td style={{ border: '0.4mm solid #000', padding: '0.3mm 1mm' }}>{etiqueta.pista}</td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '0.4mm solid #000', backgroundColor: '#BFCF99', padding: '0.3mm 1mm' }}>Tipo:</td>
                      <td style={{ border: '0.4mm solid #000', padding: '0.3mm 1mm', backgroundColor: '#BFCF99' }}>{etiqueta.tipo_umidade}</td>
                    </tr>
                  </tbody>
                </table>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .page-container { padding: 8px; display: block !important; }
        .page-container + .page-container { page-break-before: always !important; break-before: page !important; }
        @page { size: A4; margin: 8mm 6mm; }
        @media screen { .page-container { min-height: 100vh; margin-bottom: 20px; border: 1px solid #e5e7eb; } }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; overflow: visible !important; }
          *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
          html, body, div, section, main { overflow: visible !important; -ms-overflow-style: none !important; scrollbar-width: none !important; }
          .page-container { padding: 4px; overflow: visible !important; }
          .page-container + .page-container { page-break-before: always !important; break-before: page !important; }
          .print\\:hidden { display: none !important; }
          header, nav, aside, .no-print, [data-sidebar], [data-sidebar="sidebar"], [data-sidebar="provider"] { display: none !important; }
          main { padding-left: 0 !important; margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}