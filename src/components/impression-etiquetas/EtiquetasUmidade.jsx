import React from 'react';
import { Button } from '@/components/ui/button';
import { calcularPaginasUmidade, getEtiquetasPageUmidade } from '@/utils/impressionEtiquetasUtils';

export default function EtiquetasUmidade({ etiquetas, onPrint, onVoltar }) {
  const numPages = calcularPaginasUmidade(etiquetas.length);

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
            <div className="grid grid-cols-4 gap-2">
              {getEtiquetasPageUmidade(etiquetas, pageIdx).map((etiqueta, idx) => (
                <div key={idx} style={{ border: '0.5mm solid #aaa', fontSize: '11px' }}>
                  <div style={{ background: '#BFCF99', borderBottom: '0.5mm solid #aaa', padding: '6px 8px', textAlign: 'center', fontStyle: 'italic', fontWeight: 'bold', color: '#00233B' }}>
                    {etiqueta.furo}
                  </div>
                  <div style={{ borderBottom: '0.5mm solid #aaa', padding: '6px 8px', textAlign: 'center', fontStyle: 'italic', background: '#fff', color: '#00233B' }}>
                    {etiqueta.rodovia}
                  </div>
                  <div style={{ borderBottom: '0.5mm solid #aaa', padding: '6px 8px', textAlign: 'center', fontStyle: 'italic', background: '#fff', color: '#00233B' }}>
                    {etiqueta.km}
                  </div>
                  <div style={{ borderBottom: '0.5mm solid #aaa', padding: '6px 8px', textAlign: 'center', fontStyle: 'italic', background: '#fff', color: '#00233B' }}>
                    {etiqueta.pista}
                  </div>
                  <div style={{ background: '#BFCF99', padding: '6px 8px', textAlign: 'center', fontStyle: 'italic', fontWeight: 'bold', color: '#00233B' }}>
                    {etiqueta.tipo_umidade}
                  </div>
                </div>
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