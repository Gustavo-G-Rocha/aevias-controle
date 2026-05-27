import React from 'react';

export default function RelatorioChecklistAplicacaoContainer({ children }) {
  return (
    <div className="report-content-container w-full bg-white print:bg-white">
      {children}
      <style>{`
        @media screen {
          .report-content-container {
            max-width: 210mm;
            margin: 0 auto;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
        }
        
        @media print {
          * { box-sizing: border-box; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          /* Esconder botões e elementos de navegação */
          .no-print, 
          .no-print * { 
            display: none !important; 
            visibility: hidden !important;
          }
          
          /* Remover scrollbars */
          ::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          
          * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          
          .report-content-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            display: block !important;
            visibility: visible !important;
          }
          
          .break-before-page { page-break-before: always; break-before: page; }
          .break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}