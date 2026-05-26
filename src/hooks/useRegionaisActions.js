/**
 * Hook com ações de persistência de Regionais (criar, editar, excluir).
 * Recebe loadData para fazer refresh após cada mutação.
 */
import { useState, useCallback } from "react";
import { Regional } from "@/entities/Regional";

export function useRegionaisActions(loadData) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRegional, setEditingRegional] = useState(null);

  const handleSaveRegional = useCallback(async (regionalData) => {
    try {
      if (editingRegional) {
        await Regional.update(editingRegional.id, regionalData);
      } else {
        await Regional.create(regionalData);
      }
      setIsFormOpen(false);
      setEditingRegional(null);
      loadData();
    } catch (error) {
      console.error("[Regionais] Erro ao salvar regional:", error?.message || error);
      alert("Erro ao salvar regional.");
    }
  }, [editingRegional, loadData]);

  const handleEdit = useCallback((regional) => {
    setEditingRegional(regional);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta regional?")) {
      try {
        await Regional.delete(id);
        loadData();
      } catch (error) {
        console.error("[Regionais] Erro ao excluir regional:", error?.message || error);
        alert("Erro ao excluir regional.");
      }
    }
  }, [loadData]);

  return {
    isFormOpen, setIsFormOpen,
    editingRegional, setEditingRegional,
    handleSaveRegional,
    handleEdit,
    handleDelete,
  };
}