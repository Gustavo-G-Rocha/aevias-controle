import { useCallback } from "react";
import { aprovarEnsaio, reprovarEnsaio, excluirEnsaio } from "@/services/ensaiosService";
// Re-exportado para garantir que o chunk lazy seja recompilado pelo Vite HMR

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
/**
 * Hook que encapsula as ações de aprovação, reprovação e exclusão de ensaios.
 * Fornece manipuladores de erro padronizados e confirmações.
 */
export function useEnsaiosActions(user, obras, onSuccess) {
  const handleApprove = useCallback(async (ensaio) => {
    if (!window.confirm(`Confirma a aprovação do registro "${ensaio.sample_id || ensaio.id}"?`)) return;
    try {
      await aprovarEnsaio(ensaio, user, obras);
      toast({ title: 'Registro aprovado com sucesso!' });
      onSuccess?.();
    } catch (error) {
      logger.error('[useEnsaiosActions] Erro ao aprovar ensaio:', error?.message || error);
      toast({ title: 'Erro ao aprovar ensaio. Tente novamente.', variant: "destructive" });
    }
  }, [user, obras, onSuccess]);

  const handleReject = useCallback(async (ensaio, motivo) => {
    try {
      await reprovarEnsaio(ensaio, user, motivo);
      toast({ title: 'Registro reprovado com sucesso!' });
      onSuccess?.();
    } catch (error) {
      logger.error('[useEnsaiosActions] Erro ao reprovar registro:', error?.message || error);
      toast({ title: 'Erro ao reprovar registro. Tente novamente.', variant: "destructive" });
    }
  }, [user, onSuccess]);

  const handleDelete = useCallback(async (ensaio) => {
    try {
      await excluirEnsaio(ensaio);
      toast({ title: 'Registro excluído com sucesso!' });
      onSuccess?.();
    } catch (error) {
      logger.error('[useEnsaiosActions] Erro ao excluir registro:', error?.message || error);
      toast({ title: 'Erro ao excluir registro. Tente novamente.', variant: "destructive" });
    }
  }, [onSuccess]);

  return {
    handleApprove,
    handleReject,
    handleDelete,
  };
}