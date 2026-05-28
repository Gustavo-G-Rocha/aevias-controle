import React from 'react';

/**
 * Wrapper para página padrão de relatório (print-safe)
 */
export default function PageContainer({
  children,
  pageNumber,
  totalPages,
  headerContent,
  footerContent,
  breakBefore = false,
  className = '',
}) {
  return (
    <div className={`p-8 print:p-8 flex flex-col page-container min-h-screen ${breakBefore ? 'break-before-page' : ''}`}>
      <div className="w-full max-w-[190mm] mx-auto flex-grow flex flex-col">
        {headerContent}
        <main className={`flex-grow ${className}`}>
          {children}
        </main>
        {footerContent}
        <footer className="mt-auto pt-2 text-center text-sm print:text-xs text-gray-400">
          Página {pageNumber} de {totalPages}
        </footer>
      </div>
    </div>
  );
}