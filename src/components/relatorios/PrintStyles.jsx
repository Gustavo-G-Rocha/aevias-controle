/**
 * Bloco centralizado de estilos CSS para impressão de relatórios.
 * Usado em todos os relatórios para garantir comportamento uniforme no print.
 */
export default function PrintStyles() {
  return (
    <style>{`
      @media print {
        @page {
          size: A4 portrait;
          margin: 0;
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
          margin: 0 !important;
          padding: 0 !important;
        }
        aside, nav, [data-sidebar], [role="navigation"], .no-print {
          display: none !important;
        }
        header {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        ::-webkit-scrollbar { display: none !important; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }

        /* Evitar página em branco no final do PDF */
        .report-scope, [data-print-container] {
          min-height: 0 !important;
          height: auto !important;
          overflow: visible !important;
        }
        html, body, #root {
          height: auto !important;
          overflow: visible !important;
        }
        .min-h-screen {
          min-height: 0 !important;
        }
      }
    `}</style>
  );
}