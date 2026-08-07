// Cabeçalho de tabela reutilizável para AdminInterface e ClienteInterface
// Layout horizontal: label à esquerda + ícone de filtro à direita, na mesma linha.
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
}) {
  return (
    <thead className="bg-muted/40 border-b border-border">
      <tr>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '11%' }}>
          <div className="flex items-center justify-between gap-0.5 min-w-0">
            <span className="whitespace-nowrap truncate">Tipo</span>
            <SelectColumnFilter value={typeFilter} onChange={setTypeFilter} options={typeOptions} placeholder="Filtrar por tipo" />
          </div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '10%' }}>
          <div className="flex items-center justify-between gap-0.5 min-w-0">
            <span className="whitespace-nowrap truncate">Status</span>
            <SelectColumnFilter value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="Filtrar por status" />
          </div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '11%' }}>
          <div className="flex items-center gap-1 min-w-0">
            <button type="button" onClick={toggleSortOrder} className="flex items-center gap-0.5 hover:text-secondary transition-colors whitespace-nowrap shrink-0">
              <span>Data</span>
              {sortOrder === 'desc' && <ArrowDown className="w-3 h-3 shrink-0" />}
              {sortOrder === 'asc' && <ArrowUp className="w-3 h-3 shrink-0" />}
              {!sortOrder && <ArrowUpDown className="w-3 h-3 shrink-0" />}
            </button>
            <DateRangePicker startDate={dataInicioFilter} endDate={dataFimFilter} onStartChange={setDataInicioFilter} onEndChange={setDataFimFilter} />
          </div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '15%' }}>
          <div className="flex items-center justify-between gap-0.5 min-w-0">
            <span className="whitespace-nowrap truncate">Obra</span>
            <TextColumnFilter value={obraFilter} onChange={setObraFilter} placeholder="Filtrar por obra..." />
          </div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '8%' }}>
          <div className="flex items-center justify-between gap-0.5 min-w-0">
            <span className="whitespace-nowrap truncate">Lab.</span>
            <TextColumnFilter value={nomeFilter} onChange={setNomeFilter} placeholder="Filtrar por nome..." />
          </div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '11%' }}>
          <div className="flex items-center justify-between gap-0.5 min-w-0">
            <span className="whitespace-nowrap truncate">Local</span>
            <TextColumnFilter value={localFilter} onChange={setLocalFilter} placeholder="Filtrar por local..." />
          </div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '11%' }}>
          <div className="flex items-center justify-between gap-0.5 min-w-0">
            <span className="whitespace-nowrap truncate">Empreit.</span>
            <TextColumnFilter value={empreiteiraFilter} onChange={setEmpreiteiraFilter} placeholder="Filtrar por empreiteira..." />
          </div>
        </th>
        <th className="text-left px-2 py-2 font-medium text-foreground text-xs" style={{ width: '10%' }}>
          <div className="flex items-center justify-between gap-0.5 min-w-0">
            <span className="whitespace-nowrap truncate">Projeto</span>
            <TextColumnFilter value={projetoFilter} onChange={setProjetoFilter} placeholder="Filtrar por projeto..." />
          </div>
        </th>
        <th className="text-center px-2 py-2 font-medium text-foreground text-xs" style={{ width: acoesWidth }}>{acoesLabel}</th>
      </tr>
    </thead>
  );
}