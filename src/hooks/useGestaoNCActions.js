import { useCallback, useState } from "react";
import { base44 } from "@/api/base44Client";

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
      await base44.entities.RelatorioNC.update(id, updateData);
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

          await base44.entities.RelatorioNC.update(selectedNC.id, {
            pendente_aprovacao_cliente: false,
            cliente_aprovacao: "aprovada",
            cliente_aprovacao_data: new Date().toISOString(),
            cliente_aprovacao_responsavel: user.email,
            client_signature: clientSignature,
          });
          setNcs((prev) =>
            prev.map((n) =>
              n.id === selectedNC.id
                ? {
                    ...n,
                    pendente_aprovacao_cliente: false,
                    cliente_aprovacao: "aprovada",
                    cliente_aprovacao_data: new Date().toISOString(),
                    cliente_aprovacao_responsavel: user.email,
                    client_signature: clientSignature,
                  }
                : n
            )
          );
        } else {
          if (!rejectionReason.trim()) {
            alert("Por favor, informe o motivo da reprovação");
            return;
          }
          await base44.entities.RelatorioNC.update(selectedNC.id, {
            status: "aberta",
            pendente_aprovacao_cliente: false,
            cliente_aprovacao: "reprovada",
            cliente_aprovacao_data: new Date().toISOString(),
            cliente_aprovacao_responsavel: user.email,
            cliente_reprovacao_motivo: rejectionReason,
          });
          setNcs((prev) =>
            prev.map((n) =>
              n.id === selectedNC.id
                ? {
                    ...n,
                    status: "aberta",
                    pendente_aprovacao_cliente: false,
                    cliente_aprovacao: "reprovada",
                    cliente_aprovacao_data: new Date().toISOString(),
                    cliente_aprovacao_responsavel: user.email,
                    cliente_reprovacao_motivo: rejectionReason,
                  }
                : n
            )
          );
        }
        setShowApprovalModal(false);
        setSelectedNC(null);
        setRejectionReason("");
      } catch (error) {
        console.error("Erro ao processar aprovação:", error);
        alert("Erro ao processar aprovação");
      }
    },
    [selectedNC, rejectionReason, setNcs]
  );

  const handleSolicitarAprovacao = useCallback(
    async (nc) => {
      try {
        await base44.entities.RelatorioNC.update(nc.id, {
          pendente_aprovacao_cliente: true,
          cliente_aprovacao: null,
          cliente_reprovacao_motivo: null,
        });
        setNcs((prev) =>
          prev.map((n) =>
            n.id === nc.id
              ? {
                  ...n,
                  pendente_aprovacao_cliente: true,
                  cliente_aprovacao: null,
                  cliente_reprovacao_motivo: null,
                }
              : n
          )
        );
      } catch (error) {
        console.error("Erro ao solicitar aprovação:", error);
        alert("Erro ao solicitar aprovação do cliente");
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