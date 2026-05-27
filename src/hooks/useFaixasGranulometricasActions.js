import { useCallback } from 'react';
import { FaixaGranulometrica } from '@/entities/FaixaGranulometrica';

export function useFaixasGranulometricasActions(onSuccess) {
  const handleSaveFaixa = useCallback(async (faixaData, editingFaixa) => {
    try {
      if (editingFaixa) {
        await FaixaGranulometrica.update(editingFaixa.id, faixaData);
      } else {
        await FaixaGranulometrica.create(faixaData);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar faixa:", error);
      alert('Erro ao salvar faixa. Verifique os dados e tente novamente.');
      throw error;
    }
  }, [onSuccess]);

  const handleDelete = useCallback(async (id, onDeleteSuccess) => {
    if (window.confirm("Tem certeza que deseja excluir esta faixa granulométrica?")) {
      try {
        await FaixaGranulometrica.delete(id);
        onDeleteSuccess();
      } catch (error) {
        console.error("Erro ao excluir faixa:", error);
        alert('Erro ao excluir faixa. Tente novamente mais tarde.');
        throw error;
      }
    }
  }, []);

  return {
    handleSaveFaixa,
    handleDelete
  };
}