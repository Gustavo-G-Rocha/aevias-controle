import { useCallback } from "react";
import { aprovarEnsaio, reprovarEnsaio, excluirEnsaio } from "@/services/ensaiosService";
import { useRecordCacheUpdate } from "@/hooks/useQueryData";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

/**
 * Hook que encapsula as ações de aprovação, reprovação e exclusão de ensaios.
 *
 * Após cada ação bem-sucedida, atualiza APENAS o registro afetado no cache
 * do React Query via setQueriesData (granular), evitando refetch da coleção
 * inteira (25+ entidades). Agregados derivados (dashboard stats/charts)
 * recomputam in-memory a partir do cache atualizado.
 *
 * @param {object} user - usuário autenticado
 * @param {object[]} obras - lista de obras (para aprovarEnsaio)
 * @param {Function} [onSuccess] - callback opcional de fallback; se fornecido,
 *   é chamado APENAS se a atualização granular não for possível (ex: resposta
 *   sem id). Não é chamado no caminho padrão para evitar refetch amplo.
 */
export function useEnsaiosActions(user, obras, onSuccess) {
  const { updateRecord, removeRecord } = useRecordCacheUpdate();

  const handleApprove = useCallback(async (ensaio) => {
    try {
      const updatedRecord = await aprovarEnsaio(ensaio, user, obras);
      if (updatedRecord?.id) {
        updateRecord(updatedRecord);
      } else {
        onSuccess?.();
      }
      toast({ title: 'Registro aprovado com sucesso!' });
    } catch (error) {
      logger.error('[useEnsaiosActions] Erro ao aprovar ensaio:', error?.message || error);
      toast({ title: 'Erro ao aprovar ensaio. Tente novamente.', variant: "destructive" });
    }
  }, [user, obras, onSuccess, updateRecord]);

  const handleReject = useCallback(async (ensaio, motivo) => {
    try {
      const updatedRecord = await reprovarEnsaio(ensaio, user, motivo);
      if (updatedRecord?.id) {
        updateRecord(updatedRecord);
      } else {
        onSuccess?.();
      }
      toast({ title: 'Registro reprovado com sucesso!' });
    } catch (error) {
      logger.error('[useEnsaiosActions] Erro ao reprovar registro:', error?.message || error);
      toast({ title: 'Erro ao reprovar registro. Tente novamente.', variant: "destructive" });
    }
  }, [user, onSuccess, updateRecord]);

  const handleDelete = useCallback(async (ensaio) => {
    try {
      await excluirEnsaio(ensaio);
      if (ensaio?.id) {
        removeRecord(ensaio.id);
      } else {
        onSuccess?.();
      }
      toast({ title: 'Registro excluído com sucesso!' });
    } catch (error) {
      logger.error('[useEnsaiosActions] Erro ao excluir registro:', error?.message || error);
      toast({ title: 'Erro ao excluir registro. Tente novamente.', variant: "destructive" });
    }
  }, [onSuccess, removeRecord]);

  return {
    handleApprove,
    handleReject,
    handleDelete,
  };
}