import { useCallback, useState } from "react";
import { atualizarRegistro } from "@/services/recordsService";

import { toast } from "@/components/ui/use-toast";
export const useGestaoNCActions = (setNcs) => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedNC, setSelectedNC] = useState(null);
  const [approvalAction, setApprovalAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const updateNCStatus = useCallback(
    async (id, status, requestApproval = false) => {
      const updateData = { status };
      if (requestApproval) {
        updateData.pendente_aprovacao_cliente = true;
      }
      await atualizarRegistro('RelatorioNC', id, updateData);
      setNcs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updateData } : n))
      );
    },
    [setNcs]
  );

  const handleApproval = useCallback(
    async (user, approve) => {
      if (!selectedNC) return;

      try {
        if (approve) {
          const clientSignature = {
            signed_by: user.email,
            signed_date: new Date().toISOString(),
            engineer_name: user.full_name || user.email,
            crea_number: user.crea_number || "",
          };

          const updateData = {
            pendente_aprovacao_cliente: false,
            cliente_aprovacao: "aprovada",
            cliente_aprovacao_data: new Date().toISOString(),
            cliente_aprovacao_responsavel: user.email,
            client_signature: clientSignature,
          };
          await atualizarRegistro('RelatorioNC', selectedNC.id, updateData);
          setNcs((prev) =>
            prev.map((n) =>
              n.id === selectedNC.id
                ? { ...n, ...updateData }
                : n
            )
          );
        } else {
          if (!rejectionReason.trim()) {
            toast({ title: "Por favor, informe o motivo da reprovação", variant: "destructive" });
            return;
          }
          const updateData = {
            status: "aberta",
            pendente_aprovacao_cliente: false,
            cliente_aprovacao: "reprovada",
            cliente_aprovacao_data: new Date().toISOString(),
            cliente_aprovacao_responsavel: user.email,
            cliente_reprovacao_motivo: rejectionReason,
          };
          await atualizarRegistro('RelatorioNC', selectedNC.id, updateData);
          setNcs((prev) =>
            prev.map((n) =>
              n.id === selectedNC.id
                ? { ...n, ...updateData }
                : n
            )
          );
        }
        setShowApprovalModal(false);
        setSelectedNC(null);
        setRejectionReason("");
      } catch (error) {
        console.error("Erro ao processar aprovação:", error);
        toast({ title: "Erro ao processar aprovação", variant: "destructive" });
      }
    },
    [selectedNC, rejectionReason, setNcs]
  );

  const handleSolicitarAprovacao = useCallback(
    async (nc) => {
      try {
        const updateData = {
          pendente_aprovacao_cliente: true,
          cliente_aprovacao: null,
          cliente_reprovacao_motivo: null,
        };
        await atualizarRegistro('RelatorioNC', nc.id, updateData);
        setNcs((prev) =>
          prev.map((n) =>
            n.id === nc.id
              ? { ...n, ...updateData }
              : n
          )
        );
      } catch (error) {
        console.error("Erro ao solicitar aprovação:", error);
        toast({ title: "Erro ao solicitar aprovação do cliente", variant: "destructive" });
      }
    },
    [setNcs]
  );

  const openApprovalModal = useCallback((nc, action) => {
    setSelectedNC(nc);
    setApprovalAction(action);
    setShowApprovalModal(true);
  }, []);

  const closeApprovalModal = useCallback(() => {
    setShowApprovalModal(false);
    setSelectedNC(null);
    setRejectionReason("");
  }, []);

  return {
    updateNCStatus,
    handleApproval,
    handleSolicitarAprovacao,
    openApprovalModal,
    closeApprovalModal,
    showApprovalModal,
    setShowApprovalModal,
    selectedNC,
    approvalAction,
    rejectionReason,
    setRejectionReason,
  };
};