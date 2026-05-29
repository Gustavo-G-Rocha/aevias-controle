import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useFaixasGranulometricasActions(onSuccess) {
  const handleSaveFaixa = useCallback(async (faixaData, editingFaixa) => {
    try {
      if (editingFaixa) {
        await base44.entities.FaixaGranulometrica.update(editingFaixa.id, faixaData);
      } else {
        await base44.entities.FaixaGranulometrica.create(faixaData);
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
        await base44.entities.FaixaGranulometrica.delete(id);
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