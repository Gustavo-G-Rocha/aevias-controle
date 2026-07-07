// Interface de tabela para usuários cliente
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Filter } from "lucide-react";
import { Pagination } from "@/components/ensaios/Pagination";
import { useTableFilters } from "@/hooks/useTableFilters";
import TableRowCliente from "@/components/ensaios/TableRowCliente";
import EnsaiosTableHeader from "@/components/ensaios/EnsaiosTableHeader";
import { assinarEnsaio } from "@/services/ensaiosService";
import { toast } from "@/components/ui/use-toast";

const ClienteInterface = React.memo(({ ensaios, obras, projects, user, allUsers, onFiltersActiveChange }) => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('all');

  // O(1) lookup — evita obras.find() / projects.find() dentro de loops
  const obrasMap = useMemo(() => new Map(obras.map((o) => [o.id, o])), [obras]);
  const projectsMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  // Usa appliedStatusFilter para deferir o filtro de status ao botão "Filtrar"
  const applyCustomFilters = useCallback((filtered) => {
    if (appliedStatusFilter === 'approved') return filtered.filter((e) => e.approved === true && !e.client_signature?.signed_by);
    if (appliedStatusFilter === 'signed') return filtered.filter((e) => e.client_signature?.signed_by);
    return filtered;
  }, [appliedStatusFilter]);

  const handleApplyFilters = useCallback(() => {
    applyFilters();
    setAppliedStatusFilter(statusFilter);
  }, [applyFilters, statusFilter]);

  const {
    nomeFilter, setNomeFilter,
    obraFilter, setObraFilter,
    projetoFilter, setProjetoFilter,
    localFilter, setLocalFilter,
    empreiteiraFilter, setEmpreiteiraFilter,
    dataInicioFilter, setDataInicioFilter,
    dataFimFilter, setDataFimFilter,
    typeFilter, setTypeFilter,
    sortOrder,
    currentPage, setCurrentPage,
    filteredEnsaios,
    paginatedEnsaios,
    totalPages,
    isAnyFilterActive,
    hasPendingChanges,
    applyFilters,
    toggleSortOrder,
    clearFilters,
  } = useTableFilters(ensaios, obras, projects, allUsers, applyCustomFilters);

  // Reporta filtro ativo para o pai permitir carregar mais registros (limite dinâmico)
  useEffect(() => {
    onFiltersActiveChange?.(isAnyFilterActive || appliedStatusFilter !== 'all');
  }, [isAnyFilterActive, appliedStatusFilter, onFiltersActiveChange]);

  // Limpa filtros do hook + status aplicado
  const handleClearFilters = useCallback(() => {
    clearFilters();
    setAppliedStatusFilter('all');
  }, [clearFilters]);

  const handleAssinar = useCallback(async (ensaio) => {
    if (!window.confirm(`Confirma a assinatura digital do registro "${ensaio.sample_id || ensaio.id}"?`)) return;
    try {
      await assinarEnsaio(ensaio, user);
      toast({ title: 'Registro assinado com sucesso!' });
      await queryClient.invalidateQueries();
    } catch (error) {
      toast({ title: `Erro ao assinar: ${error?.message || 'Erro desconhecido'}.`, variant: "destructive" });
    }
  }, [user, queryClient]);

  const statusOptions = [
    { value: 'all', label: 'Todos os status' },
    { value: 'approved', label: 'Aprovados (não assinados)' },
    { value: 'signed', label: 'Assinados' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 text-sm text-foreground/70">
          <span>{filteredEnsaios.length} registro(s) encontrado(s)</span>
          {isAnyFilterActive && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-7 text-xs text-foreground/80 hover:bg-black/10">
              Limpar todos os filtros
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={handleApplyFilters}
          className={hasPendingChanges ? "border-secondary" : ""}
          style={hasPendingChanges ? { color: 'var(--color-primary)' } : {}}
        >
          <Filter className="mr-2 h-4 w-4" /> Filtrar
        </Button>
      </div>

      <Card className="bg-card/20 backdrop-blur-lg border border-white/20 dark:bg-card/40 dark:border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <EnsaiosTableHeader
                typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                sortOrder={sortOrder} toggleSortOrder={toggleSortOrder}
                dataInicioFilter={dataInicioFilter} setDataInicioFilter={setDataInicioFilter}
                dataFimFilter={dataFimFilter} setDataFimFilter={setDataFimFilter}
                obraFilter={obraFilter} setObraFilter={setObraFilter}
                nomeFilter={nomeFilter} setNomeFilter={setNomeFilter}
                localFilter={localFilter} setLocalFilter={setLocalFilter}
                empreiteiraFilter={empreiteiraFilter} setEmpreiteiraFilter={setEmpreiteiraFilter}
                projetoFilter={projetoFilter} setProjetoFilter={setProjetoFilter}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                statusOptions={statusOptions}
                acoesLabel="Ações"
                acoesWidth="120px"
              />
              <tbody>
                {paginatedEnsaios.map((ensaio, index) => (
                  <TableRowCliente
                    key={ensaio.id}
                    ensaio={ensaio}
                    obra={obrasMap.get(ensaio.obra_id)}
                    projeto={ensaio.project_id ? projectsMap.get(ensaio.project_id) : null}
                    index={index}
                    allUsers={allUsers}
                    onAssinar={handleAssinar}
                  />
                ))}
              </tbody>
            </table>
            {filteredEnsaios.length === 0 && (
              <div className="text-center py-12 text-foreground/70">
                <FileText className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Nenhum registro encontrado</h3>
                <p>Ajuste os filtros ou aguarde novos registros aprovados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
});

ClienteInterface.displayName = 'ClienteInterface';
export default ClienteInterface;