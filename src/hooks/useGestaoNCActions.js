import { useCallback, useState } from "react";
import { gerenciarAprovacao } from "@/functions/gerenciarAprovacao";

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
export const useGestaoNCActions = (setNcs) => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedNC, setSelectedNC] = useState(null);
  const [approvalAction, setApprovalAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const updateNCStatus = useCallback(
    async (id, status, requestApproval = false) => {
      const response = await gerenciarAprovacao({
        action: 'update_nc_status',
        entityName: 'RelatorioNC',
        recordId: id,
        ncStatus: status,
        requestApproval,
      });
      const updated = response.data.data;
      setNcs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updated } : n))
      );
    },
    [setNcs]
  );

  const handleApproval = useCallback(
    async (user, approve) => {
      if (!selectedNC) return;

      try {
        if (approve) {
          const response = await gerenciarAprovacao({
            action: 'approve_nc',
            entityName: 'RelatorioNC',
            recordId: selectedNC.id,
          });
          const updated = response.data.data;
          setNcs((prev) =>
            prev.map((n) =>
              n.id === selectedNC.id
                ? { ...n, ...updated }
                : n
            )
          );
        } else {
          if (!rejectionReason.trim()) {
            toast({ title: "Por favor, informe o motivo da reprovação", variant: "destructive" });
            return;
          }
          const response = await gerenciarAprovacao({
            action: 'reject_nc',
            entityName: 'RelatorioNC',
            recordId: selectedNC.id,
            rejectionReason,
          });
          const updated = response.data.data;
          setNcs((prev) =>
            prev.map((n) =>
              n.id === selectedNC.id
                ? { ...n, ...updated }
                : n
            )
          );
        }
        setShowApprovalModal(false);
        setSelectedNC(null);
        setRejectionReason("");
      } catch (error) {
        logger.error("Erro ao processar aprovação:", error);
        toast({ title: "Erro ao processar aprovação", variant: "destructive" });
      }
    },
    [selectedNC, rejectionReason, setNcs]
  );

  const handleSolicitarAprovacao = useCallback(
    async (nc) => {
      try {
        const response = await gerenciarAprovacao({
          action: 'solicitar_aprovacao_nc',
          entityName: 'RelatorioNC',
          recordId: nc.id,
        });
        const updated = response.data.data;
        setNcs((prev) =>
          prev.map((n) =>
            n.id === nc.id
              ? { ...n, ...updated }
              : n
          )
        );
      } catch (error) {
        logger.error("Erro ao solicitar aprovação:", error);
        toast({ title: error?.response?.data?.error || "Erro ao solicitar aprovação do cliente", variant: "destructive" });
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