// VirtualizedCardList — lista de cards virtualizada com @tanstack/react-virtual
// Renderiza apenas os cards visíveis (+ buffer) na viewport, reduzindo o DOM
// de centenas de cards para ~5-8.
//
// Usa position:absolute + transform (padrão do react-virtual para listas genéricas).
import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export default function VirtualizedCardList({
  items,            // array de registros
  estimateSize = 220, // altura estimada de cada card (px)
  overscan = 4,      // cards extra renderizados acima/abaixo da viewport
  maxHeight = "calc(100vh - 280px)", // altura máxima do container de scroll
  renderCard,        // (item, index) => ReactNode
  emptyState,        // ReactNode exibido quando items.length === 0
}) {
  const scrollRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      ref={scrollRef}
      className="overflow-auto"
      style={{ maxHeight }}
    >
      <div
        style={{
          height: totalSize,
          position: "relative",
          width: "100%",
        }}
      >
        {virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderCard(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}