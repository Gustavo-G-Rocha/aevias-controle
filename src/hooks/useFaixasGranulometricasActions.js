import { useCallback } from 'react';
import { criarFaixa, atualizarFaixa, deletarFaixa } from '@/services/faixasService';

import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
export function useFaixasGranulometricasActions(onSuccess) {
  const handleSaveFaixa = useCallback(async (faixaData, editingFaixa) => {
    try {
      if (editingFaixa) {
        await atualizarFaixa(editingFaixa.id, faixaData);
      } else {
        await criarFaixa(faixaData);
      }
      onSuccess();
    } catch (error) {
      logger.error("Erro ao salvar faixa:", error);
      toast({ title: 'Erro ao salvar faixa. Verifique os dados e tente novamente.', variant: "destructive" });
      throw error;
    }
  }, [onSuccess]);

  const handleDelete = useCallback(async (id, onDeleteSuccess) => {
    if (window.confirm("Tem certeza que deseja excluir esta faixa granulométrica?")) {
      try {
        await deletarFaixa(id);
        onDeleteSuccess();
      } catch (error) {
        logger.error("Erro ao excluir faixa:", error);
        toast({ title: 'Erro ao excluir faixa. Tente novamente mais tarde.', variant: "destructive" });
        throw error;
      }
    }
  }, []);

  return {
    handleSaveFaixa,
    handleDelete
  };
}