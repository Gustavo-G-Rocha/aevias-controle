import React from "react";
import { Loader2, Plus } from "lucide-react";
import { useEnsaiosList } from "@/hooks/useEnsaiosList";
import { useEnsaiosActions } from "@/hooks/useEnsaiosActions";
import { isAdmin, isCliente as isClienteUser, isGestorContrato, isSalaTecnica, isLaboratorista, isClienteSupervisor } from "@/utils/accessControl";
import AdminInterface from "@/components/ensaios/AdminInterface";
import ClienteInterface from "@/components/ensaios/ClienteInterface";
import LaboratoristaInterface from "@/components/ensaios/LaboratoristaInterface";
import { DialogTrigger } from "@/components/ui/dialog";

export default function MeusEnsaios() {
  const { ensaios, obras, projects, allUsers, regionais, user, loading, reload } = useEnsaiosList();
  const { handleApprove, handleReject, handleDelete } = useEnsaiosActions(user, obras, reload);

  const _isAdmin = isAdmin(user);
  const _isSalaTecnica = isSalaTecnica(user);
  const _isGestorContrato = isGestorContrato(user);
  const _isCliente = isClienteUser(user);
  const _isClienteSupervisor = isClienteSupervisor(user);
  const canApprove = _isAdmin || _isSalaTecnica || _isGestorContrato || _isClienteSupervisor;
  const canCreate = _isAdmin || isLaboratorista(user);

  const subtitle = _isAdmin || _isSalaTecnica || _isGestorContrato
    ? "Gerencie e aprove todos os registros de suas obras."
    : _isClienteSupervisor
    ? "Aprove registros dos seus funcionários e visualize os ensaios das suas obras."
    : _isCliente
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
          <DialogTrigger asChild>
            <button
              className="lg:hidden fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
              aria-label="Novo Registro"
            >
              <Plus className="w-7 h-7 text-white" />
            </button>
          </DialogTrigger>
        )}

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Carregando registros...</p>
          </div>
        ) : canApprove ? (
          <AdminInterface
            ensaios={ensaios}
            obras={obras}
            projects={projects}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            user={user}
            canApprove={canApprove}
            canCreate={canCreate}
            allUsers={allUsers}
            regionais={regionais}
          />
        ) : _isCliente ? (
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