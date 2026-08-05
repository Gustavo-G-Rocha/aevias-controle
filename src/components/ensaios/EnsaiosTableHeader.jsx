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
          <th className="text-center px-2 py-2 overflow-hidden" style={{ width: '40px' }}>
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
        <th className="text-left px-2 py-3 font-medium text-foreground text-xs overflow-hidden" style={{ width: '12%' }}>
          <div className="flex flex-col gap-0.5 min-w-0 w-full">
            <span className="whitespace-normal break-words leading-tight">Tipo</span>
            <SelectColumnFilter value={typeFilter} onChange={setTypeFilter} options={typeOptions} placeholder="Filtrar por tipo" />
          </div>
        </th>
        <th className="text-center px-2 py-3 font-medium text-foreground text-xs overflow-hidden" style={{ width: '10%' }}>
          <div className="flex flex-col items-center gap-0.5 min-w-0 w-full">
            <span className="whitespace-normal break-words leading-tight">Status</span>
            <SelectColumnFilter value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="Filtrar por status" />
          </div>
        </th>
        <th className="text-left px-2 py-3 font-medium text-foreground text-xs overflow-hidden" style={{ width: '10%' }}>
          <div className="flex flex-col gap-0.5 min-w-0 w-full">
            <button type="button" onClick={toggleSortOrder} className="flex items-center gap-1 hover:text-secondary transition-colors whitespace-normal break-words leading-tight">
              <span>Data</span>
              {sortOrder === 'desc' && <ArrowDown className="w-3 h-3" />}
              {sortOrder === 'asc' && <ArrowUp className="w-3 h-3" />}
              {!sortOrder && <ArrowUpDown className="w-3 h-3" />}
            </button>
            <DateRangePicker startDate={dataInicioFilter} endDate={dataFimFilter} onStartChange={setDataInicioFilter} onEndChange={setDataFimFilter} />
          </div>
        </th>
        <th className="text-left px-2 py-3 font-medium text-foreground text-xs overflow-hidden" style={{ width: '14%' }}>
          <div className="flex flex-col gap-0.5 min-w-0 w-full"><span className="whitespace-normal break-words leading-tight">Obra</span><TextColumnFilter value={obraFilter} onChange={setObraFilter} placeholder="Filtrar por obra..." /></div>
        </th>
        <th className="text-left px-2 py-3 font-medium text-foreground text-xs overflow-hidden" style={{ width: '10%' }}>
          <div className="flex flex-col gap-0.5 min-w-0 w-full"><span className="whitespace-normal break-words leading-tight">Lab.</span><TextColumnFilter value={nomeFilter} onChange={setNomeFilter} placeholder="Filtrar por nome..." /></div>
        </th>
        <th className="text-left px-2 py-3 font-medium text-foreground text-xs overflow-hidden" style={{ width: '12%' }}>
          <div className="flex flex-col gap-0.5 min-w-0 w-full"><span className="whitespace-normal break-words leading-tight">Local</span><TextColumnFilter value={localFilter} onChange={setLocalFilter} placeholder="Filtrar por local..." /></div>
        </th>
        <th className="text-left px-2 py-3 font-medium text-foreground text-xs overflow-hidden" style={{ width: '10%' }}>
          <div className="flex flex-col gap-0.5 min-w-0 w-full"><span className="whitespace-normal break-words leading-tight">Empreiteira</span><TextColumnFilter value={empreiteiraFilter} onChange={setEmpreiteiraFilter} placeholder="Filtrar por empreiteira..." /></div>
        </th>
        <th className="text-left px-2 py-3 font-medium text-foreground text-xs overflow-hidden" style={{ width: '10%' }}>
          <div className="flex flex-col gap-0.5 min-w-0 w-full"><span className="whitespace-normal break-words leading-tight">Projeto</span><TextColumnFilter value={projetoFilter} onChange={setProjetoFilter} placeholder="Filtrar por projeto..." /></div>
        </th>
        <th className="text-center px-2 py-3 font-medium text-foreground text-xs overflow-hidden" style={{ width: acoesWidth }}>{acoesLabel}</th>
      </tr>
    </thead>
  );
}