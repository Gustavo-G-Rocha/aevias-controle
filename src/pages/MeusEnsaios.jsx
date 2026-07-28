import React, { useCallback } from "react";
import { Plus } from "lucide-react";
import { FilterBarSkeleton, TableSkeleton } from "@/components/skeletons/SkeletonBlocks";
import { useEnsaiosList } from "@/hooks/useEnsaiosList";
import { useEnsaiosActions } from "@/hooks/useEnsaiosActions";
import { assinarEnsaio } from "@/services/ensaiosService";
import { QUERY_KEYS } from "@/hooks/useQueryData";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { isAdmin, isCliente as isClienteUser, isGestorContrato, isSalaTecnica, isLaboratorista, isClienteSupervisor, isSupervisorInRegional } from "@/utils/accessControl";
import AdminInterface from "@/components/ensaios/AdminInterface";
import ClienteInterface from "@/components/ensaios/ClienteInterface";
import LaboratoristaInterface from "@/components/ensaios/LaboratoristaInterface";
import { useCreateEnsaioDialog } from "@/components/layout/CreateEnsaioDialogContext";

export default function MeusEnsaios() {
  const queryClient = useQueryClient();
  const { ensaios, obras, projects, allUsers, regionais, user, loading, reload } = useEnsaiosList();
  const { handleApprove, handleReject, handleDelete } = useEnsaiosActions(user, obras, reload);
  const { openCreateEnsaio } = useCreateEnsaioDialog();

  const handleAssinar = useCallback(async (ensaio) => {
    try {
      await assinarEnsaio(ensaio, user);
      toast({ title: 'Registro assinado com sucesso!' });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allRecords });
      await queryClient.invalidateQueries({ queryKey: ['supervisorRecords'] });
    } catch (error) {
      toast({ title: `Erro ao assinar: ${error?.message || 'Erro desconhecido'}.`, variant: "destructive" });
    }
  }, [user, queryClient]);

  const userIsAdmin = isAdmin(user);
  const userIsSalaTecnica = isSalaTecnica(user);
  const userIsGestorContrato = isGestorContrato(user);
  const userIsCliente = isClienteUser(user);
  const userIsClienteSupervisor = isClienteSupervisor(user);
  const canApprove = userIsAdmin || userIsSalaTecnica || userIsGestorContrato || userIsClienteSupervisor;
  const canCreate = userIsAdmin || userIsSalaTecnica || isLaboratorista(user) || userIsClienteSupervisor;

  // Para cliente_supervisor: canApproveRecord verifica por-regional se é supervisor.
  // Outros approvers (admin, sala_tecnica, gestor_contrato) têm canApprove global.
  const obrasMap = React.useMemo(() => new Map((obras || []).map(o => [o.id, o])), [obras]);
  const regionaisMap = React.useMemo(() => new Map((regionais || []).map(r => [r.id, r])), [regionais]);
  const canApproveRecord = React.useCallback((ensaio) => {
    if (!canApprove) return false;
    const obra = obrasMap.get(ensaio.obra_id);
    const regional = obra ? regionaisMap.get(obra.regional_id) : null;
    return isSupervisorInRegional(user, regional);
  }, [canApprove, obrasMap, regionaisMap, user]);

  const subtitle = userIsAdmin || userIsSalaTecnica || userIsGestorContrato
    ? "Gerencie e aprove todos os registros de suas obras."
    : userIsClienteSupervisor
    ? "Aprove registros dos seus funcionários e visualize os ensaios das suas obras."
    : userIsCliente
    ? "Visualize os ensaios e diários aprovados das suas obras."
    : "Visualize e gerencie todos os ensaios e diários registrados.";

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Ensaios Realizados</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>

        {/* FAB mobile para laboratoristas */}
        {canCreate && (
          <button
            type="button"
            onClick={openCreateEnsaio}
            aria-haspopup="dialog"
            className="lg:hidden fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}
            aria-label="Novo Registro"
          >
            <Plus className="w-7 h-7 text-white" />
          </button>
        )}

        {loading ? (
          <div className="space-y-6">
            <FilterBarSkeleton />
            <TableSkeleton />
          </div>
        ) : canApprove ? (
          <AdminInterface
            ensaios={ensaios}
            obras={obras}
            projects={projects}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            onAssinar={handleAssinar}
            user={user}
            canApprove={canApprove}
            canApproveRecord={canApproveRecord}
            canCreate={canCreate}
            allUsers={allUsers}
            regionais={regionais}
          />
        ) : userIsCliente ? (
          <ClienteInterface
            ensaios={ensaios}
            obras={obras}
            projects={projects}
            user={user}
            allUsers={allUsers}
          />
        ) : (
          <LaboratoristaInterface
            ensaios={ensaios}
            obras={obras}
            user={user}
            allUsers={allUsers}
          />
        )}
      </div>
    </div>
  );
}