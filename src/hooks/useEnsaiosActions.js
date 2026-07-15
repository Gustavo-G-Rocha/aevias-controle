import { useCallback } from "react";
import { aprovarEnsaio, reprovarEnsaio, excluirEnsaio } from "@/services/ensaiosService";
import { useRecordCacheUpdate } from "@/hooks/useQueryData";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

/**
 * Hook que encapsula as ações de aprovação, reprovação e exclusão de ensaios.
 *
 * ATUALIZAÇÃO OTIMISTA: a UI reflete a mudança IMEDIATAMENTE (antes da resposta
 * da API), mantendo a interface responsiva em mobile. Em caso de falha, o
 * snapshot do cache é restaurado (rollback) e um toast de erro é exibido.
 *
 * Após confirmação do backend, o registro real substitui o otimista no cache
 * (granular, via setQueriesData — sem refetch da coleção inteira).
 *
 * @param {object} user - usuário autenticado
 * @param {object[]} obras - lista de obras (para aprovarEnsaio)
 * @param {Function} [onSuccess] - callback opcional de fallback; chamado APENAS
 *   se a atualização granular não for possível (ex: resposta sem id).
 */
export function useEnsaiosActions(user, obras, onSuccess) {
  const { updateRecord, removeRecord, snapshotRecords, restoreRecords } = useRecordCacheUpdate();

  const handleApprove = useCallback(async (ensaio) => {
    const snapshot = snapshotRecords();
    // Otimista: marca como aprovado imediatamente na UI
    updateRecord({
      ...ensaio,
      approved: true,
      approved_by: user?.email,
      approved_date: new Date().toISOString(),
    });
    try {
      const updatedRecord = await aprovarEnsaio(ensaio, user, obras);
      if (updatedRecord?.id) {
        updateRecord(updatedRecord);
      } else {
        onSuccess?.();
      }
      toast({ title: 'Registro aprovado com sucesso!' });
    } catch (error) {
      restoreRecords(snapshot);
      logger.error('[useEnsaiosActions] Erro ao aprovar ensaio:', error?.message || error);
      toast({ title: 'Erro ao aprovar ensaio. A alteração foi desfeita.', variant: "destructive" });
    }
  }, [user, obras, onSuccess, updateRecord, snapshotRecords, restoreRecords]);

  const handleReject = useCallback(async (ensaio, motivo) => {
    const snapshot = snapshotRecords();
    // Otimista: marca como reprovado imediatamente na UI
    updateRecord({
      ...ensaio,
      approved: false,
      rejection_reason: motivo,
      approved_by: user?.email,
      approved_date: new Date().toISOString(),
    });
    try {
      const updatedRecord = await reprovarEnsaio(ensaio, user, motivo);
      if (updatedRecord?.id) {
        updateRecord(updatedRecord);
      } else {
        onSuccess?.();
      }
      toast({ title: 'Registro reprovado com sucesso!' });
    } catch (error) {
      restoreRecords(snapshot);
      logger.error('[useEnsaiosActions] Erro ao reprovar registro:', error?.message || error);
      toast({ title: 'Erro ao reprovar registro. A alteração foi desfeita.', variant: "destructive" });
    }
  }, [user, onSuccess, updateRecord, snapshotRecords, restoreRecords]);

  const handleDelete = useCallback(async (ensaio) => {
    const snapshot = snapshotRecords();
    // Otimista: remove da lista imediatamente na UI
    if (ensaio?.id) removeRecord(ensaio.id);
    try {
      await excluirEnsaio(ensaio);
      if (!ensaio?.id) {
        onSuccess?.();
      }
      toast({ title: 'Registro excluído com sucesso!' });
    } catch (error) {
      restoreRecords(snapshot);
      logger.error('[useEnsaiosActions] Erro ao excluir registro:', error?.message || error);
      toast({ title: 'Erro ao excluir registro. A alteração foi desfeita.', variant: "destructive" });
    }
  }, [onSuccess, removeRecord, snapshotRecords, restoreRecords]);

  return {
    handleApprove,
    handleReject,
    handleDelete,
  };
}