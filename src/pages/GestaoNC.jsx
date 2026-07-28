import React from "react";
import { CardsPageSkeleton } from "@/components/skeletons/PageSkeletons";

import { useGestaoNCData } from "@/hooks/useGestaoNCData";
import { useGestaoNCFilters } from "@/hooks/useGestaoNCFilters";
import { useGestaoNCActions } from "@/hooks/useGestaoNCActions";
import {
  isUserGestor,
  isUserAdmin,
  isUserCliente,
  canUserChangeStatus,
} from "@/utils/gestaoNCUtils";

import GestaoNCHeader from "@/components/gestao-nc/GestaoNCHeader";
import GestaoNCFilters from "@/components/gestao-nc/GestaoNCFilters";
import GestaoNCSummary from "@/components/gestao-nc/GestaoNCSummary";
import GestaoNCList from "@/components/gestao-nc/GestaoNCList";
import GestaoNCApprovalModal from "@/components/gestao-nc/GestaoNCApprovalModal";

export default function GestaoNCPage() {
  const { user, obras, ncs, setNcs, loading } = useGestaoNCData();
  const {
    filtroObra,
    setFiltroObra,
    filtroStatus,
    setFiltroStatus,
    filtroTexto,
    setFiltroTexto,
    filtradas,
  } = useGestaoNCFilters(ncs);
  const {
    updateNCStatus,
    handleApproval,
    handleSolicitarAprovacao,
    openApprovalModal,
    closeApprovalModal,
    showApprovalModal,
    setShowApprovalModal,
    selectedNC: _selectedNC,
    approvalAction,
    rejectionReason,
    setRejectionReason,
  } = useGestaoNCActions(setNcs);

  const isGestor = isUserGestor(user);
  const isAdmin = isUserAdmin(user);
  const _isCliente = isUserCliente(user);
  const _canChangeStatus = canUserChangeStatus(user);

  if (loading) {
    return <CardsPageSkeleton withStats />;
  }

  const handleApprovalWrapper = (approve) => {
    handleApproval(user, approve);
  };

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <GestaoNCHeader canCreateNC={isGestor || isAdmin} />

        <GestaoNCFilters
          filtroTexto={filtroTexto}
          setFiltroTexto={setFiltroTexto}
          filtroObra={filtroObra}
          setFiltroObra={setFiltroObra}
          filtroStatus={filtroStatus}
          setFiltroStatus={setFiltroStatus}
          obras={obras}
        />

        <GestaoNCSummary ncs={ncs} />

        <GestaoNCList
          filtradas={filtradas}
          obras={obras}
          user={user}
          onUpdateStatus={updateNCStatus}
          onApproval={openApprovalModal}
          onSolicitarAprovacao={handleSolicitarAprovacao}
        />

        <GestaoNCApprovalModal
          open={showApprovalModal}
          onOpenChange={setShowApprovalModal}
          approvalAction={approvalAction}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onApprove={() => handleApprovalWrapper(true)}
          onReject={() => handleApprovalWrapper(false)}
          onCancel={closeApprovalModal}
        />
      </div>
    </div>
  );
}