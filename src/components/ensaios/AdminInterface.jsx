// Interface de tabela para admin/gestor/sala técnica
import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, FlaskConical, Gauge, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ensaios/Pagination";
import { ReprovacaoModal } from "@/components/ensaios/ReprovacaoModal";
import { ExclusaoModal } from "@/components/ensaios/ExclusaoModal";
import { useTableFilters } from "@/hooks/useTableFilters";
import TableRowAdmin from "@/components/ensaios/TableRowAdmin";
import EnsaiosTableHeader from "@/components/ensaios/EnsaiosTableHeader";
import { getStatusInfo } from "@/components/ensaios/utils";
import { STATUS_LABELS } from "@/constants/ensaioUi";

const AdminInterface = React.memo(({ ensaios, obras, projects, onApprove, onReject, onDelete, onAssinar, user, canApprove, canApproveRecord, canCreate, allUsers, regionais = [] }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [reprovingEnsaio, setReprovingEnsaio] = useState(null);
  const [deletingEnsaio, setDeletingEnsaio] = useState(null);

  // O(1) lookup — evita obras.find() dentro de loops
  const obrasMap = useMemo(() => new Map(obras.map((o) => [o.id, o])), [obras]);
  const projectsMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  // Filtra pelo mesmo status exibido no badge (getStatusInfo), garantindo que
  // registros com status='rascunho' (badge "Execução") nunca apareçam em
  // "Aprovados"/"Reprovados"/"Assinados", mesmo que approved esteja inconsistente.
  const applyCustomFilters = useCallback((filtered) => {
    if (statusFilter === 'all') return filtered;
    const labelByValue = {
      approved: STATUS_LABELS.APROVADO,
      pending: STATUS_LABELS.PENDENTE,
      rejected: STATUS_LABELS.REPROVADO,
      signed: STATUS_LABELS.ASSINADO,
    };
    const target = labelByValue[statusFilter];
    if (!target) return filtered;
    return filtered.filter((e) => getStatusInfo(e).text === target);
  }, [statusFilter]);

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
    toggleSortOrder,
    clearFilters,
  } = useTableFilters(ensaios, obras, projects, allUsers, applyCustomFilters);

  const handleReject = useCallback(async (ensaio, motivo) => {
    await onReject(ensaio, motivo);
    setReprovingEnsaio(null);
  }, [onReject]);

  const handleDelete = useCallback(async (ensaio) => {
    await onDelete(ensaio);
    setDeletingEnsaio(null);
  }, [onDelete]);

  const statusOptions = [
    { value: 'all', label: 'Todos os status' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'approved', label: 'Aprovados' },
    { value: 'rejected', label: 'Reprovados' },
    { value: 'signed', label: 'Assinados' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <span>{filteredEnsaios.length} registro(s) encontrado(s)</span>
          {isAnyFilterActive && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Limpar todos os filtros
            </Button>
          )}
        </div>
        {canCreate && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Registro
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link to={createPageUrl("DiarioObra")}><FileText className="mr-2 h-4 w-4" /> Diário de Obra</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to={createPageUrl("EnsaioCAUQ")}><FlaskConical className="mr-2 h-4 w-4" /> Ensaio de CAUQ</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to={createPageUrl("EnsaioDensidade")}><Gauge className="mr-2 h-4 w-4" /> Densidade CP</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to={createPageUrl("ChecklistUsina")}><ClipboardList className="mr-2 h-4 w-4" /> Checklist de Usina</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to={createPageUrl("ChecklistAplicacao")}><ClipboardList className="mr-2 h-4 w-4" /> Checklist de Aplicação</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to={createPageUrl("ChecklistMRAF")}><ClipboardList className="mr-2 h-4 w-4" /> Checklist de MRAF</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to={createPageUrl("ChecklistConcretagem")}><ClipboardList className="mr-2 h-4 w-4" /> Checklist de Concretagem</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to={createPageUrl("ChecklistTerraplanagem")}><ClipboardList className="mr-2 h-4 w-4" /> Checklist de Terraplanagem</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Card className="border-0" style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }}>
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
                acoesWidth="140px"
              />
              <tbody>
                {paginatedEnsaios.map((ensaio, index) => (
                  <TableRowAdmin
                    key={ensaio.id}
                    ensaio={ensaio}
                    obra={obrasMap.get(ensaio.obra_id)}
                    projeto={ensaio.project_id ? projectsMap.get(ensaio.project_id) : null}
                    index={index}
                    canApprove={canApproveRecord ? canApproveRecord(ensaio) : canApprove}
                    allUsers={allUsers}
                    obras={obras}
                    user={user}
                    regionais={regionais}
                    onApprove={onApprove}
                    onReject={() => setReprovingEnsaio(ensaio)}
                    onDelete={() => setDeletingEnsaio(ensaio)}
                    onAssinar={onAssinar}
                  />
                ))}
              </tbody>
            </table>
            {filteredEnsaios.length === 0 && (
              <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-subtle)' }} />
                <h3 className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>Nenhum registro encontrado</h3>
                <p>Ajuste os filtros ou aguarde novos registros.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <ReprovacaoModal ensaio={reprovingEnsaio} isOpen={!!reprovingEnsaio} onClose={() => setReprovingEnsaio(null)} onReprove={handleReject} />
      <ExclusaoModal ensaio={deletingEnsaio} isOpen={!!deletingEnsaio} onClose={() => setDeletingEnsaio(null)} onDelete={handleDelete} />
    </div>
  );
});

AdminInterface.displayName = 'AdminInterface';
export default AdminInterface;