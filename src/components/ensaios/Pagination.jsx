import React from "react";
import { Button } from "@/components/ui/button";

export const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 mt-4" aria-label="Paginação">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className="text-foreground border-white/20 hover:bg-black/10"
      >
        Anterior
      </Button>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Show first page, last page, current page, and pages around current
          const showPage = page === 1 || 
                           page === totalPages || 
                           (page >= currentPage - 1 && page <= currentPage + 1);
          
          if (!showPage && page === currentPage - 2) {
            return <span key={page} className="px-2 text-foreground/50">...</span>;
          }
          if (!showPage && page === currentPage + 2) {
            return <span key={page} className="px-2 text-foreground/50">...</span>;
          }
          if (!showPage) return null;

          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? "page" : undefined}
              aria-label={`Página ${page}`}
              className={currentPage === page ? "bg-muted text-white" : "text-foreground border-white/20 hover:bg-black/10"}
            >
              {page}
            </Button>
          );
        })}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
        className="text-foreground border-white/20 hover:bg-black/10"
      >
        Próxima
      </Button>
    </nav>
  );
});

Pagination.displayName = 'Pagination';