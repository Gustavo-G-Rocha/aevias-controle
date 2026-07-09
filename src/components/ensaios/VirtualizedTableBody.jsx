// VirtualizedTableBody — corpo de tabela virtualizado com @tanstack/react-virtual
// Renderiza apenas as linhas visíveis (+ buffer de overscan) na viewport,
// reduzindo o DOM de centenas de linhas para ~10-15.
//
// Usa "spacer rows" (padding top/bottom via <tr> com altura fixa) em vez de
// position:absolute, preservando a semântica de <table> e o layout de colunas.
// O <thead> fica sticky no topo do container de scroll.
import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export default function VirtualizedTableBody({
  items,           // array de registros já filtrados/paginados
  rowHeight = 52,  // altura estimada de cada linha (px)
  overscan = 6,    // linhas extra renderizadas acima/abaixo da viewport
  colCount = 9,    // número de colunas (para o spacer <td colSpan>)
  maxHeight = "calc(100vh - 280px)", // altura máxima do container de scroll
  renderRow,       // (item, index) => <tr>...</tr>
  emptyState,      // ReactNode exibido quando items.length === 0
  children,        // <thead> (cabeçalho da tabela)
}) {
  const scrollRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan,
    measureElement: undefined, // altura fixa — sem medição dinâmica (mais performático)
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - virtualItems[virtualItems.length - 1].end
      : 0;

  if (items.length === 0 && emptyState) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {children}
        </table>
        {emptyState}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="overflow-auto [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10"
      style={{ maxHeight }}
    >
      <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        {children}
        <tbody>
          {paddingTop > 0 && (
            <tr style={{ height: paddingTop }} aria-hidden="true">
              <td colSpan={colCount} style={{ padding: 0, border: "none", background: "transparent" }} />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const item = items[virtualRow.index];
            return renderRow(item, virtualRow.index);
          })}
          {paddingBottom > 0 && (
            <tr style={{ height: paddingBottom }} aria-hidden="true">
              <td colSpan={colCount} style={{ padding: 0, border: "none", background: "transparent" }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}