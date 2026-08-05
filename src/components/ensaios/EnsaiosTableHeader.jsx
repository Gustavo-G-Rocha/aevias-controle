// Cabeçalho de tabela reutilizável para AdminInterface e ClienteInterface
// Elimina ~50 linhas duplicadas entre os dois componentes
import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { typeOptions } from "@/components/ensaios/ensaioMappers";
import { DateRangePicker, TextColumnFilter, SelectColumnFilter } from "@/components/ensaios/TableFilters";

export default function EnsaiosTableHeader({
  // filtros
  typeFilter, setTypeFilter,
  sortOrder, toggleSortOrder,
  dataInicioFilter, setDataInicioFilter,
  dataFimFilter, setDataFimFilter,
  obraFilter, setObraFilter,
  nomeFilter, setNomeFilter,
  localFilter, setLocalFilter,
  empreiteiraFilter, setEmpreiteiraFilter,
  projetoFilter, setProjetoFilter,
  // coluna de status customizável
  statusFilter, setStatusFilter,
  statusOptions,
  // coluna de ações
  acoesLabel = "Ações",
  acoesWidth = "240px",
  showSelection = false,
  allSelected = false,
  someSelected = false,
  onToggleAll = null,
}) {
  return (
    <thead className="bg-muted/40 border-b border-border">
      <tr>
        {showSelection && (
          <th className="text-center px-2 py-2" style={{ width: '40px' }}>
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }}
              onChange={onToggleAll}
              className="w-4 h-4 cursor-pointer"
              aria-label="Selecionar todos"
            />
          </th>
        )}
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '12%' }}>
          <div className="flex items-center gap-1 min-w-0">
            <span className="shrink-0">Tipo</span>
            <SelectColumnFilter value={typeFilter} onChange={setTypeFilter} options={typeOptions} placeholder="Filtrar por tipo" />
          </div>
        </th>
        <th className="text-center px-2 py-2 font-medium text-foreground text-xs" style={{ width: '10%' }}>
          <div className="flex items-center justify-center gap-1 min-w-0">
            <span className="shrink-0">Status</span>
            <SelectColumnFilter value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="Filtrar por status" />
          </div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '10%' }}>
          <div className="flex items-center gap-1 min-w-0">
            <button type="button" onClick={toggleSortOrder} className="flex items-center gap-1 hover:text-secondary transition-colors shrink-0">
              <span>Data</span>
              {sortOrder === 'desc' && <ArrowDown className="w-3 h-3" />}
              {sortOrder === 'asc' && <ArrowUp className="w-3 h-3" />}
              {!sortOrder && <ArrowUpDown className="w-3 h-3" />}
            </button>
            <DateRangePicker startDate={dataInicioFilter} endDate={dataFimFilter} onStartChange={setDataInicioFilter} onEndChange={setDataFimFilter} />
          </div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '14%' }}>
          <div className="flex items-center gap-1 min-w-0"><span className="shrink-0">Obra</span><TextColumnFilter value={obraFilter} onChange={setObraFilter} placeholder="Filtrar por obra..." /></div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '10%' }}>
          <div className="flex items-center gap-1 min-w-0"><span className="shrink-0">Lab.</span><TextColumnFilter value={nomeFilter} onChange={setNomeFilter} placeholder="Filtrar por nome..." /></div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '12%' }}>
          <div className="flex items-center gap-1 min-w-0"><span className="shrink-0">Local</span><TextColumnFilter value={localFilter} onChange={setLocalFilter} placeholder="Filtrar por local..." /></div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '10%' }}>
          <div className="flex items-center gap-1 min-w-0"><span className="shrink-0">Empreiteira</span><TextColumnFilter value={empreiteiraFilter} onChange={setEmpreiteiraFilter} placeholder="Filtrar por empreiteira..." /></div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '10%' }}>
          <div className="flex items-center gap-1 min-w-0"><span className="shrink-0">Projeto</span><TextColumnFilter value={projetoFilter} onChange={setProjetoFilter} placeholder="Filtrar por projeto..." /></div>
        </th>
        <th className="text-center px-2 py-2 font-medium text-foreground text-xs" style={{ width: acoesWidth }}>{acoesLabel}</th>
      </tr>
    </thead>
  );
}