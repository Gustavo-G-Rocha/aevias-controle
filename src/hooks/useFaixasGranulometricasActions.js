import { useCallback } from 'react';
import { criarFaixa, atualizarFaixa, deletarFaixa } from '@/services/faixasService';

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
      console.error("Erro ao salvar faixa:", error);
      alert('Erro ao salvar faixa. Verifique os dados e tente novamente.');
      throw error;
    }
  }, [onSuccess]);

  const handleDelete = useCallback(async (id, onDeleteSuccess) => {
    if (window.confirm("Tem certeza que deseja excluir esta faixa granulométrica?")) {
      try {
        await deletarFaixa(id);
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