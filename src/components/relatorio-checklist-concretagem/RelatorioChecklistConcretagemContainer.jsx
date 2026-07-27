import React from 'react';

export default function RelatorioChecklistConcretagemContainer({ children }) {
  return (
    <div className="report-content-container w-full bg-white min-h-screen print:bg-white">
      {children}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.25mm 1.75mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          aside, nav, [data-sidebar], [role="navigation"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}